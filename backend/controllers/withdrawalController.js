const WithdrawalRequest = require('../models/WithdrawalRequest');
const Account = require('../models/Account');
const transactionService = require('../services/transactionService');
const { emitToCooperative, emitToAdmins, emitToCustomerUser } = require('../services/socketService');

// @desc    Get withdrawal requests (scoped to the user's cooperative)
// @route   GET /api/withdrawals
// @access  Private
exports.getWithdrawalRequests = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { cooperativeId: req.user.cooperativeId };
    const requests = await WithdrawalRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a withdrawal request (requires manager approval to complete)
// @route   POST /api/withdrawals
// @access  Private
exports.createWithdrawalRequest = async (req, res) => {
  try {
    const { accountId, amount, remarks } = req.body;
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    if (String(account.cooperativeId) !== String(req.user.cooperativeId)) {
      return res.status(403).json({ message: 'Account does not belong to your cooperative' });
    }

    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({ message: 'Enter a valid amount' });
    }
    if (account.balance < amountNum) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const request = new WithdrawalRequest({
      requestNo: `WD${Date.now()}`,
      accountId: account._id,
      accountNo: account.accountNo,
      customerName: account.customerName,
      amount: amountNum,
      branch: account.branch,
      remarks,
      requestedBy: req.user.name,
      cooperativeId: account.cooperativeId
    });

    const created = await request.save();
    emitToCooperative(created.cooperativeId, 'withdrawal:created', created);
    emitToAdmins('withdrawal:created', created);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Approve a withdrawal request and execute the withdrawal
// @route   PUT /api/withdrawals/:id/approve
// @access  Private (Manager/Admin)
exports.approveWithdrawalRequest = async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, cooperativeId: req.user.cooperativeId };
    const request = await WithdrawalRequest.findOne(filter);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    const transaction = await transactionService.createTransaction(
      {
        accountNo: request.accountNo,
        type: 'Withdrawal',
        amount: request.amount,
        remarks: request.remarks || 'Approved withdrawal request'
      },
      req.user
    );

    request.status = 'approved';
    request.approvedBy = req.user.name;
    request.approvedAt = new Date();
    await request.save();
    emitToCooperative(request.cooperativeId, 'withdrawal:updated', request);
    emitToAdmins('withdrawal:updated', request);
    if (transaction) {
      emitToCooperative(transaction.cooperativeId, 'transaction:created', transaction);
      emitToCustomerUser(transaction.customerId, 'transaction:created', transaction);
    }
    res.json(request);
  } catch (error) {
    if (error.message === 'Account not found') return res.status(404).json({ message: error.message });
    if (error.message === 'Insufficient balance') return res.status(400).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a withdrawal request
// @route   PUT /api/withdrawals/:id/reject
// @access  Private (Manager/Admin)
exports.rejectWithdrawalRequest = async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, cooperativeId: req.user.cooperativeId };
    const request = await WithdrawalRequest.findOne(filter);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    request.status = 'rejected';
    request.rejectionReason = req.body.rejectionReason || '';
    request.approvedBy = req.user.name;
    request.approvedAt = new Date();
    await request.save();
    emitToCooperative(request.cooperativeId, 'withdrawal:updated', request);
    emitToAdmins('withdrawal:updated', request);
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
