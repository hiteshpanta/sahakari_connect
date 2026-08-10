import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { customers, accounts } from '../../data/mockData';
import toast from 'react-hot-toast';
import { Formik } from 'formik';
import * as Yup from 'yup';

const LOAN_TYPES = ['Agriculture', 'Business', 'Housing', 'Personal', 'Education', 'Equipment'];
const INTEREST_RATES = { Agriculture: 12, Business: 14, Housing: 11, Personal: 16, Education: 10, Equipment: 13 };

const loanSchema = Yup.object({
  customerId: Yup.string().required('Select a customer'),
  accountNo: Yup.string().required('Select an account'),
  type: Yup.string().required('Loan type is required'),
  amount: Yup.number()
    .typeError('Enter a valid amount')
    .positive('Amount must be greater than zero')
    .min(1000, 'Minimum loan amount is NPR 1,000')
    .required('Amount is required'),
  tenure: Yup.string().required('Tenure is required'),
  monthlyIncome: Yup.number()
    .typeError('Enter a valid income')
    .min(0, 'Income cannot be negative'),
  purpose: Yup.string().required('Purpose of loan is required'),
});

export default function LoanForm() {
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handlePredict = async (values) => {
    if (!values.amount || !values.monthlyIncome) {
      toast.error('Please enter amount and monthly income to predict eligibility');
      return;
    }
    setIsPredicting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const amount = parseFloat(values.amount);
      const income = parseFloat(values.monthlyIncome);
      let score = 50;
      let eligible = false;
      let message = 'Loan request is risky based on current parameters.';

      const ratio = amount / income;
      if (ratio < 10) score += 30;
      else if (ratio < 20) score += 15;
      else score -= 20;

      if (score >= 70) { eligible = true; message = 'High probability of approval.'; }
      else if (score >= 50) { eligible = true; message = 'Moderate probability of approval, requires manual review.'; }

      setPrediction({ eligible, score, message });
      toast.success('Prediction generated!');
    } catch {
      toast.error('Prediction failed');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button className="btn btn-outline btn-icon" onClick={() => navigate('/loans')}><ArrowLeft size={16} /></button>
          <div>
            <h1 className="page-title">New Loan Application</h1>
            <p className="page-subtitle">Submit a loan application for review</p>
          </div>
        </div>
      </div>

      <Formik
        initialValues={{
          customerId: '', accountNo: '', type: 'Agriculture',
          amount: '', tenure: '12', purpose: '', monthlyIncome: ''
        }}
        validationSchema={loanSchema}
        onSubmit={() => {
          toast.success('Loan application submitted successfully!');
          navigate('/loans');
        }}
      >
        {({ values, handleChange, setFieldValue, handleSubmit, errors, touched }) => {
          const rate = INTEREST_RATES[values.type] || 12;
          const monthlyRate = rate / 12 / 100;
          const n = parseInt(values.tenure) || 1;
          const P = parseFloat(values.amount) || 0;
          const emi = P > 0 ? Math.round((P * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)) : 0;

          const custAccounts = values.customerId
            ? accounts.filter(a => a.customerId === values.customerId)
            : [];

          return (
            <div className="grid-2-1">
              <form onSubmit={handleSubmit}>
                <div className="card mb-5">
                  <h3 className="card-title mb-5">Applicant Details</h3>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Customer *</label>
                      <select
                        className="form-select"
                        name="customerId"
                        value={values.customerId}
                        onChange={(e) => {
                          handleChange(e);
                          setFieldValue('accountNo', '');
                        }}
                        id="select-loan-customer"
                      >
                        <option value="">Select customer...</option>
                        {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                      {touched.customerId && errors.customerId && <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Account *</label>
                      <select className="form-select" name="accountNo" value={values.accountNo} onChange={handleChange} id="select-loan-account" disabled={!values.customerId}>
                        <option value="">Select account...</option>
                        {custAccounts.map(a => <option key={a._id} value={a.accountNo}>{a.accountNo} ({a.type})</option>)}
                      </select>
                      {touched.accountNo && errors.accountNo && <p className="text-red-500 text-sm mt-1">{errors.accountNo}</p>}
                    </div>
                  </div>
                </div>

                <div className="card mb-5">
                  <h3 className="card-title mb-5">Loan Details</h3>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Loan Type *</label>
                      <select className="form-select" name="type" value={values.type} onChange={handleChange} id="select-loan-type">
                        {LOAN_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                      {touched.type && errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Amount (NPR) *</label>
                      <input type="number" min="1000" className="form-input" placeholder="e.g. 100000" name="amount" value={values.amount} onChange={handleChange} id="input-loan-amount" />
                      {touched.amount && errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tenure (Months) *</label>
                      <select className="form-select" name="tenure" value={values.tenure} onChange={handleChange} id="select-tenure">
                        {[6, 12, 18, 24, 36, 48, 60].map(t => <option key={t} value={t}>{t} months</option>)}
                      </select>
                      {touched.tenure && errors.tenure && <p className="text-red-500 text-sm mt-1">{errors.tenure}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Monthly Income (NPR)</label>
                      <input type="number" min="0" className="form-input" placeholder="e.g. 50000" name="monthlyIncome" value={values.monthlyIncome || ''} onChange={handleChange} id="input-loan-income" />
                      {touched.monthlyIncome && errors.monthlyIncome && <p className="text-red-500 text-sm mt-1">{errors.monthlyIncome}</p>}
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Purpose of Loan *</label>
                      <textarea className="form-textarea" placeholder="Describe the purpose of this loan..." name="purpose" value={values.purpose} onChange={handleChange} id="input-loan-purpose" />
                      {touched.purpose && errors.purpose && <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>}
                    </div>
                  </div>
                </div>

                {prediction && (
                  <div className="card mb-5" style={{ background: prediction.eligible ? 'rgba(42, 157, 143, 0.05)' : 'rgba(239, 68, 68, 0.05)', border: `1px solid ${prediction.eligible ? 'var(--emerald)' : 'var(--red-light)'}` }}>
                    <h3 className="card-title" style={{ color: prediction.eligible ? 'var(--emerald)' : 'var(--red-light)' }}>
                      {prediction.eligible ? 'Eligible for Loan' : 'High Risk / Not Eligible'}
                    </h3>
                    <p style={{ marginTop: 'var(--space-2)' }}>{prediction.message}</p>
                    <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-4)' }}>
                      <div><strong>Score:</strong> {prediction.score}/100</div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" onClick={() => navigate('/loans')}>Cancel</button>
                  <button type="button" className="btn btn-secondary" onClick={() => handlePredict(values)} disabled={isPredicting}>
                    {isPredicting ? 'Predicting...' : 'Predict Eligibility'}
                  </button>
                  <button type="submit" className="btn btn-primary" id="btn-submit-loan"><Save size={15} /> Submit Application</button>
                </div>
              </form>

              {/* EMI Calculator */}
              <div>
                <div className="card" style={{ position: 'sticky', top: 80 }}>
                  <h3 className="card-title mb-4">EMI Calculator</h3>
                  <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Estimated Monthly EMI</p>
                    <p style={{ fontSize: 36, fontWeight: 900, color: emi > 0 ? 'var(--blue-light)' : 'var(--text-muted)' }}>
                      {emi > 0 ? `NPR ${emi.toLocaleString()}` : '—'}
                    </p>
                  </div>
                  <div className="detail-rows">
                    <div className="detail-row"><label>Loan Amount</label><span>{P > 0 ? `NPR ${P.toLocaleString()}` : '—'}</span></div>
                    <div className="detail-row"><label>Interest Rate</label><span>{rate}% p.a.</span></div>
                    <div className="detail-row"><label>Tenure</label><span>{values.tenure} months</span></div>
                    <div className="detail-row"><label>Monthly EMI</label><span style={{ color: 'var(--emerald)', fontWeight: 700 }}>{emi > 0 ? `NPR ${emi.toLocaleString()}` : '—'}</span></div>
                    <div className="detail-row"><label>Total Payable</label><span style={{ fontWeight: 600 }}>{emi > 0 ? `NPR ${(emi * n).toLocaleString()}` : '—'}</span></div>
                    <div className="detail-row"><label>Total Interest</label><span style={{ color: 'var(--red-light)' }}>{emi > 0 ? `NPR ${(emi * n - P).toLocaleString()}` : '—'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </Formik>
    </div>
  );
}
