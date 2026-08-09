const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
  requestNo: { type: String, required: true, unique: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  accountNo: { type: String, required: true },
  customerName: { type: String, required: true },
  amount: { type: Number, required: true },
  branch: { type: String },
  remarks: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestedBy: { type: String },
  approvedBy: { type: String },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true }
}, { timestamps: true });

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
