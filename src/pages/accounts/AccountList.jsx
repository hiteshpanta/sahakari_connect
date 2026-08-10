import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Plus, Eye, ArrowDownCircle, ArrowUpCircle, X, Loader2 } from 'lucide-react';
import { formatCurrency, statusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { useGetAccountsQuery, useCreateTransactionMutation } from '../../store/mainApi';
import { Formik } from 'formik';
import * as Yup from 'yup';

const TYPE_COLORS = { Savings: 'badge-info', Current: 'badge-purple', 'Fixed Deposit': 'badge-warning' };

const transactionSchema = Yup.object({
  amount: Yup.number()
    .typeError('Enter a valid amount')
    .positive('Enter a valid amount')
    .required('Amount is required'),
  remarks: Yup.string(),
});

function TransactionModal({ account, type, onClose }) {
  const [createTransaction] = useCreateTransactionMutation();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: type === 'Deposit' ? 'var(--emerald)' : 'var(--red-light)' }}>
            {type === 'Deposit' ? <ArrowDownCircle size={18} style={{ display: 'inline', marginRight: 8 }} /> : <ArrowUpCircle size={18} style={{ display: 'inline', marginRight: 8 }} />}
            {type}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <Formik
          initialValues={{ amount: '', remarks: '' }}
          validationSchema={transactionSchema}
          onSubmit={async (values) => {
            try {
              await createTransaction({
                accountNo: account.accountNo,
                type,
                amount: Number(values.amount),
                remarks: values.remarks
              }).unwrap();
              toast.success(`${type} of ${formatCurrency(Number(values.amount))} processed for ${account.accountNo}`);
              onClose();
            } catch (err) {
              toast.error(err?.data?.message || 'Failed to process transaction');
            }
          }}
        >
          {({ values, handleChange, handleSubmit, errors, touched, isSubmitting }) => (
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="info-box info mb-4">
                  <div>
                    <p style={{ fontWeight: 600 }}>{account.accountNo}</p>
                    <p style={{ fontSize: 12, marginTop: 2 }}>Current Balance: <strong>{formatCurrency(account.balance)}</strong></p>
                  </div>
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">Amount (NPR) *</label>
                  <input
                    id="input-txn-amount"
                    type="number"
                    min="1"
                    className="form-input"
                    placeholder="Enter amount"
                    name="amount"
                    value={values.amount}
                    onChange={handleChange}
                    autoFocus
                  />
                  {touched.amount && errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <input className="form-input" placeholder="Optional remarks" name="remarks" value={values.remarks} onChange={handleChange} id="input-txn-remarks" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button type="submit" className={`btn ${type === 'Deposit' ? 'btn-success' : 'btn-danger'}`} id="btn-confirm-txn" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : `Confirm ${type}`}
                </button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default function AccountList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const { activeCooperativeId } = useOutletContext() || {};
  const [modal, setModal] = useState(null); // { account, type }
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: accountsData, isLoading, isError } = useGetAccountsQuery();

  useEffect(() => {
    setLoading(isLoading);
    if (isError) setAccounts([]);
    else if (accountsData !== undefined) setAccounts(accountsData);
  }, [accountsData, isLoading, isError]);

  const tenantAccounts = activeCooperativeId ? accounts.filter(a => String(a.cooperativeId) === String(activeCooperativeId)) : accounts;

  const filtered = tenantAccounts.filter(a => {
    const match = a.accountNo.toLowerCase().includes(search.toLowerCase()) ||
      a.customerName.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    return match && matchType;
  });

  const totalBalance = tenantAccounts.reduce((s, a) => s + a.balance, 0);
  const activeCount = tenantAccounts.filter(a => a.status === 'active').length;

  return (
    <div className="animate-fade-in">
      {modal && <TransactionModal account={modal.account} type={modal.type} onClose={() => setModal(null)} />}

      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-subtitle">{activeCount} active accounts • Total balance {formatCurrency(totalBalance)}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/accounts/new')} id="btn-open-account">
          <Plus size={15} /> Open Account
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 'var(--space-5)' }}>
        {['Savings', 'Current', 'Fixed Deposit'].map(type => {
          const group = tenantAccounts.filter(a => a.type === type);
          const total = group.reduce((s, a) => s + a.balance, 0);
          return (
            <div key={type} className="stat-card" style={{ '--card-accent': type === 'Savings' ? '#06b6d4' : type === 'Current' ? '#8B5CF6' : '#F59E0B' }}>
              <div className="stat-card-value" style={{ fontSize: 20 }}>{formatCurrency(total)}</div>
              <div className="stat-card-label">{type} ({group.length} accounts)</div>
            </div>
          );
        })}
      </div>

      <div className="filters-row">
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input id="search-accounts" className="form-input" placeholder="Search by account no. or customer name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select id="filter-type" className="form-select" style={{ width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="Savings">Savings</option>
          <option value="Current">Current</option>
          <option value="Fixed Deposit">Fixed Deposit</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Account No.</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Interest Rate</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40 }}>
                    <Loader2 size={22} className="spin" style={{ color: 'var(--emerald)' }} />
                  </td>
                </tr>
              ) : filtered.map(acc => (
                <tr key={acc._id}>
                  <td className="td-mono">{acc.accountNo}</td>
                  <td>
                    <div>
                      <p className="td-primary">{acc.customerName}</p>
                      {acc.customerId?.phone && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{acc.customerId.phone}</p>}
                    </div>
                  </td>
                  <td><span className={`badge ${TYPE_COLORS[acc.type] || 'badge-neutral'}`}>{acc.type}</span></td>
                  <td className="td-amount credit">{formatCurrency(acc.balance)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{acc.interestRate}% p.a.</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{acc.branch}</td>
                  <td><span className={`badge badge-${statusColor(acc.status)}`}><span className="badge-dot" />{acc.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-outline btn-sm btn-icon" onClick={() => navigate(`/accounts/${acc._id}`)} title="View" id={`btn-view-acc-${acc._id}`}><Eye size={12} /></button>
                      <button className="btn btn-success btn-sm btn-icon" onClick={() => setModal({ account: acc, type: 'Deposit' })} title="Deposit" id={`btn-deposit-${acc._id}`}><ArrowDownCircle size={12} /></button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => setModal({ account: acc, type: 'Withdrawal' })} title="Withdraw" id={`btn-withdraw-${acc._id}`}><ArrowUpCircle size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="empty-state"><div className="empty-state-icon"><Search size={22} /></div><h3>No accounts found</h3></div>
          )}
        </div>
      </div>
    </div>
  );
}
