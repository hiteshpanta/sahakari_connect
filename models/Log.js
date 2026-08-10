const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  type: { type: String, enum: ['SMS', 'WhatsApp'], required: true },
  phone: { type: String, required: true },
  customerName: { type: String },
  command: { type: String }, // for SMS
  message: { type: String }, // for WhatsApp
  response: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['delivered', 'failed', 'sent'], required: true },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);
