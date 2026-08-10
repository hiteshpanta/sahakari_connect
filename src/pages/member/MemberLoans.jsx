import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Loader2, AlertCircle, Wallet, Plus, Clock, XCircle, PauseCircle, CheckCircle, Building2 } from 'lucide-react';
import { formatCurrency, formatDate, statusColor, calcLoanProgress } from '../../utils/formatters';
import EsewaModal from '../../components/Payment/EsewaModal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useMemberCooperative } from '../../context/MemberCooperativeContext';
import { useGetMemberLoansQuery } from '../../store/mainApi';
import CooperativeSwitcher from '../../components/member/CooperativeSwitcher';

const LOAN_STATUS_META = {
  pending: { label: 'Pending Approval', Icon: Clock, color: '#F59E0B' },
  on_hold: { label: 'On Hold', Icon: PauseCircle, color: '#06B6D4' },
  rejected: { label: 'Rejected', Icon: XCircle, color: '#EF4444' },
  active: { label: 'Active', Icon: CheckCircle, color: '#2A9D8F' }
};

export default function MemberLoans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const { activeCoopId, activeCoop } = useMemberCooperative();

  const hasMembership = Boolean(activeCoopId);

  const { data: loansData, isLoading, isError, error: loansError, refetch, isUninitialized } = useGetMemberLoansQuery(activeCoopId, { skip: !activeCoopId });

  const loadLoans = () => {
    if (isUninitialized) return;
    setLoading(true);
    refetch();
  };

  useEffect(() => {
    setLoading(isLoading);
    if (isError) {
      setError(loansError?.data?.message || 'Failed to load your loans');
    } else if (loansData !== undefined) {
      setLoans(loansData);
    }
  }, [loansData, isLoading, isError, loansError]);

  useEffect(loadLoans, []);

  const handlePayInstallment = (loan) => {
    setSelectedLoan(loan);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (receipt) => {
    setPaymentModalOpen(false);
    toast.success(receipt?.transactionCode ? 'Installment paid successfully via eSewa!' : 'Installment paid successfully!');
    loadLoans();
  };

  return (
    <div className="glass-page animate-fade-in">
      <div className="glass-orb glass-orb-2" />
      <div className="glass-orb glass-orb-3" />

      <div className="glass-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Loans</h1>
            <p className="page-subtitle">
              Track your loan applications and active loans
              {activeCoop?.cooperative?.name ? ` • ${activeCoop.cooperative.name}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <CooperativeSwitcher compact />
            {!loading && loans.length > 0 && (
              <span className="glass-chip glass-chip-solid">
                <Wallet size={14} /> Total Outstanding: {formatCurrency(loans.filter((l) => l.status === 'active').reduce((s, l) => s + l.outstanding, 0))}
              </span>
            )}
            {hasMembership ? (
              <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #2A9D8F, #21867A)' }} onClick={() => navigate('/member/loans/apply')}>
                <Plus size={15} /> Apply for Loan
              </button>
            ) : (
              <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }} onClick={() => navigate('/marketplace')}>
                <Building2 size={15} /> Join a Cooperative
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Loader2 size={30} className="spin" style={{ color: 'var(--emerald)' }} />
          </div>
        ) : error ? (
          <div className="glass-card" style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--red-light)' }}>
            <AlertCircle size={20} /> {error}
          </div>
        ) : loans.length > 0 ? (
          <div className="grid-2">
            {loans.map((loan) => {
              const progress = calcLoanProgress(loan.paidEmis, loan.totalEmis);
              return (
                <div key={loan._id} className="glass-card glass-card-hover" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div className="glassy-stat-icon" style={{ '--icon-bg': 'rgba(139,92,246,0.14)', '--accent': '#8B5CF6' }}>
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{loan.type} Loan</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{loan.loanNo}</p>
                      </div>
                    </div>
                    <span className={`badge ${statusColor(loan.status)}`}>{(LOAN_STATUS_META[loan.status] || { label: loan.status }).label}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Loan Amount</p>
                      <h3 style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(loan.amount)}</h3>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Outstanding</p>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--red-light)' }}>{formatCurrency(loan.outstanding)}</h3>
                    </div>
                  </div>

                  {(loan.status === 'pending' || loan.status === 'on_hold') && (
                    <div className="info-box warning" style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                      <Clock size={16} color="#F59E0B" />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>Awaiting manager approval</p>
                        <p style={{ fontSize: 11.5, opacity: 0.85 }}>
                          {loan.status === 'on_hold' ? 'Your application is on hold. The manager will resume it shortly.' : 'Your application is under review by the cooperative manager.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {loan.status === 'rejected' && (
                    <div className="info-box danger" style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                      <XCircle size={16} color="#EF4444" />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>Application rejected</p>
                        <p style={{ fontSize: 11.5, opacity: 0.85 }}>{loan.rejectionReason || 'No reason provided.'}</p>
                      </div>
                    </div>
                  )}

                  {loan.status === 'active' && (
                    <>
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Repayment Progress</span>
                          <span>{loan.paidEmis} / {loan.totalEmis} EMIs</span>
                        </div>
                        <div className="glass-progress">
                          <div className="glass-progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      <div className="info-box info" style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <Calendar size={18} />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600 }}>Next EMI: {formatCurrency(loan.emiAmount)}</p>
                            <p style={{ fontSize: 11, opacity: 0.8 }}>Due on {loan.nextEmiDate ? formatDate(loan.nextEmiDate) : '—'}</p>
                          </div>
                        </div>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => handlePayInstallment(loan)}
                        >
                          Pay
                        </button>
                      </div>
                    </>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, borderTop: '1px solid rgba(15,23,42,0.1)', paddingTop: 12, marginTop: 'auto' }}>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Interest Rate</p>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{loan.interestRate}% p.a.</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tenure</p>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{loan.tenure} months</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Applied On</p>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(loan.applyDate)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Purpose</p>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{loan.purpose || '—'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card glass-empty">
            <CreditCard size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3>No Loans Found</h3>
            <p style={{ marginTop: 4 }}>You have not applied for any loan yet.</p>
            {hasMembership ? (
              <button className="btn btn-primary" style={{ marginTop: 18, background: 'linear-gradient(135deg, #2A9D8F, #21867A)' }} onClick={() => navigate('/member/loans/apply')}>
                <Plus size={15} /> Apply for a Loan
              </button>
            ) : (
              <button className="btn btn-primary" style={{ marginTop: 18, background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }} onClick={() => navigate('/marketplace')}>
                <Building2 size={15} /> Join a Cooperative
              </button>
            )}
          </div>
        )}
      </div>

      {paymentModalOpen && selectedLoan && (
        <EsewaModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          amount={selectedLoan.emiAmount}
          purpose="loan_installment"
          entityId={selectedLoan._id}
          entityModel="Loan"
          loan={selectedLoan}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
