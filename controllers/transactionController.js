const transactionService = require('../services/transactionService');
const Transaction = require('../models/Transaction');
const { emitToCooperative, emitToCustomerUser } = require('../services/socketService');

exports.getTransactions = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { cooperativeId: req.user.cooperativeId };
    const transactions = await transactionService.getTransactions(filter);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

exports.getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (req.user.role !== 'admin' && String(transaction.cooperativeId) !== String(req.user.cooperativeId)) {
      return res.status(403).json({ message: 'Not authorized to view this transaction' });
    }
    res.json(transaction);
  } catch (error) {
    next(error);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const createdTransaction = await transactionService.createTransaction(req.body, req.user);
    emitToCooperative(createdTransaction.cooperativeId, 'transaction:created', createdTransaction);
    emitToCustomerUser(createdTransaction.customerId, 'transaction:created', createdTransaction);
    res.status(201).json(createdTransaction);
  } catch (error) {
    if (error.message === 'Account not found') {
       return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Insufficient balance') {
       return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};
