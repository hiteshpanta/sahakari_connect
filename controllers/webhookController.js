const StripeProvider = require('../services/payment/StripeProvider');
const Payment = require('../models/Payment');
const paymentService = require('../services/paymentService');
const sendEmail = require('../utils/sendEmail');

// For handling Stripe webhooks
exports.stripeWebhook = async (req, res) => {
  const stripeProvider = new StripeProvider(); // In reality, fetch secret based on tenant if needed
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Note: Stripe requires the raw body, so express.raw() middleware should be applied for this route
  const sig = req.headers['stripe-signature'];

  let eventResult = await stripeProvider.handleWebhook(req.body, sig, endpointSecret);

  if (!eventResult.success) {
    return res.status(400).send(`Webhook Error: ${eventResult.error}`);
  }

  const event = eventResult.event;

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent.id);
      break;
    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      await handleFailedPayment(failedIntent.id);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};

async function handleSuccessfulPayment(providerPaymentId) {
  const payment = await Payment.findOne({ providerPaymentId });
  if (!payment) return;

  let receiptData = null;

  try {
    const receipt = await paymentService.finalizePayment(payment);

    if (receipt && !receipt.skipped && receipt.entityLabel) {
      const customer = await Payment.populate(payment, { path: 'customerId', select: 'email' });
      receiptData = {
        email: customer.customerId?.email,
        subject: payment.purpose === 'loan_installment' ? 'Loan Installment Received' : 'Deposit Received',
        message: `We received your payment of ${payment.amount} for ${receipt.entityLabel}.`
      };
    }
  } catch (err) {
    console.error('Failed to finalize payment:', err);
  }

  // Send Email Receipt
  if (receiptData && receiptData.email) {
    try {
      await sendEmail({
        email: receiptData.email,
        subject: receiptData.subject,
        message: receiptData.message,
        tenantName: 'Platform' // Can be fetched from CooperativeProfile in real-world
      });
    } catch (err) {
      console.error('Failed to send receipt email:', err);
    }
  }
}

async function handleFailedPayment(providerPaymentId) {
  const payment = await Payment.findOne({ providerPaymentId });
  if (!payment) return;

  payment.status = 'failed';
  await payment.save();
}
