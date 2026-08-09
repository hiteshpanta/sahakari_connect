const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

exports.getTransactions = async (filter) => {
  return await Transaction.find(filter).sort({ createdAt: -1 });
};

exports.createTransaction = async (data, user) => {
  const { accountNo, type, amount, remarks } = data;
  const account = await Account.findOne({ accountNo });
  
  if (!account) {
    throw new Error('Account not found');
  }

  let newBalance = account.balance;
  if (type === 'Deposit' || type === 'Interest Credit') {
    newBalance += Number(amount);
  } else if (type === 'Withdrawal' || type === 'Transfer') {
    if (account.balance < amount) {
      throw new Error('Insufficient balance');
    }
    newBalance -= Number(amount);
  }

  account.balance = newBalance;
  await account.save();

  // --- FRAUD DETECTION LOGIC ---
  let isFraudulent = false;
  let fraudReason = '';
  let riskScore = 0;

  // Rule 1: Unusually large transaction amount (e.g., > 50000)
  if (amount > 50000) {
    isFraudulent = true;
    fraudReason = 'Unusually large transaction amount.';
    riskScore += 80;
  }

  // Rule 2: High velocity of transactions (e.g., > 3 in the last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString().split('T')[0]; // Simplistic date check, but let's do a better one
  // A better check for velocity:
  const recentTransactions = await Transaction.countDocuments({
    accountId: account._id,
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
  });

  if (recentTransactions >= 3) {
    isFraudulent = true;
    fraudReason = fraudReason ? `${fraudReason} High transaction velocity.` : 'High transaction velocity.';
    riskScore += 50;
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  const transactionStatus = isFraudulent ? 'pending' : 'completed';
  // --- END FRAUD DETECTION LOGIC ---

  const transaction = new Transaction({
    txnNo: `TXN${Date.now()}`,
    accountNo: account.accountNo,
    cooperativeId: account.cooperativeId,
    accountId: account._id,
    customerId: account.customerId,
    customerName: account.customerName,
    type,
    amount,
    balance: newBalance,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
    branch: account.branch,
    staff: user.name,
    remarks,
    status: transactionStatus,
    isFraudulent,
    fraudReason,
    riskScore
  });

  return await transaction.save();
};
