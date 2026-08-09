const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  loanNo: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, required: true },
  accountNo: { type: String, required: true },
  type: { type: String, enum: ['Agriculture', 'Business', 'Housing', 'Personal', 'Education', 'Equipment'], required: true },
  amount: { type: Number, required: true },
  disbursed: { type: Number, default: 0 },
  outstanding: { type: Number, default: 0 },
  interestRate: { type: Number, required: true },
  tenure: { type: Number, required: true }, // in months
  emiAmount: { type: Number, required: true },
  status: { type: String, enum: ['active', 'closed', 'pending', 'on_hold', 'rejected'], default: 'pending' },
  applyDate: { type: String, required: true },
  approveDate: { type: String },
  disbursedDate: { type: String },
  nextEmiDate: { type: String },
  paidEmis: { type: Number, default: 0 },
  totalEmis: { type: Number, required: true },
  approvedBy: { type: String },
  branch: { type: String, required: true },
  purpose: { type: String },
  rejectionReason: { type: String },
  monthlyIncome: { type: Number },
  predictedEligibilityScore: { type: Number },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);
