const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  accountNo: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, required: true },
  type: { type: String, enum: ['Savings', 'Current', 'Fixed Deposit'], required: true },
  branch: { type: String, required: true },
  balance: { type: Number, default: 0 },
  openDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'frozen', 'closed'], default: 'active' },
  interestRate: { type: Number, default: 0 },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
