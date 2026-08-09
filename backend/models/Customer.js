const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String, required: true },
  branch: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dob: { type: Date },
  citizenshipNo: { type: String },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive', 'pending_approval', 'on_hold', 'rejected'], default: 'active' },
  photo: { type: String },
  whatsapp: { type: String },
  smsEnabled: { type: Boolean, default: true },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Platform user who applied for this membership
  
  // KYC & Digital Membership Fields
  nomineeName: { type: String },
  nomineeRelation: { type: String },
  nomineePhone: { type: String },
  documents: {
    citizenshipFront: { type: String },
    citizenshipBack: { type: String },
    photo: { type: String },
    signature: { type: String },
    addressProof: { type: String }
  },
  rejectionReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
