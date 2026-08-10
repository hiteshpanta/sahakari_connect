import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Eye, CheckCircle, XCircle, Clock, CreditCard, PauseCircle, PlayCircle, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate, statusColor, calcLoanProgress } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { useGetLoansQuery, useUpdateLoanStatusMutation } from '../../store/mainApi';

const STATUS_TABS = ['all', 'pending', 'on_hold', 'active', 'closed', 'rejected'];

const STATUS_META = {
  pending: { label: 'Pending Approval', cls: 'badge-warning' },
  on_hold: { label: 'On Hold', cls: 'badge-info' },
  active: { label: 'Active', cls: 'badge-success' },
  closed: { label: 'Closed', cls: 'badge-neutral' },
  rejected: { label: 'Rejected', cls: 'badge-danger' }
};

export default function LoanList() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actingId, setActingId] = useState(null);

  const { activeCooperativeId } = useOutletContext() || {};
  const types = [...new Set(loans.map(l => l.type))];

  const { data: loansData, isLoading, isError, refetch } = useGetLoansQuery();
  const [updateLoanStatus] = useUpdateLoanStatusMutation();

  useEffect(() => {
    setLoading(isLoading);
    if (isError) toast.error('Could not load loans');
    else if (loansData !== undefined) setLoans(loansData);
  }, [loansData, isLoading, isError]);

  const loadLoans = () => { refetch(); };

  const tenantLoans = activeCooperativeId ? loans.filter(l => String(l.cooperativeId) === String(activeCooperativeId)) : loans;

  const filtered = tenantLoans.filter(l => {
    const matchSearch = (l.loanNo || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.customerName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'all' || l.status === status;
    const matchType = typeFilter === 'all' || l.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const pending = tenantLoans.filter(l => l.status === 'pending').length;
  const onHold = tenantLoans.filter(l => l.status === 'on_hold').length;
  const active = tenantLoans.filter(l => l.status === 'active').length;
  const totalOutstanding = tenantLoans.filter(l => l.status === 'active').reduce((s, l) => s + l.outstanding, 0);

  const handleAction = async (loan, nextStatus) => {
    setActingId(loan._id);
    try {
      await updateLoanStatus({ id: loan._id, status: nextStatus, ...(nextStatus === 'rejected' ? { rejectionReason } : {}) }).unwrap();

      toast.success(nextStatus === 'active' ? `Loan ${loan.loanNo} approved & disbursed`
        : nextStatus === 'on_hold' ? `Loan ${loan.loanNo} put on hold`
        : nextStatus === 'pending' ? `Loan ${loan.loanNo} resumed to pending`
        : `Loan ${loan.loanNo} rejected`);
      loadLoans();
    } catch (e) {
      toast.error(e?.data?.message || 'Action failed');
    } finally {
      setActingId(null);
      setRejectTarget(null);
      setRejectionReason('');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Loans</h1>
          <p className="page-subtitle">{tenantLoans.length} total applications</p>
        </div>
      </div>

      {/* Summary */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': '#F59E0B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Clock size={16} color="#F59E0B" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pending</span>
          </div>
          <div className="stat-card-value">{pending}</div>
          <div className="stat-card-label">Awaiting Approval</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#06B6D4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <PauseCircle size={16} color="#06B6D4" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>On Hold</span>
          </div>
          <div className="stat-card-value">{onHold}</div>
          <div className="stat-card-label">Held Requests</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#2A9D8F' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CheckCircle size={16} color="#2A9D8F" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Active</span>
          </div>
          <div className="stat-card-value">{active}</div>
          <div className="stat-card-label">Active Loans</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#8B5CF6' }}>
          <div className="stat-card-value" style={{ fontSize: 20 }}>{formatCurrency(totalOutstanding)}</div>
          <div className="stat-card-label">Total Outstanding</div>
        </div>
      </div>

      {/* Tabs + Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div className="tabs">
          {STATUS_TABS.map(s => (
            <button key={s} className={`tab ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)} id={`tab-loans-${s}`}>
              {(STATUS_META[s] || { label: s }).label}
              {s !== 'all' && <span style={{ marginLeft: 4, fontSize: 10 }}>({tenantLoans.filter(l => l.status === s).length})</span>}
            </button>
          ))}
        </div>
        <div className="filters-row" style={{ margin: 0 }}>
          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input id="search-loans" className="form-input" placeholder="Search loans..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select id="filter-loan-type" className="form-select" style={{ width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Loan No.</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Outstanding</th>
                <th>Progress</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40 }}><Loader2 size={22} className="spin" style={{ color: 'var(--emerald)' }} /></td></tr>
              ) : filtered.map(l => {
                const progress = calcLoanProgress(l.paidEmis, l.totalEmis);
                const isReviewable = l.status === 'pending' || l.status === 'on_hold';
                const meta = STATUS_META[l.status] || { label: l.status, cls: 'badge-neutral' };
                return (
                  <tr key={l._id}>
                    <td className="td-mono">{l.loanNo}</td>
                    <td className="td-primary">{l.customerName}</td>
                    <td>
                      <span className={`badge ${l.type === 'Agriculture' ? 'badge-success' : l.type === 'Business' ? 'badge-info' : l.type === 'Housing' ? 'badge-warning' : 'badge-purple'}`}>
                        {l.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(l.amount)}</td>
                    <td style={{ color: l.outstanding > 0 ? 'var(--gold)' : 'var(--emerald)', fontWeight: 600 }}>
                      {formatCurrency(l.outstanding)}
                    </td>
                    <td style={{ minWidth: 120 }}>
                      {l.status === 'active' ? (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
                            <span>{l.paidEmis}/{l.totalEmis} EMIs</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill success" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(l.applyDate)}</td>
                    <td>
                      <span className={`badge ${meta.cls}`}><span className="badge-dot" />{meta.label}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button
                          className="btn btn-outline btn-sm btn-icon"
                          onClick={() => navigate(`/loans/${l._id}`)}
                          title="View loan"
                          id={`btn-view-loan-${l._id}`}
                        >
                          <Eye size={12} />
                        </button>
                        {isReviewable && (
                          <>
                            <button className="btn btn-sm" disabled={actingId === l._id} onClick={() => handleAction(l, 'active')} title="Approve & disburse" style={{ background: 'rgba(42,157,143,0.12)', color: '#2A9D8F', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle size={13} /> Approve
                            </button>
                            {l.status === 'on_hold' ? (
                              <button className="btn btn-sm" disabled={actingId === l._id} onClick={() => handleAction(l, 'pending')} title="Resume to pending" style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <PlayCircle size={13} /> Resume
                              </button>
                            ) : (
                              <button className="btn btn-sm" disabled={actingId === l._id} onClick={() => handleAction(l, 'on_hold')} title="Put on hold" style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <PauseCircle size={13} /> Hold
                              </button>
                            )}
                            <button className="btn btn-sm" disabled={actingId === l._id} onClick={() => { setRejectTarget(l); setRejectionReason(''); }} title="Reject" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <XCircle size={13} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><CreditCard size={22} /></div>
              <h3>No loans found</h3>
              <p>Adjust your filters or wait for members to apply</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject modal */}
      {rejectTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setRejectTarget(null)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, maxWidth: 480, width: '100%', padding: 32, border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Reject Loan</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              Provide a reason for rejecting <strong>{rejectTarget.customerName}</strong>'s {rejectTarget.type} loan request of <strong>{formatCurrency(rejectTarget.amount)}</strong>.
            </p>
            <div className="form-group">
              <label className="form-label">Rejection Reason</label>
              <textarea
                className="form-input"
                rows={3}
                style={{ background: 'rgba(0,0,0,0.2)', width: '100%', resize: 'vertical' }}
                placeholder="E.g. Insufficient income, incomplete documents..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-outline" onClick={() => setRejectTarget(null)}>Cancel</button>
              <button className="btn" disabled={actingId === rejectTarget._id} onClick={() => handleAction(rejectTarget, 'rejected')} style={{ background: '#EF4444', color: 'white', border: 'none' }}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
