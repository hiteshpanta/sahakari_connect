import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2, PauseCircle, PlayCircle } from 'lucide-react';
import { formatCurrency, formatDate, calcLoanProgress } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { useGetLoanByIdQuery, useUpdateLoanStatusMutation } from '../../store/mainApi';

const STATUS_META = {
  pending: { label: 'Pending Approval', cls: 'badge-warning' },
  on_hold: { label: 'On Hold', cls: 'badge-info' },
  active: { label: 'Active', cls: 'badge-success' },
  closed: { label: 'Closed', cls: 'badge-neutral' },
  rejected: { label: 'Rejected', cls: 'badge-danger' }
};

export default function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: loanData, isLoading, isError, error: queryError, refetch } = useGetLoanByIdQuery(id);
  const [updateLoanStatus] = useUpdateLoanStatusMutation();

  useEffect(() => {
    setLoading(isLoading);
    if (isError) toast.error(queryError?.data?.message || 'Failed to load loan');
    else if (loanData !== undefined) setLoan(loanData);
  }, [loanData, isLoading, isError, queryError]);

  const load = () => { refetch(); };

  const handleAction = async (status) => {
    setActing(true);
    try {
      await updateLoanStatus({ id, status, ...(status === 'rejected' ? { rejectionReason } : {}) }).unwrap();

      toast.success(status === 'active' ? 'Loan approved & disbursed!'
        : status === 'on_hold' ? 'Loan put on hold.'
        : status === 'pending' ? 'Loan resumed to pending review.'
        : 'Loan rejected.');
      setShowRejectModal(false);
      setRejectionReason('');
      load();
    } catch (e) {
      toast.error(e?.data?.message || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Loader2 size={28} className="spin" style={{ color: 'var(--emerald)' }} /></div>;
  }

  if (!loan) {
    return <div className="empty-state"><h3>Loan not found</h3><button className="btn btn-primary mt-4" onClick={() => navigate('/loans')}>Back</button></div>;
  }

  const progress = calcLoanProgress(loan.paidEmis, loan.totalEmis);
  const meta = STATUS_META[loan.status] || { label: loan.status, cls: 'badge-neutral' };
  const isReviewable = loan.status === 'pending' || loan.status === 'on_hold';

  const emiDots = Array.from({ length: loan.totalEmis || 0 }, (_, i) => ({
    index: i + 1,
    status: i < loan.paidEmis ? 'paid' : i === loan.paidEmis && loan.status === 'active' ? 'current' : 'remaining'
  }));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button className="btn btn-outline btn-icon" onClick={() => navigate('/loans')}><ArrowLeft size={16} /></button>
          <div>
            <h1 className="page-title">{loan.loanNo}</h1>
            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <span className={`badge ${meta.cls}`}><span className="badge-dot" />{meta.label}</span>
              <span className={`badge ${loan.type === 'Agriculture' ? 'badge-success' : loan.type === 'Business' ? 'badge-info' : loan.type === 'Housing' ? 'badge-warning' : 'badge-purple'}`}>{loan.type}</span>
            </div>
          </div>
        </div>
        {isReviewable && (
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {loan.status === 'on_hold' && (
              <button className="btn btn-outline" onClick={() => handleAction('pending')} disabled={acting} id="btn-resume-loan">
                <PlayCircle size={14} /> Resume
              </button>
            )}
            <button className="btn btn-danger" onClick={() => setShowRejectModal(true)} disabled={acting} id="btn-reject-loan"><XCircle size={14} /> Reject</button>
            {loan.status === 'pending' && (
              <button className="btn btn-outline" onClick={() => handleAction('on_hold')} disabled={acting} id="btn-hold-loan"><PauseCircle size={14} /> Hold</button>
            )}
            <button className="btn btn-success" onClick={() => handleAction('active')} disabled={acting} id="btn-approve-loan"><CheckCircle size={14} /> {acting ? 'Processing...' : 'Approve Loan'}</button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': '#06b6d4' }}>
          <div className="stat-card-value" style={{ fontSize: 20 }}>{formatCurrency(loan.amount)}</div>
          <div className="stat-card-label">Loan Amount</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#F59E0B' }}>
          <div className="stat-card-value" style={{ fontSize: 20, color: loan.outstanding > 0 ? 'var(--gold)' : 'var(--emerald)' }}>{formatCurrency(loan.outstanding)}</div>
          <div className="stat-card-label">Outstanding</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#2A9D8F' }}>
          <div className="stat-card-value" style={{ fontSize: 20 }}>{formatCurrency(loan.emiAmount)}</div>
          <div className="stat-card-label">Monthly EMI</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#8B5CF6' }}>
          <div className="stat-card-value">{loan.paidEmis}/{loan.totalEmis}</div>
          <div className="stat-card-label">EMIs Paid</div>
        </div>
      </div>

      {isReviewable && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div className="info-box warning" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Clock size={16} color="#F59E0B" />
            <div>
              <p style={{ fontWeight: 600, fontSize: 13 }}>
                {loan.status === 'on_hold' ? 'This application is on hold' : 'This application is awaiting your decision'}
              </p>
              <p style={{ fontSize: 13, marginTop: 2, opacity: 0.85 }}>
                {loan.status === 'on_hold' ? 'Resume it to review again, or approve / reject it.' : 'Approve to disburse the loan, hold for more information, or reject it.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid-1-2">
        {/* Loan Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="card">
            <h3 className="card-title mb-4">Loan Information</h3>
            <div className="detail-rows">
              <div className="detail-row"><label>Customer</label><span>{loan.customerName}</span></div>
              <div className="detail-row"><label>Account</label><span style={{ fontFamily: 'monospace', color: 'var(--text-accent)' }}>{loan.accountNo}</span></div>
              <div className="detail-row"><label>Loan Type</label><span>{loan.type}</span></div>
              <div className="detail-row"><label>Interest Rate</label><span>{loan.interestRate}% p.a.</span></div>
              <div className="detail-row"><label>Tenure</label><span>{loan.tenure} months</span></div>
              <div className="detail-row"><label>Apply Date</label><span>{formatDate(loan.applyDate)}</span></div>
              {loan.monthlyIncome && <div className="detail-row"><label>Monthly Income</label><span>{formatCurrency(loan.monthlyIncome)}</span></div>}
              {loan.approveDate && <div className="detail-row"><label>Approve Date</label><span>{formatDate(loan.approveDate)}</span></div>}
              {loan.approvedBy && <div className="detail-row"><label>Approved By</label><span>{loan.approvedBy}</span></div>}
              <div className="detail-row"><label>Branch</label><span>{loan.branch}</span></div>
              <div className="detail-row"><label>Purpose</label><span style={{ fontSize: 12 }}>{loan.purpose || '—'}</span></div>
              {loan.rejectionReason && (
                <div className="detail-row"><label>Rejection Reason</label><span style={{ color: 'var(--red-light)', fontSize: 12 }}>{loan.rejectionReason}</span></div>
              )}
            </div>
          </div>

          {/* Next EMI */}
          {loan.status === 'active' && (
            <div className="card">
              <div className="info-box warning">
                <Clock size={16} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13 }}>Next EMI Due</p>
                  <p style={{ fontSize: 13, marginTop: 2 }}>{formatCurrency(loan.emiAmount)} on {loan.nextEmiDate ? formatDate(loan.nextEmiDate) : '—'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* EMI Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Repayment Progress</h3>
              <span style={{ fontSize: 13, fontWeight: 700, color: progress === 100 ? 'var(--emerald)' : 'var(--text-primary)' }}>{progress}%</span>
            </div>
            <div className="progress-bar mb-4" style={{ height: 10 }}>
              <div className="progress-fill success" style={{ width: `${progress}%` }} />
            </div>
            <div className="loan-emi-timeline">
              {emiDots.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>EMI schedule will be generated once approved.</p>
              ) : emiDots.map(dot => (
                <div key={dot.index} className={`emi-dot ${dot.status}`} title={`EMI ${dot.index}: ${dot.status}`}>
                  {dot.status === 'paid' ? '✓' : dot.index}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(42,157,143,0.3)', display: 'inline-block' }} /> Paid
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(245,158,11,0.3)', display: 'inline-block' }} /> Current
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(255,255,255,0.04)', display: 'inline-block' }} /> Remaining
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowRejectModal(false)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, maxWidth: 480, width: '100%', padding: 32, border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Reject Loan</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              Provide a reason for rejecting <strong>{loan.customerName}</strong>'s {loan.type} loan request of <strong>{formatCurrency(loan.amount)}</strong>.
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
              <button className="btn btn-outline" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="btn" disabled={acting} onClick={() => handleAction('rejected')} style={{ background: '#EF4444', color: 'white', border: 'none' }}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
