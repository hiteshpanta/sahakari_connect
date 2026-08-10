import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

export default function CheckoutForm({ clientSecret, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });

    if (payload.error) {
      setError(`Payment failed: ${payload.error.message}`);
      setProcessing(false);
      toast.error(payload.error.message);
    } else {
      setError(null);
      setProcessing(false);
      onSuccess(payload.paymentIntent);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div style={{ marginBottom: '20px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)' }}>
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#F1F5F9', // text-primary
              '::placeholder': {
                color: '#64748B', // text-muted
              },
            },
            invalid: {
              color: '#EF4444',
            },
          },
        }} />
      </div>
      {error && <div className="info-box danger" style={{ marginBottom: '16px' }}>{error}</div>}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={processing}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={processing || !stripe}>
          {processing ? 'Processing...' : 'Confirm Payment'}
        </button>
      </div>
    </form>
  );
}
