const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const { emitToCooperative, emitToAdmins, emitToCustomerUser } = require('../services/socketService');

// Fixed interest rates per loan type (used for member applications so the
// EMI is computed on the server and can't be tampered with by the client).
const INTEREST_RATES = { Agriculture: 12, Business: 14, Housing: 11, Personal: 16, Education: 10, Equipment: 13 };

const calcEMI = (principal, annualRate, months) => {
  const P = Number(principal) || 0;
  const r = (Number(annualRate) || 0) / 12 / 100;
  const n = Number(months) || 1;
  if (P <= 0 || n <= 0) return 0;
  if (r === 0) return Math.round(P / n);
  return Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
};

const genLoanNo = () => `LN-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
};

exports.getLoans = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { cooperativeId: req.user.cooperativeId };
    const loans = await Loan.find(filter).populate('customerId', 'name phone');
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('customerId', 'name phone email');
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    if (req.user.role !== 'admin' && String(loan.cooperativeId) !== String(req.user.cooperativeId)) {
      return res.status(403).json({ message: 'Not authorized to view this loan' });
    }
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLoan = async (req, res) => {
  try {
    const loanData = { ...req.body };
    if (req.user.role !== 'admin') {
      loanData.cooperativeId = req.user.cooperativeId;
    }
    const loan = new Loan({
      ...loanData,
      loanNo: genLoanNo(),
      applyDate: new Date().toISOString().split('T')[0],
      totalEmis: loanData.totalEmis || loanData.tenure || 0
    });
    const createdLoan = await loan.save();
    emitToCooperative(createdLoan.cooperativeId, 'loan:created', createdLoan);
    emitToAdmins('loan:created', createdLoan);
    res.status(201).json(createdLoan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Apply for a loan as a member
// @route   POST /api/loans/apply
// @access  Private (member only)
exports.applyForLoan = async (req, res) => {
  try {
    const { customerId, cooperativeId } = req.user;
    if (!customerId || !cooperativeId) {
      return res.status(400).json({ message: 'You must join a cooperative before applying for a loan' });
    }

    const { type, amount, tenure, purpose, monthlyIncome } = req.body;
    if (!type || !amount || !tenure) {
      return res.status(400).json({ message: 'Loan type, amount and tenure are required' });
    }
    if (!INTEREST_RATES[type]) {
      return res.status(400).json({ message: 'Invalid loan type' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(400).json({ message: 'Customer profile not found' });
    }

    // Every member has an automatically-created savings account (created on
    // membership approval). EMI repayments are sourced from this account.
    const { getOrCreateSavingsAccount } = require('../services/accountService');
    const account = await getOrCreateSavingsAccount(customer, cooperativeId);
    const accountNo = account.accountNo;

    const interestRate = INTEREST_RATES[type];
    const totalEmis = Number(tenure);
    const emiAmount = calcEMI(amount, interestRate, totalEmis);

    const loan = new Loan({
      loanNo: genLoanNo(),
      customerId,
      customerName: customer.name,
      accountNo,
      type,
      amount: Number(amount),
      interestRate,
      tenure: totalEmis,
      emiAmount,
      totalEmis,
      status: 'pending',
      applyDate: new Date().toISOString().split('T')[0],
      branch: customer.branch || 'Head Office',
      purpose,
      monthlyIncome: monthlyIncome ? Number(monthlyIncome) : undefined,
      cooperativeId
    });

    const createdLoan = await loan.save();
    emitToCooperative(createdLoan.cooperativeId, 'loan:created', createdLoan);
    emitToAdmins('loan:created', createdLoan);
    res.status(201).json(createdLoan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update loan status (approve / hold / reject / resume)
// @route   PUT /api/loans/:id/status
// @access  Private (manager/admin only)
exports.updateLoanStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'pending', 'on_hold', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    // Manager can only act on loans belonging to their cooperative
    if (req.user.role !== 'admin' && String(loan.cooperativeId) !== String(req.user.cooperativeId)) {
      return res.status(403).json({ message: 'Not authorized to manage this loan' });
    }

    loan.status = status;

    if (status === 'active') {
      loan.approveDate = new Date().toISOString().split('T')[0];
      loan.approvedBy = req.user.name;
      loan.disbursed = loan.amount;
      loan.outstanding = loan.amount;
      loan.nextEmiDate = addMonths(new Date(), 1);
      loan.rejectionReason = undefined;
    } else if (status === 'rejected') {
      loan.rejectionReason = req.body.rejectionReason || '';
    } else if (status === 'pending') {
      // Resume from hold -> back to pending review
      loan.rejectionReason = undefined;
    }

    const updatedLoan = await loan.save();
    emitToCooperative(updatedLoan.cooperativeId, 'loan:updated', updatedLoan);
    emitToAdmins('loan:updated', updatedLoan);
    emitToCustomerUser(updatedLoan.customerId, 'loan:updated', updatedLoan);
    res.json(updatedLoan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (loan) {
      loan.status = 'active';
      loan.approveDate = new Date().toISOString().split('T')[0];
      loan.approvedBy = req.user.name;
      loan.disbursed = loan.amount;
      loan.outstanding = loan.amount;
      loan.nextEmiDate = addMonths(new Date(), 1);
      const updatedLoan = await loan.save();
      emitToCooperative(updatedLoan.cooperativeId, 'loan:updated', updatedLoan);
      emitToAdmins('loan:updated', updatedLoan);
      emitToCustomerUser(updatedLoan.customerId, 'loan:updated', updatedLoan);
      res.json(updatedLoan);
    } else {
      res.status(404).json({ message: 'Loan not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.predictEligibility = async (req, res) => {
  try {
    const { amount, monthlyIncome, accountNo } = req.body;

    // Simplistic Loan Prediction Logic
    let score = 50; // Base score
    let eligible = false;
    let message = 'Loan request is risky based on current parameters.';

    // Rule 1: Income to Loan Amount Ratio
    if (monthlyIncome && amount) {
      const ratio = amount / monthlyIncome;
      if (ratio < 10) {
        score += 30; // Very safe
      } else if (ratio < 20) {
        score += 15; // Moderate
      } else {
        score -= 20; // High risk
      }
    }

    // Final decision
    if (score >= 70) {
      eligible = true;
      message = 'High probability of approval.';
    } else if (score >= 50) {
      eligible = true; // Marginal
      message = 'Moderate probability of approval, requires manual review.';
    }

    res.json({
      eligible,
      score,
      message,
      requestedAmount: amount,
      monthlyIncome
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
