class PaymentStrategy {
  constructor() {
    if (this.constructor === PaymentStrategy) {
      throw new Error("Cannot instantiate abstract class");
    }
  }

  async createPaymentIntent(amount, currency, metadata) {
    throw new Error("Method 'createPaymentIntent()' must be implemented.");
  }

  async verifyPayment(paymentId) {
    throw new Error("Method 'verifyPayment()' must be implemented.");
  }

  async handleWebhook(req) {
    throw new Error("Method 'handleWebhook()' must be implemented.");
  }
}

module.exports = PaymentStrategy;
