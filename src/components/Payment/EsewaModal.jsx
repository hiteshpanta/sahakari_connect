import React, { useState, useEffect } from 'react';
import { X, Wallet, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { useCreatePaymentIntentMutation, useCompleteEsewaPaymentMutation } from '../../store/mainApi';

const ESEWA_GREEN = '#60BB46';
const ESEWA_DARK = '#3E8E2E';

const purposeMeta = {
  savings_deposit: { title: 'Deposit to Savings Account', label: 'Account Deposit' },
  withdrawal: { title: 'Withdraw to eSewa Wallet', label: 'Withdrawal' },
  loan_installment: { title: 'Pay Loan Installment', label: 'Loan Installment' }
};

export default function EsewaModal({ isOpen, onClose, amount, purpose, entityId, entityModel, onSuccess, account, loan }) {
  const { currentUser } = useAuth();
  const [step, setStep] = useState('checkout'); // checkout | processing | success | error
  const [paymentId, setPaymentId] = useState(null);
  const [walletNo, setWalletNo] = useState(currentUser?.phone || '98XXXXXXXX');
  const [inputAmount, setInputAmount] = useState(amount || '');
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const [completeEsewaPayment] = useCompleteEsewaPaymentMutation();

  const meta = purposeMeta[purpose] || { title: 'Online Payment', label: 'Payment' };

  const maxAmount = purpose === 'withdrawal' ? (account?.balance ?? 0)
    : purpose === 'loan_installment' ? (loan?.outstanding ?? amount)
    : null;

  const effectiveAmount = purpose === 'loan_installment' && loan ? Number(inputAmount || loan.emiAmount) : Number(inputAmount || amount);

  useEffect(() => {
    if (isOpen) {
      setStep('checkout');
      setError('');
      setReceipt(null);
      setInputAmount(amount || '');
      setWalletNo(currentUser?.phone || '98XXXXXXXX');
      setPaymentId(null);
    }
  }, [isOpen, amount, currentUser?.phone]);

  useEffect(() => {
    if (isOpen && !paymentId && step === 'checkout') {
      createPaymentIntent({
        provider: 'esewa',
        amount: effectiveAmount,
        purpose,
        relatedEntityId: entityId,
        entityModel: entityModel || (purpose === 'loan_installment' ? 'Loan' : 'Account'),
        ...(purpose === 'withdrawal' ? { account } : {})
      })
        .unwrap()
        .then((result) => {
          if (result.success) setPaymentId(result.paymentId);
        })
        .catch((e) => {
          const msg = e?.data?.message || e?.error || 'Failed to initialize eSewa payment';
          setError(msg);
          toast.error(msg);
        });
    }
  }, [isOpen, paymentId, step, purpose, entityId]);

  if (!isOpen) return null;

  const handlePay = () => {
    if (!paymentId) return;
    const amt = Number(inputAmount || amount);
    if (!amt || amt <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (purpose === 'withdrawal' && maxAmount != null && amt > maxAmount) {
      setError('Amount exceeds your available balance');
      return;
    }
    if (purpose === 'loan_installment' && maxAmount != null && amt > maxAmount) {
      setError('Amount exceeds the loan outstanding');
      return;
    }

    setStep('processing');
    setError('');

    completeEsewaPayment({
      paymentId,
      transactionCode: `ESEWA-${Date.now()}`,
      wallet: walletNo,
      amount: effectiveAmount
    })
      .unwrap()
      .then((completeResult) => {
        if (completeResult.success) {
          setReceipt(completeResult);
          setStep('success');
          if (onSuccess) onSuccess(completeResult);
        } else {
          setStep('error');
          setError(completeResult.message || 'Payment completion failed');
        }
      })
      .catch(() => {
        setStep('error');
        setError('Network error');
      });
  };

  const renderSuccess = () => (
    <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(96,187,70,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <CheckCircle2 size={40} color={ESEWA_GREEN} />
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Payment Successful</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
        {meta.label} of <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(effectiveAmount)}</strong> completed via eSewa
      </p>

      <div style={{ margin: '20px 0', background: 'rgba(96,187,70,0.08)', border: '1px solid rgba(96,187,70,0.25)', borderRadius: 14, padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)' }}>eSewa Transaction Code</span>
          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{receipt?.transactionCode}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)' }}>Bank Txn No</span>
          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{receipt?.txnNo}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)' }}>Account</span>
          <strong style={{ fontSize: 12 }}>{receipt?.accountNo}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)' }}>New Balance</span>
          <strong style={{ fontSize: 13, color: 'var(--emerald)' }}>{formatCurrency(receipt?.newBalance)}</strong>
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%', background: `linear-gradient(135deg, ${ESEWA_GREEN}, ${ESEWA_DARK})` }} onClick={onClose}>
        Done
      </button>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 420, background: 'var(--bg-card)', overflow: 'hidden' }}>
        {/* eSewa header */}
        <div style={{ background: `linear-gradient(135deg, ${ESEWA_GREEN}, ${ESEWA_DARK})`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={19} color={ESEWA_DARK} />
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>eSewa</p>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>Digital Wallet Payment</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 20px 24px' }}>
          {step === 'success' ? renderSuccess() : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{meta.title}</p>
                <h3 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  Rs. {Number(effectiveAmount).toLocaleString()}
                </h3>
                {purpose === 'withdrawal' && (
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                    Available balance: {formatCurrency(account?.balance)}
                  </p>
                )}
                {purpose === 'loan_installment' && loan && (
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                    Outstanding: {formatCurrency(loan.outstanding)} • EMI: {formatCurrency(loan.emiAmount)}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">Amount (NPR)</label>
                  <input
                    type="number"
                    className="glass-input"
                    style={{ width: '100%' }}
                    min="1"
                    max={maxAmount ?? undefined}
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">eSewa Wallet Number</label>
                  <input
                    type="text"
                    className="glass-input"
                    style={{ width: '100%' }}
                    value={walletNo}
                    onChange={(e) => setWalletNo(e.target.value)}
                    placeholder="98XXXXXXXX"
                  />
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', background: `linear-gradient(135deg, ${ESEWA_GREEN}, ${ESEWA_DARK})`, fontSize: 15, fontWeight: 700 }}
                  onClick={handlePay}
                  disabled={step === 'processing' || !paymentId}
                >
                  {step === 'processing' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Loader2 size={17} className="spin" /> Processing via eSewa...</span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={17} /> Pay {formatCurrency(effectiveAmount)}</span>
                  )}
                </button>

                {error && <div className="info-box danger" style={{ marginTop: 4 }}>{error}</div>}

                <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                  Demo eSewa checkout. No real money moves — this simulates the eSewa payment flow for this environment.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
