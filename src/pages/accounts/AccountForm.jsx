import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { customers, branches } from '../../data/mockData';
import toast from 'react-hot-toast';
import { Formik } from 'formik';
import * as Yup from 'yup';

const accountSchema = Yup.object({
  customerId: Yup.string().required('Select a customer'),
  type: Yup.string().required('Account type is required'),
  branch: Yup.string().required('Branch is required'),
  initialDeposit: Yup.number()
    .typeError('Enter a valid amount')
    .min(0, 'Initial deposit cannot be negative'),
});

export default function AccountForm() {
  const navigate = useNavigate();

  const interestRates = { Savings: 6.0, Current: 2.0, 'Fixed Deposit': 10.5 };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button className="btn btn-outline btn-icon" onClick={() => navigate('/accounts')}><ArrowLeft size={16} /></button>
          <div>
            <h1 className="page-title">Open New Account</h1>
            <p className="page-subtitle">Create a new bank account for a customer</p>
          </div>
        </div>
      </div>

      <Formik
        initialValues={{
          customerId: '',
          type: 'Savings',
          branch: branches[0]?.name || '',
          initialDeposit: '',
        }}
        validationSchema={accountSchema}
        onSubmit={() => {
          toast.success('Account opened successfully!');
          navigate('/accounts');
        }}
      >
        {({ values, handleChange, handleSubmit, errors, touched }) => (
          <form onSubmit={handleSubmit}>
            <div className="card mb-5">
              <h3 className="card-title mb-5">Account Details</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Customer *</label>
                  <select className="form-select" name="customerId" value={values.customerId} onChange={handleChange} id="select-customer">
                    <option value="">Select customer...</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c._id})</option>)}
                  </select>
                  {touched.customerId && errors.customerId && <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Account Type *</label>
                  <select className="form-select" name="type" value={values.type} onChange={handleChange} id="select-account-type">
                    <option>Savings</option>
                    <option>Current</option>
                    <option>Fixed Deposit</option>
                  </select>
                  {touched.type && errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Branch *</label>
                  <select className="form-select" name="branch" value={values.branch} onChange={handleChange} id="select-branch">
                    {branches.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                  </select>
                  {touched.branch && errors.branch && <p className="text-red-500 text-sm mt-1">{errors.branch}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Deposit (NPR)</label>
                  <input type="number" min="0" className="form-input" placeholder="0" name="initialDeposit" value={values.initialDeposit} onChange={handleChange} id="input-initial-deposit" />
                  {touched.initialDeposit && errors.initialDeposit && <p className="text-red-500 text-sm mt-1">{errors.initialDeposit}</p>}
                </div>
              </div>

              <div className="info-box info mt-4">
                <div>
                  <p style={{ fontWeight: 600 }}>Interest Rate: {interestRates[values.type]}% per annum</p>
                  <p style={{ fontSize: 12, marginTop: 2, opacity: 0.8 }}>
                    {values.type === 'Savings' && 'Interest credited quarterly'}
                    {values.type === 'Current' && 'Operational account, low interest'}
                    {values.type === 'Fixed Deposit' && 'Locked deposit with premium interest'}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/accounts')}>Cancel</button>
              <button type="submit" className="btn btn-primary" id="btn-open-account-submit">
                <Save size={15} /> Open Account
              </button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
}
