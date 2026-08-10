import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowUpFromLine, ShieldCheck, XCircle, Clock, Loader2, RefreshCw, X } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  useGetAccountsQuery,
  useGetWithdrawalsQuery,
  useCreateWithdrawalMutation,
  useApproveWithdrawalMutation,
  useRejectWithdrawalMutation
} from '../../store/mainApi';

const STATUS_META = {
  pending: { label: 'Pending', cls: 'badge-warning' },
  approved: { label: 'Approved', cls: 'badge-success' },
  rejected: { label: 'Rejected', cls: 'badge-danger' }
};

let tenantAccountsRef = [];

const withdrawalSchema = Yup.object({
  accountId: Yup.string().required('Select an account'),
  amount: Yup.number()
    .typeError('Enter a valid amount')
    .positive('Enter a valid amount')
    .required('Amount is required')
    .test('not-exceed-balance', 'Amount exceeds available balance', function (value) {
      if (!value) return true;
      const account = tenantAccountsRef.find(a => String(a._id) === String(this.parent.accountId));
      return !account || Number(value) <= account.balance;
    }),
  remarks: Yup.string(),
});

const rejectionSchema = Yup.object({
  rejectionReason: Yup.string()
    .trim()
    .required('Please provide a reason for rejection'),
});

export default function WithdrawalPage() {
  const { currentUser } = useAuth();
  const { activeCooperativeId } = useOutletContext() || {};
  const [accounts, setAccounts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const [rejectTarget, setRejectTarget] = useState(null);

  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'admin';

  const { data: accountsData, isLoading: accountsLoading, isError: accountsError, refetch: refetchAccounts } = useGetAccountsQuery();
  const { data: requestsData, isLoading: requestsLoading, isError: requestsError, refetch: refetchRequests } = useGetWithdrawalsQuery();
  const [createWithdrawal] = useCreateWithdrawalMutation();
  const [approveWithdrawal] = useApproveWithdrawalMutation();
  const [rejectWithdrawal] = useRejectWithdrawalMutation();

  useEffect(() => {
    setLoading(accountsLoading || requestsLoading);
    if (!accountsError && accountsData !== undefined) setAccounts(accountsData);
    if (!requestsError && requestsData !== undefined) setRequests(requestsData);
  }, [accountsData, requestsData, accountsLoading, requestsLoading, accountsError, requestsError]);

  const loadAccounts = () => { refetchAccounts(); };

  const loadRequests = () => { refetchRequests(); };

  const loadData = () => {
    setLoading(true);
    Promise.all([loadAccounts(), loadRequests()]).finally(() => setLoading(false));
  };

  const tenantAccounts = activeCooperativeId
    ? accounts.filter(a => String(a.cooperativeId) === String(activeCooperativeId))
    : accounts;
  const tenantRequests = activeCooperativeId
    ? requests.filter(r => String(r.cooperativeId) === String(activeCooperativeId))
    : requests;

  tenantAccountsRef = tenantAccounts;

  const pendingCount = tenantRequests.filter(r => r.status === 'pending').length;

  const handleApprove = async (req) => {
    setActingId(req._id);
    try {
      await approveWithdrawal(req._id).unwrap();
      toast.success(`Withdrawal ${req.requestNo} approved & processed`);
      loadData();
    } catch (err) {
      toast.error(err?.data?.message || 'Approval failed');
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (rejectionReason) => {
    if (!rejectTarget) return;
    setActingId(rejectTarget._id);
    try {
      await rejectWithdrawal({ id: rejectTarget._id, rejectionReason }).unwrap();
      toast.success(`Withdrawal ${rejectTarget.requestNo} rejected`);
      setRejectTarget(null);
      loadData();
    } catch (err) {
      toast.error(err?.data?.message || 'Rejection failed');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Withdrawals</h1>
          <p className="page-subtitle">Withdrawals require approval from the manager of this cooperative</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={loadData} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div className="info-box warning mb-5">
        <ShieldCheck size={15} />
        <div>
          <p style={{ fontWeight: 600, fontSize: 13 }}>Manager approval required</p>
          <span style={{ fontSize: 12, opacity: 0.85 }}>
            Withdrawal requests are queued and only processed after a manager of the respective cooperative approves them.
          </span>
        </div>
      </div>

      <div className="grid-2 mb-6" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)' }}>
        {/* Request form */}
        <div className="card">
          <h3 className="card-title mb-4">Request a Withdrawal</h3>
          <Formik
            initialValues={{ accountId: '', amount: '', remarks: '' }}
            validationSchema={withdrawalSchema}
            onSubmit={async (values, { resetForm }) => {
              try {
                await createWithdrawal({ accountId: values.accountId, amount: Number(values.amount), remarks: values.remarks }).unwrap();
                toast.success('Withdrawal request submitted for manager approval');
                resetForm();
                loadData();
              } catch (err) {
                toast.error(err?.data?.message || 'Request failed');
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
                      id="withdrawal-account"
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
                        <p style={{ fontSize: 12, marginTop: 2 }}>Available balance: <strong>{formatCurrency(selectedAccount.balance)}</strong> • {selectedAccount.type}</p>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Amount (NPR) *</label>
                    <input
                      id="withdrawal-amount"
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
                      id="withdrawal-remarks"
                      className="form-input"
                      placeholder="Optional remarks"
                      name="remarks"
                      value={values.remarks}
                      onChange={handleChange}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" id="btn-submit-withdrawal" disabled={isSubmitting || loading}>
                    {isSubmitting ? <Loader2 size={15} className="spin" /> : <ArrowUpFromLine size={15} />}
                    Submit for Approval
                  </button>
                </form>
              );
            }}
          </Formik>
        </div>

        {/* Requests list */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Withdrawal Requests</h3>
              <p className="card-subtitle">All requests for this cooperative</p>
            </div>
            <span className={`badge ${pendingCount ? 'badge-warning' : 'badge-success'}`}>
              <Clock size={12} /> {pendingCount} pending
            </span>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request No.</th>
                  <th>Customer</th>
                  <th>Account</th>
                  <th>Amount</th>
                  <th>Requested</th>
                  <th>Status</th>
                  {isManager && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={isManager ? 7 : 6} style={{ textAlign: 'center', padding: 40 }}>
                      <Loader2 size={22} className="spin" style={{ color: 'var(--emerald)' }} />
                    </td>
                  </tr>
                ) : tenantRequests.map(r => {
                  const meta = STATUS_META[r.status] || { label: r.status, cls: 'badge-neutral' };
                  return (
                    <tr key={r._id}>
                      <td className="td-mono">{r.requestNo}</td>
                      <td className="td-primary">{r.customerName}</td>
                      <td className="td-mono">{r.accountNo}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(r.amount)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {formatDate(r.createdAt)}
                        {r.requestedBy ? <span style={{ display: 'block', fontSize: 11 }}>by {r.requestedBy}</span> : null}
                      </td>
                      <td>
                        <span className={`badge ${meta.cls}`}><span className="badge-dot" />{meta.label}</span>
                        {r.status === 'rejected' && r.rejectionReason && (
                          <p style={{ fontSize: 11, color: 'var(--red-light)', marginTop: 4 }}>{r.rejectionReason}</p>
                        )}
                        {r.status === 'approved' && r.approvedBy && (
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>by {r.approvedBy}</p>
                        )}
                      </td>
                      {isManager && (
                        <td>
                          {r.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                className="btn btn-sm"
                                disabled={actingId === r._id}
                                onClick={() => handleApprove(r)}
                                title="Approve & process"
                                style={{ background: 'rgba(42,157,143,0.12)', color: '#2A9D8F', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                <ShieldCheck size={13} /> Approve
                              </button>
                              <button
                                className="btn btn-sm"
                                disabled={actingId === r._id}
                                onClick={() => setRejectTarget(r)}
                                title="Reject"
                                style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!loading && tenantRequests.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><ArrowUpFromLine size={22} /></div>
                <h3>No withdrawal requests yet</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject modal */}
      {rejectTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setRejectTarget(null)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, maxWidth: 480, width: '100%', padding: 32, border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Reject Withdrawal</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setRejectTarget(null)}><X size={18} /></button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              Provide a reason for rejecting <strong>{rejectTarget.customerName}</strong>'s withdrawal request of <strong>{formatCurrency(rejectTarget.amount)}</strong>.
            </p>
            <Formik
              key={rejectTarget._id}
              initialValues={{ rejectionReason: '' }}
              validationSchema={rejectionSchema}
              onSubmit={async (values) => {
                await handleReject(values.rejectionReason);
              }}
            >
              {({ values, handleChange, handleSubmit, errors, touched, isSubmitting }) => (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Rejection Reason</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      style={{ background: 'rgba(0,0,0,0.2)', width: '100%', resize: 'vertical' }}
                      placeholder="E.g. Insufficient funds, account on hold..."
                      name="rejectionReason"
                      value={values.rejectionReason}
                      onChange={handleChange}
                    />
                    {touched.rejectionReason && errors.rejectionReason && (
                      <p className="text-red-500 text-sm mt-1">{errors.rejectionReason}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                    <button type="button" className="btn btn-outline" onClick={() => setRejectTarget(null)}>Cancel</button>
                    <button type="submit" className="btn" disabled={actingId === rejectTarget._id || isSubmitting} style={{ background: '#EF4444', color: 'white', border: 'none' }}>
                      Confirm Rejection
                    </button>
                  </div>
                </form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
}
