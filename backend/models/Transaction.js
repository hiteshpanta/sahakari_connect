const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  txnNo: { type: String, required: true, unique: true },
  accountNo: { type: String, required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, required: true },
  type: { type: String, enum: ['Deposit', 'Withdrawal', 'Transfer', 'Interest Credit', 'Loan Payment'], required: true },
  amount: { type: Number, required: true },
  balance: { type: Number, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  branch: { type: String, required: true },
  staff: { type: String },
  remarks: { type: String },
  paymentMethod: { type: String, enum: ['cash', 'esewa', 'stripe', 'bank_transfer'], default: 'cash' },
  transactionCode: { type: String },
  status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
  isFraudulent: { type: Boolean, default: false },
  fraudReason: { type: String },
  riskScore: { type: Number, default: 0 },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
