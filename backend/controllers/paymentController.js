const StripeProvider = require('../services/payment/StripeProvider');
const EsewaProvider = require('../services/payment/EsewaProvider');
const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const Account = require('../models/Account');
const Loan = require('../models/Loan');
const paymentService = require('../services/paymentService');
const AppError = require('../utils/appError');

// @desc    Create a payment intent (Stripe or eSewa)
// @route   POST /api/payments/intent
// @access  Private (Member)
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { amount, purpose, relatedEntityId, entityModel, provider = 'stripe' } = req.body;
  const cooperativeId = req.user?.cooperativeId || (req.tenant && req.tenant.cooperativeId) || req.cooperativeId;

  if (!req.user || req.user.role !== 'member') {
    return next(new AppError('Only members can initiate payments', 403));
  }

  const customerId = req.user.customerId;
  if (!customerId) {
    return next(new AppError('Customer profile not found for this user', 404));
  }

  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return next(new AppError('Invalid payment amount', 400));
  }

  // For account-based purposes, make sure the entity actually belongs to this member.
  if (purpose === 'savings_deposit' || purpose === 'withdrawal') {
    const account = await Account.findById(relatedEntityId);
    if (!account || String(account.customerId) !== String(customerId) || String(account.cooperativeId) !== String(cooperativeId)) {
      return next(new AppError('Account not found for this member', 400));
    }
    if (purpose === 'withdrawal' && account.balance < numAmount) {
      return next(new AppError('Insufficient balance for withdrawal', 400));
    }
  } else if (purpose === 'loan_installment') {
    const loan = await Loan.findById(relatedEntityId);
    if (!loan || String(loan.customerId) !== String(customerId) || String(loan.cooperativeId) !== String(cooperativeId)) {
      return next(new AppError('Loan not found for this member', 400));
    }
  } else if (!['membership_fee', 'other'].includes(purpose)) {
    return next(new AppError('Invalid payment purpose', 400));
  }

  if (provider === 'esewa') {
    const esewaProvider = new EsewaProvider();
    const intentResult = await esewaProvider.createPaymentIntent(numAmount, 'NPR', {
      customerId: customerId.toString(),
      cooperativeId: cooperativeId.toString(),
      purpose,
      relatedEntityId: relatedEntityId ? relatedEntityId.toString() : ''
    });

    if (!intentResult.success) {
      return next(new AppError(intentResult.error, 400));
    }

    const payment = await Payment.create({
      cooperativeId,
      customerId,
      paymentProvider: 'esewa',
      providerPaymentId: intentResult.providerId,
      transactionUuid: intentResult.transactionUuid,
      signature: intentResult.signature,
      amount: numAmount,
      currency: 'NPR',
      purpose,
      relatedEntityId,
      entityModel,
      status: 'pending'
    });

    return res.status(200).json({
      success: true,
      provider: 'esewa',
      paymentId: payment._id,
      esewa: intentResult.esewa
    });
  }

  // Default: Stripe
  const currency = 'usd';
  const stripeProvider = new StripeProvider();
  const intentResult = await stripeProvider.createPaymentIntent(numAmount, currency, {
    customerId: customerId.toString(),
    cooperativeId: cooperativeId.toString(),
    purpose,
    relatedEntityId: relatedEntityId ? relatedEntityId.toString() : ''
  });

  if (!intentResult.success) {
    return next(new AppError(intentResult.error, 400));
  }

  const payment = await Payment.create({
    cooperativeId,
    customerId,
    paymentProvider: 'stripe',
    providerPaymentId: intentResult.providerId,
    amount: numAmount,
    currency,
    purpose,
    relatedEntityId,
    entityModel,
    status: 'pending'
  });

  res.status(200).json({
    success: true,
    clientSecret: intentResult.clientSecret,
    paymentId: payment._id
  });
});

// @desc    Complete a simulated eSewa payment
// @route   POST /api/payments/esewa/complete
// @access  Private (Member)
exports.completeEsewaPayment = asyncHandler(async (req, res, next) => {
  const { paymentId } = req.body;
  const cooperativeId = req.user?.cooperativeId || (req.tenant && req.tenant.cooperativeId) || req.cooperativeId;

  if (!req.user || req.user.role !== 'member') {
    return next(new AppError('Only members can complete payments', 403));
  }

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }
  if (payment.paymentProvider !== 'esewa') {
    return next(new AppError('Not an eSewa payment', 400));
  }
  if (String(payment.customerId) !== String(req.user.customerId) ||
      String(payment.cooperativeId) !== String(cooperativeId)) {
    return next(new AppError('Not authorized to complete this payment', 403));
  }

  // Simulate the gateway verification step (real integration would call
  // the eSewa lookup API here). Then produce the signed response eSewa
  // would return, including the gateway transaction code.
  const esewaProvider = new EsewaProvider();
  const verified = await esewaProvider.verifyPayment(payment.providerPaymentId);
  if (!verified.success) {
    return next(new AppError('eSewa could not verify this payment', 400));
  }

  const transactionCode = `E${Date.now()}`;
  const signedResponse = esewaProvider.buildSuccessResponse({
    total_amount: payment.amount,
    transaction_uuid: payment.transactionUuid,
    transaction_code: transactionCode
  });

  payment.transactionCode = transactionCode;
  payment.signature = signedResponse.signature;

  let receipt;
  try {
    receipt = await paymentService.finalizePayment(payment);
  } catch (error) {
    return next(new AppError(error.message, 400));
  }

  if (receipt.skipped) {
    return res.status(200).json({
      success: true,
      alreadyProcessed: true,
      paymentId: payment._id,
      transactionCode
    });
  }

  res.status(200).json({
    success: true,
    provider: 'esewa',
    paymentId: payment._id,
    transactionCode,
    signature: signedResponse.signature,
    txnNo: receipt.txnNo,
    accountNo: receipt.accountNo,
    newBalance: receipt.newBalance,
    entityLabel: receipt.entityLabel
  });
});

// @desc    Get payment history for customer
// @route   GET /api/payments/history
// @access  Private (Member)
exports.getPaymentHistory = asyncHandler(async (req, res, next) => {
  const cooperativeId = req.user?.cooperativeId || (req.tenant && req.tenant.cooperativeId) || req.cooperativeId;

  if (!req.user || req.user.role !== 'member') {
    return next(new AppError('Only members can view payment history', 403));
  }

  const payments = await Payment.find({
    cooperativeId,
    customerId: req.user.customerId
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: payments
  });
});

