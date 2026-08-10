import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreatePaymentIntentMutation } from '../../store/mainApi';

// Make sure to call loadStripe outside of a component’s render to avoid recreating the Stripe object on every render.
// In a real app, you would use an env variable for the public key.
// For demo purposes, we will load it if provided, or handle the lack of it gracefully.
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY?.trim();
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

export default function PaymentModal({ isOpen, onClose, amount, purpose, entityId, onSuccess }) {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [createPaymentIntent] = useCreatePaymentIntentMutation();

  useEffect(() => {
    if (isOpen && amount > 0) {
      setLoading(true);
      createPaymentIntent({ amount, purpose, relatedEntityId: entityId })
        .unwrap()
        .then((result) => {
          if (result.success) {
            setClientSecret(result.clientSecret);
          } else {
            toast.error(result.message || result.error || 'Failed to initialize payment');
            onClose();
          }
        })
        .catch(() => {
          toast.error('Failed to initialize payment');
          onClose();
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, amount, purpose, entityId]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '450px', background: 'var(--bg-card)' }}>
        <div className="card-header" style={{ marginBottom: '24px' }}>
          <h2 className="card-title">Online Payment</h2>
          <button onClick={onClose} className="btn-icon" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Amount to Pay</p>
          <h3 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--emerald)' }}>
            Rs. {amount.toLocaleString()}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'capitalize' }}>
            For: {purpose.replace('_', ' ')}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: 'var(--text-muted)' }}>Loading payment provider...</p>
          </div>
        ) : clientSecret && stripePromise ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm clientSecret={clientSecret} onSuccess={onSuccess} onCancel={onClose} />
          </Elements>
        ) : (
          <div className="info-box danger">
            <p>Payment system is currently unavailable or Stripe keys are missing.</p>
            <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '12px' }}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
