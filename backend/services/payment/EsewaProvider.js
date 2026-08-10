const crypto = require('crypto');
const PaymentStrategy = require('./PaymentStrategy');

/**
 * eSewa (Nepal) payment provider.
 *
 * Implements the eSewa gateway flow: a signed payment initiation (PID),
 * followed by a signed response from the gateway carrying a transaction
 * code. Without live merchant credentials the provider runs in a
 * deterministic simulation mode — the same signed-message protocol is used
 * so real credentials can be dropped in later via environment variables.
 *
 * eSewa new-API signature (2023+):
 *   message = `${total_amount},${transaction_uuid},${product_code}`
 *   signature = base64( HMAC_SHA256(secret_key, message) )
 */
class EsewaProvider extends PaymentStrategy {
  constructor({ secretKey, productCode } = {}) {
    super();
    this.secretKey = secretKey || process.env.ESEWA_SECRET_KEY || 'dev-esewa-secret-key';
    this.productCode = productCode || process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
  }

  buildMessage(totalAmount, transactionUuid, productCode) {
    return `${totalAmount},${transactionUuid},${productCode}`;
  }

  sign(fields) {
    const message = this.buildMessage(fields.total_amount, fields.transaction_uuid, fields.product_code);
    const hash = crypto.createHmac('sha256', this.secretKey).update(message).digest();
    return Buffer.from(hash).toString('base64');
  }

  verifySignature(fields, signature) {
    const expected = this.sign(fields);
    const a = Buffer.from(expected, 'base64');
    const b = Buffer.from(signature || '', 'base64');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }

  async createPaymentIntent(amount, currency = 'NPR', metadata = {}) {
    const transactionUuid = `${Date.now()}-${crypto.randomUUID()}`;
    const pid = `PID-${transactionUuid}`;

    // eSewa expects amounts in paisa for the signed message.
    const totalAmount = Math.round(Number(amount) * 100);

    const signature = this.sign({
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: this.productCode
    });

    return {
      success: true,
      providerId: pid,
      transactionUuid,
      signature,
      esewa: {
        merchant_code: this.productCode,
        transaction_uuid: transactionUuid,
        pid,
        amt: totalAmount,
        txAmt: 0,
        psc: 0,
        pdc: 0,
        tAmt: totalAmount,
        currency: 'NPR',
        signature
      }
    };
  }

  async verifyPayment(paymentId) {
    // Without a live gateway, verification is done against our stored
    // payment record (looked up by the provider PID).
    try {
      const Payment = require('../../models/Payment');
      const payment = await Payment.findOne({ providerPaymentId: paymentId });
      return { success: true, status: payment ? payment.status : 'not_found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Simulates the signed response eSewa posts back on success.
  buildSuccessResponse({ total_amount, transaction_uuid, transaction_code }) {
    const totalAmount = Math.round(Number(total_amount) * 100);
    const signature = this.sign({
      total_amount: totalAmount,
      transaction_uuid,
      product_code: this.productCode
    });
    return {
      total_amount: totalAmount,
      transaction_uuid,
      product_code: this.productCode,
      transaction_code,
      signature
    };
  }

  handleWebhook(payload, signature) {
    try {
      if (!this.verifySignature(payload, signature)) {
        return { success: false, error: 'Invalid signature' };
      }
      return { success: true, event: payload };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = EsewaProvider;
