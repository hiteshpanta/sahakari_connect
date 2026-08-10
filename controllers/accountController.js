const Account = require('../models/Account');
const { emitToCooperative, emitToAdmins } = require('../services/socketService');

exports.getAccounts = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { cooperativeId: req.user.cooperativeId };
    const accounts = await Account.find(filter).populate('customerId', 'name phone');
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAccountById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (account) {
      res.json(account);
    } else {
      res.status(404).json({ message: 'Account not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAccount = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      req.body.cooperativeId = req.user.cooperativeId;
    }
    const account = new Account(req.body);
    const createdAccount = await account.save();
    emitToCooperative(createdAccount.cooperativeId, 'account:created', createdAccount);
    emitToAdmins('account:created', createdAccount);
    res.status(201).json(createdAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
