const Payment = require('../models/Payment');
const Account = require('../models/Account');
const Loan = require('../models/Loan');
const LoanRepayment = require('../models/LoanRepayment');
const Transaction = require('../models/Transaction');
const CooperativeProfile = require('../models/CooperativeProfile');
const { emitToCooperative, emitToCustomerUser } = require('./socketService');

const generateTxnNo = () => `TXN${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;

// Keep the cooperative's aggregate financial data in sync so the manager
// side always reflects real member activity (eSewa, Stripe, cash...).
exports.updateCooperativeStats = async (cooperativeId, delta = {}) => {
  const inc = {};
  if (delta.totalDeposits) inc['stats.totalDeposits'] = delta.totalDeposits;
  if (delta.totalWithdrawals) inc['stats.totalWithdrawals'] = delta.totalWithdrawals;
  if (delta.totalLoanCollections) inc['stats.totalLoanCollections'] = delta.totalLoanCollections;

  if (Object.keys(inc).length === 0) return null;

  return CooperativeProfile.findOneAndUpdate(
    { cooperativeId },
    { $inc: inc },
    { returnDocument: 'after', upsert: true }
  );
};

async function createTransactionRecord({
  accountId, accountNo, customerId, customerName, type, amount, balance,
  date, time, branch, remarks, cooperativeId, paymentMethod = 'cash',
  transactionCode, staff
}) {
  return Transaction.create({
    txnNo: generateTxnNo(),
    accountNo,
    accountId,
    customerId,
    customerName,
    type,
    amount,
    balance,
    date,
    time,
    branch,
    staff,
    remarks,
    status: 'completed',
    cooperativeId,
    paymentMethod,
    transactionCode
  });
}

const addMonth = (value) => {
  const d = new Date(value || Date.now());
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
};

/**
 * Run the business logic for a successful payment and mark it completed.
 * Idempotent: payments already completed are skipped.
 */
exports.finalizePayment = async (payment) => {
  if (payment.status === 'completed') {
    return { skipped: true };
  }

  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];
  const transactionCode = payment.transactionCode || payment.providerPaymentId;
  const methodLabel = payment.paymentProvider === 'esewa' ? 'eSewa' : payment.paymentProvider === 'stripe' ? 'Stripe' : 'Online';

  let receipt = null;
  let createdTxn = null;

  if (payment.purpose === 'loan_installment') {
    const loan = await Loan.findById(payment.relatedEntityId);
    if (!loan || loan.status !== 'active') {
      throw new Error('Loan not found or not active');
    }

    const payAmount = Math.min(Number(payment.amount), Number(loan.outstanding));
    if (payAmount <= 0) {
      throw new Error('Loan is already fully paid');
    }

    loan.outstanding = Math.round((loan.outstanding - payAmount) * 100) / 100;
    loan.paidEmis += 1;
    if (loan.outstanding <= 0) loan.status = 'closed';
    loan.nextEmiDate = addMonth(loan.nextEmiDate);
    await loan.save();

    await LoanRepayment.create({
      loanId: loan._id,
      loanNo: loan.loanNo,
      amount: payAmount,
      date,
      type: 'EMI',
      status: 'paid',
      cooperativeId: payment.cooperativeId
    });

    const account = await Account.findOne({
      accountNo: loan.accountNo,
      cooperativeId: payment.cooperativeId
    });

    const txn = await createTransactionRecord({
      accountId: account ? account._id : loan._id,
      accountNo: loan.accountNo,
      customerId: payment.customerId,
      customerName: loan.customerName,
      type: 'Loan Payment',
      amount: payAmount,
      balance: loan.outstanding,
      date, time,
      branch: loan.branch,
      remarks: `Loan installment paid via ${methodLabel}`,
      cooperativeId: payment.cooperativeId,
      paymentMethod: payment.paymentProvider === 'esewa' ? 'esewa' : payment.paymentProvider === 'stripe' ? 'stripe' : 'cash',
      transactionCode
    });

    await exports.updateCooperativeStats(payment.cooperativeId, {
      totalLoanCollections: payAmount
    });

    createdTxn = txn;
    receipt = {
      txnNo: txn.txnNo,
      accountNo: loan.accountNo,
      newBalance: loan.outstanding,
      entityLabel: `Loan ${loan.loanNo}`
    };
  } else if (payment.purpose === 'savings_deposit') {
    const account = await Account.findById(payment.relatedEntityId);
    if (!account) throw new Error('Account not found');

    account.balance = Math.round((account.balance + Number(payment.amount)) * 100) / 100;
    await account.save();

    const txn = await createTransactionRecord({
      accountId: account._id,
      accountNo: account.accountNo,
      customerId: payment.customerId,
      customerName: account.customerName,
      type: 'Deposit',
      amount: payment.amount,
      balance: account.balance,
      date, time,
      branch: account.branch,
      remarks: `Online savings deposit via ${methodLabel}`,
      cooperativeId: payment.cooperativeId,
      paymentMethod: payment.paymentProvider === 'esewa' ? 'esewa' : payment.paymentProvider === 'stripe' ? 'stripe' : 'cash',
      transactionCode
    });

    await exports.updateCooperativeStats(payment.cooperativeId, {
      totalDeposits: payment.amount
    });

    createdTxn = txn;
    receipt = {
      txnNo: txn.txnNo,
      accountNo: account.accountNo,
      newBalance: account.balance,
      entityLabel: `Account ${account.accountNo}`
    };
  } else if (payment.purpose === 'withdrawal') {
    // Atomic debit so a concurrent withdrawal can't overdraw.
    const account = await Account.findOneAndUpdate(
      {
        _id: payment.relatedEntityId,
        cooperativeId: payment.cooperativeId,
        balance: { $gte: Number(payment.amount) }
      },
      { $inc: { balance: -Number(payment.amount) } },
      { returnDocument: 'after' }
    );
    if (!account) throw new Error('Insufficient balance or account not found');

    const txn = await createTransactionRecord({
      accountId: account._id,
      accountNo: account.accountNo,
      customerId: payment.customerId,
      customerName: account.customerName,
      type: 'Withdrawal',
      amount: payment.amount,
      balance: account.balance,
      date, time,
      branch: account.branch,
      remarks: `Withdrawal via ${methodLabel} wallet`,
      cooperativeId: payment.cooperativeId,
      paymentMethod: payment.paymentProvider === 'esewa' ? 'esewa' : payment.paymentProvider === 'stripe' ? 'stripe' : 'cash',
      transactionCode
    });

    await exports.updateCooperativeStats(payment.cooperativeId, {
      totalWithdrawals: payment.amount
    });

    createdTxn = txn;
    receipt = {
      txnNo: txn.txnNo,
      accountNo: account.accountNo,
      newBalance: account.balance,
      entityLabel: `Account ${account.accountNo}`
    };
  } else {
    throw new Error(`Unsupported payment purpose: ${payment.purpose}`);
  }

  payment.status = 'completed';
  await payment.save();

  emitToCooperative(payment.cooperativeId, 'payment:completed', { payment, receipt });
  emitToCustomerUser(payment.customerId, 'payment:completed', { payment, receipt });
  if (createdTxn) {
    emitToCooperative(createdTxn.cooperativeId, 'transaction:created', createdTxn);
    emitToCustomerUser(createdTxn.customerId, 'transaction:created', createdTxn);
  }

  return receipt;
};
