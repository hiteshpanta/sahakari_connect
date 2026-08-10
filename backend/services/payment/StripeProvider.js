const Stripe = require('stripe');
const PaymentStrategy = require('./PaymentStrategy');

class StripeProvider extends PaymentStrategy {
  constructor(secretKey) {
    super();
    // Usually the secret key should be specific to the cooperative if they have their own Stripe account,
    // or the platform's secret key if the platform handles all payouts.
    // For this implementation, we assume a platform key or it's passed dynamically.
    this.stripe = Stripe(secretKey || process.env.STRIPE_SECRET_KEY);
  }

  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency,
        metadata
      });
      return {
        success: true,
        providerId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      };
    } catch (error) {
      console.error('Stripe createPaymentIntent Error:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyPayment(paymentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
      return {
        success: true,
        status: paymentIntent.status // e.g., 'succeeded', 'requires_payment_method'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleWebhook(payload, signature, endpointSecret) {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
      return { success: true, event };
    } catch (err) {
      return { success: false, error: `Webhook Error: ${err.message}` };
    }
  }
}

module.exports = StripeProvider;
