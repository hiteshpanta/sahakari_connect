const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  paymentProvider: { type: String, enum: ['stripe', 'esewa', 'paypal'], required: true },
  providerPaymentId: { type: String, required: true }, // e.g., Stripe PaymentIntent ID or eSewa PID
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  purpose: { type: String, enum: ['loan_installment', 'savings_deposit', 'withdrawal', 'membership_fee', 'other'], required: true },
  relatedEntityId: { type: mongoose.Schema.Types.ObjectId, refPath: 'entityModel' }, // Optional reference to Loan, Account, etc.
  entityModel: { type: String, enum: ['Loan', 'Account', 'Customer'] },
  transactionUuid: { type: String }, // eSewa transaction_uuid (used in signed message)
  signature: { type: String },       // eSewa initiation signature
  transactionCode: { type: String }, // eSewa reference id from the gateway
  receiptUrl: { type: String }
}, { timestamps: true });

// Ensure isolation by cooperative
paymentSchema.index({ cooperativeId: 1, customerId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
