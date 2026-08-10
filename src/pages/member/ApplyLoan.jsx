import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, Calculator, Sparkles, CheckCircle, Loader2, AlertCircle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePredictLoanMutation, useApplyForLoanMutation } from '../../store/mainApi';
import { formatCurrency } from '../../utils/formatters';
import { useMemberCooperative } from '../../context/MemberCooperativeContext';
import CooperativeSwitcher from '../../components/member/CooperativeSwitcher';
import { Formik } from 'formik';
import * as Yup from 'yup';

const LOAN_TYPES = ['Agriculture', 'Business', 'Housing', 'Personal', 'Education', 'Equipment'];
const INTEREST_RATES = { Agriculture: 12, Business: 14, Housing: 11, Personal: 16, Education: 10, Equipment: 13 };

const loanSchema = Yup.object({
  type: Yup.string().required('Loan type is required'),
  amount: Yup.number()
    .typeError('Enter a valid amount')
    .positive('Amount must be greater than zero')
    .min(1000, 'Minimum loan amount is NPR 1,000')
    .required('Amount is required'),
  tenure: Yup.string().required('Tenure is required'),
  purpose: Yup.string()
    .trim()
    .required('Purpose is required'),
  monthlyIncome: Yup.number()
    .typeError('Enter a valid income')
    .min(0, 'Income cannot be negative'),
});

const initialForm = {
  type: 'Personal',
  amount: '',
  tenure: '12',
  purpose: '',
  monthlyIncome: ''
};

export default function ApplyLoan() {
  const navigate = useNavigate();
  const { activeCoopId, activeCoop } = useMemberCooperative();
  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictLoan] = usePredictLoanMutation();
  const [applyLoan] = useApplyForLoanMutation();

  const hasMembership = Boolean(activeCoopId);

  const handlePredict = async (values) => {
    if (!values.amount || !values.monthlyIncome) {
      toast.error('Enter amount and monthly income to check eligibility');
      return;
    }
    setIsPredicting(true);
    try {
      const result = await predictLoan({
        type: values.type,
        amount: Number(values.amount),
        monthlyIncome: Number(values.monthlyIncome)
      }).unwrap();
      setPrediction(result);
    } catch (e) {
      toast.error(e?.data?.message || 'Prediction failed');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="glass-page animate-fade-in">
      <div className="glass-orb glass-orb-2" />
      <div className="glass-orb glass-orb-3" />

      <div className="glass-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-outline btn-icon" onClick={() => navigate('/member/loans')}><ArrowLeft size={16} /></button>
            <div>
              <h1 className="page-title">Apply for a Loan</h1>
              <p className="page-subtitle">Your application goes to the cooperative manager for review</p>
            </div>
          </div>
          <CooperativeSwitcher compact />
        </div>

        {!hasMembership ? (
          <div className="glass-card" style={{ padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, maxWidth: 520, margin: '0 auto' }}>
            <div className="glassy-stat-icon" style={{ '--icon-bg': 'rgba(6,182,212,0.14)', '--accent': '#06B6D4' }}>
              <Building2 size={26} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Join a Cooperative First</h2>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 380 }}>
              You haven't joined any cooperative yet. Loans are offered through the cooperative you belong to, so you need to become a member of one before applying.
            </p>
            <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #2A9D8F, #21867A)' }} onClick={() => navigate('/marketplace')}>
              Browse Cooperatives
            </button>
          </div>
        ) : (
          <Formik
            initialValues={initialForm}
            validationSchema={loanSchema}
            onSubmit={async (values) => {
              try {
                const result = await applyLoan({
                  type: values.type,
                  amount: Number(values.amount),
                  tenure: Number(values.tenure),
                  purpose: values.purpose.trim(),
                  monthlyIncome: values.monthlyIncome ? Number(values.monthlyIncome) : undefined,
                  cooperativeId: activeCoopId || undefined
                }).unwrap();
                toast.success(result.message || 'Loan application submitted');
                navigate('/member/loans');
              } catch (err) {
                toast.error(err?.data?.message || 'Application failed');
              }
            }}
          >
            {({ values, handleChange, handleSubmit, errors, touched, isSubmitting }) => {
              const rate = INTEREST_RATES[values.type] || 12;
              const monthlyRate = rate / 12 / 100;
              const n = parseInt(values.tenure) || 1;
              const P = parseFloat(values.amount) || 0;
              const emi = P > 0 ? Math.round((P * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)) : 0;

              const canSubmit = values.type && Number(values.amount) > 0 && Number(values.tenure) > 0 && values.purpose.trim();

              return (
                <div className="grid-2">
                  <div className="glass-card" style={{ padding: 28 }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <div className="info-box info" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <Wallet size={18} color="var(--emerald)" />
                        <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                          Your savings account in{' '}
                          <strong>{activeCoop?.cooperative?.name || 'this cooperative'}</strong> (auto-created with
                          your membership) will be used as the repayment source for this loan.
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div className="form-group">
                          <label className="form-label">Loan Type</label>
                          <select className="form-input" name="type" value={values.type} onChange={handleChange}>
                            {LOAN_TYPES.map((t) => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Tenure (months)</label>
                          <select className="form-input" name="tenure" value={values.tenure} onChange={handleChange}>
                            {[6, 12, 24, 36, 48, 60].map((m) => <option key={m} value={m}>{m} months</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Loan Amount (NPR)</label>
                        <input className="form-input" type="number" min="1000" step="1000" placeholder="e.g. 100000" name="amount" value={values.amount} onChange={handleChange} />
                        {touched.amount && errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Monthly Income (NPR)</label>
                        <input className="form-input" type="number" min="0" step="1000" placeholder="e.g. 50000" name="monthlyIncome" value={values.monthlyIncome} onChange={handleChange} />
                        {touched.monthlyIncome && errors.monthlyIncome && <p className="text-red-500 text-sm mt-1">{errors.monthlyIncome}</p>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Purpose</label>
                        <input className="form-input" placeholder="e.g. Seeds & fertilizer for the new season" name="purpose" value={values.purpose} onChange={handleChange} />
                        {touched.purpose && errors.purpose && <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>}
                      </div>

                      <div className="info-box info" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <Calculator size={18} color="var(--emerald)" />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600 }}>Estimated EMI</p>
                          <p style={{ fontSize: 13, opacity: 0.85 }}>
                            {formatCurrency(emi)} / month at {rate}% p.a. for {n} months
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-outline" onClick={() => handlePredict(values)} disabled={isPredicting}>
                          {isPredicting ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />} Check Eligibility
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #2A9D8F, #21867A)' }} disabled={!canSubmit || isSubmitting}>
                          {isSubmitting ? <Loader2 size={14} className="spin" /> : <CreditCard size={14} />} Submit Application
                        </button>
                      </div>
                    </form>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {prediction && (
                      <div className="glass-card" style={{ padding: 24, border: `1px solid ${prediction.eligible ? 'rgba(42,157,143,0.4)' : 'rgba(245,158,11,0.4)'}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          {prediction.eligible ? <CheckCircle size={20} color="#2A9D8F" /> : <AlertCircle size={20} color="#F59E0B" />}
                          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{prediction.eligible ? 'Looks Good' : 'Needs Review'}</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                          <div style={{ flex: 1 }}>
                            <div className="glass-progress"><div className="glass-progress-fill" style={{ width: `${prediction.score}%`, background: prediction.eligible ? 'var(--emerald)' : '#F59E0B' }} /></div>
                          </div>
                          <strong style={{ fontSize: 15 }}>{prediction.score}/100</strong>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{prediction.message}</p>
                      </div>
                    )}

                    <div className="glass-card" style={{ padding: 24 }}>
                      <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CreditCard size={16} /> How it works</h3>
                      <ol style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        <li>1. Fill in the loan details and submit your application.</li>
                        <li>2. The cooperative manager reviews it and may approve, hold, or reject it.</li>
                        <li>3. Once approved, the loan amount is disbursed and EMIs start a month later.</li>
                        <li>4. Track the status anytime from <strong>My Loans</strong>.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              );
            }}
          </Formik>
        )}
      </div>
    </div>
  );
}
