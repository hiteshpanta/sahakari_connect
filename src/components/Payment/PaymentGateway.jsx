import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCreatePaymentIntentMutation } from '../../store/mainApi';

const PaymentGateway = ({ amount, purpose, relatedEntityId, onPaymentSuccess, onPaymentFailure }) => {
  const { branding } = useTheme();
  const [provider, setProvider] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [createPaymentIntent] = useCreatePaymentIntentMutation();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const result = await createPaymentIntent({ amount, purpose, relatedEntityId, provider }).unwrap();

      if (result.success) {
        onPaymentSuccess(result.payment);
      } else {
        onPaymentFailure(result.error || 'Payment failed');
      }
    } catch (err) {
      onPaymentFailure(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto" style={{ borderColor: branding.colors.primary, borderWidth: '2px' }}>
      <h2 className="text-2xl font-semibold mb-4" style={{ color: branding.colors.primary }}>Complete Payment</h2>
      <div className="mb-4 text-lg">
        Amount to pay: <strong>${amount.toFixed(2)}</strong>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Provider</label>
        <select 
          value={provider} 
          onChange={(e) => setProvider(e.target.value)}
          className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-opacity-50"
          style={{ focusRingColor: branding.colors.secondary }}
        >
          <option value="stripe">Stripe (Credit Card)</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full py-2 px-4 rounded text-white font-medium transition-colors"
        style={{ 
          backgroundColor: branding.colors.primary,
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </div>
  );
};

export default PaymentGateway;
