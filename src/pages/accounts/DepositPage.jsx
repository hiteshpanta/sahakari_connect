import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowDownToLine, Info, Loader2, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useGetAccountsQuery, useGetTransactionsQuery, useCreateTransactionMutation } from '../../store/mainApi';

const depositSchema = Yup.object({
  accountId: Yup.string().required('Select an account'),
  amount: Yup.number()
    .typeError('Enter a valid amount')
    .positive('Enter a valid amount')
    .required('Amount is required'),
  remarks: Yup.string(),
});

export default function DepositPage() {
  const { activeCooperativeId } = useOutletContext() || {};
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: accountsData, isLoading: accountsLoading, isError: accountsError, refetch: refetchAccounts } = useGetAccountsQuery();
  const { data: transactionsData, isLoading: transactionsLoading, isError: transactionsError, refetch: refetchTransactions } = useGetTransactionsQuery();
  const [createTransaction] = useCreateTransactionMutation();

  useEffect(() => {
    setLoading(accountsLoading || transactionsLoading);
    if (!accountsError && accountsData !== undefined) setAccounts(accountsData);
    if (!transactionsError && transactionsData !== undefined) setTransactions(transactionsData);
  }, [accountsData, transactionsData, accountsLoading, transactionsLoading, accountsError, transactionsError]);

  const loadData = () => {
    setLoading(true);
    Promise.all([refetchAccounts(), refetchTransactions()]).finally(() => setLoading(false));
  };

  const tenantAccounts = activeCooperativeId
    ? accounts.filter(a => String(a.cooperativeId) === String(activeCooperativeId))
    : accounts;
  const tenantTxns = activeCooperativeId
    ? transactions.filter(t => String(t.cooperativeId) === String(activeCooperativeId))
    : transactions;

  const recentDeposits = tenantTxns
    .filter(t => t.type === 'Deposit')
    .slice(0, 6);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deposits</h1>
          <p className="page-subtitle">Deposits can be made at any time to any account in the cooperative</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={loadData} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div className="info-box success mb-5">
        <Info size={15} />
        <div>
          <p style={{ fontWeight: 600, fontSize: 13 }}>Anytime deposits</p>
          <span style={{ fontSize: 12, opacity: 0.85 }}>Members can deposit into their savings account at any time — no approval required. The balance updates immediately.</span>
        </div>
      </div>

      <div className="grid-2 mb-6" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)' }}>
        {/* Deposit form */}
        <div className="card">
          <h3 className="card-title mb-4">Make a Deposit</h3>
          <Formik
            initialValues={{ accountId: '', amount: '', remarks: '' }}
            validationSchema={depositSchema}
            onSubmit={async (values, { resetForm }) => {
              const selectedAccount = tenantAccounts.find(a => String(a._id) === String(values.accountId));
              try {
                await createTransaction({ accountNo: selectedAccount.accountNo, type: 'Deposit', amount: Number(values.amount), remarks: values.remarks }).unwrap();
                toast.success(`Deposited ${formatCurrency(Number(values.amount))} into ${selectedAccount.accountNo}`);
                resetForm();
                loadData();
              } catch (err) {
                toast.error(err?.data?.message || 'Deposit failed');
              }
            }}
          >
            {({ values, handleChange, handleSubmit, errors, touched, isSubmitting }) => {
              const selectedAccount = tenantAccounts.find(a => String(a._id) === String(values.accountId));
              return (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Account *</label>
                    <select
                      id="deposit-account"
                      className="form-select"
                      name="accountId"
                      value={values.accountId}
                      onChange={handleChange}
                    >
                      <option value="">Select an account...</option>
                      {tenantAccounts.map(a => (
                        <option key={a._id} value={a._id}>
                          {a.accountNo} — {a.customerName} ({formatCurrency(a.balance)})
                        </option>
                      ))}
                    </select>
                    {touched.accountId && errors.accountId && (
                      <p className="text-red-500 text-sm mt-1">{errors.accountId}</p>
                    )}
                  </div>

                  {selectedAccount && (
                    <div className="info-box info">
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{selectedAccount.accountNo} • {selectedAccount.customerName}</p>
                        <p style={{ fontSize: 12, marginTop: 2 }}>Current balance: <strong>{formatCurrency(selectedAccount.balance)}</strong> • {selectedAccount.type}</p>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Amount (NPR) *</label>
                    <input
                      id="deposit-amount"
                      type="number"
                      min="1"
                      className="form-input"
                      placeholder="Enter amount"
                      name="amount"
                      value={values.amount}
                      onChange={handleChange}
                    />
                    {touched.amount && errors.amount && (
                      <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Remarks</label>
                    <input
                      id="deposit-remarks"
                      className="form-input"
                      placeholder="Optional remarks"
                      name="remarks"
                      value={values.remarks}
                      onChange={handleChange}
                    />
                  </div>

                  <button type="submit" className="btn btn-success" id="btn-submit-deposit" disabled={isSubmitting || loading}>
                    {isSubmitting ? <Loader2 size={15} className="spin" /> : <ArrowDownToLine size={15} />}
                    Deposit Now
                  </button>
                </form>
              );
            }}
          </Formik>
        </div>

        {/* Recent deposits */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Deposits</h3>
              <p className="card-subtitle">Latest deposits recorded in the cooperative</p>
            </div>
          </div>
          <div className="activity-list">
            {loading ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                <Loader2 size={20} className="spin" style={{ color: 'var(--emerald)' }} />
              </div>
            ) : recentDeposits.length > 0 ? (
              recentDeposits.map(t => (
                <div key={t._id} className="activity-item">
                  <div className="activity-icon" style={{ background: 'rgba(42,157,143,0.12)' }}>
                    <ArrowDownToLine size={14} color="#2A9D8F" />
                  </div>
                  <div className="activity-text">
                    <p><strong style={{ color: 'var(--text-primary)' }}>{t.customerName}</strong> — {t.type}</p>
                    <span>{t.accountNo} • {formatDate(t.date)}{t.staff ? ` • by ${t.staff}` : ''}</span>
                  </div>
                  <span className="activity-amount" style={{ color: 'var(--emerald)' }}>+{formatCurrency(t.amount)}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No deposits yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
