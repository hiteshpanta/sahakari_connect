const mongoose = require('mongoose');

const loanRepaymentSchema = new mongoose.Schema({
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  loanNo: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  type: { type: String, enum: ['EMI', 'Prepayment', 'Settlement'], default: 'EMI' },
  staff: { type: String },
  status: { type: String, enum: ['paid', 'pending', 'failed'], default: 'paid' },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true }
}, { timestamps: true });

module.exports = mongoose.model('LoanRepayment', loanRepaymentSchema);
