import React from 'react';
import { Wallet, CreditCard, TrendingUp } from 'lucide-react';
import { formatCurrency, calcLoanProgress, formatDate } from '../../utils/formatters';

export function LoanStatusCard({ loan, statusClass, statusLabel }) {
  return (
    <div
      className="glass-card-flat"
      style={{
        padding: 12,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div>
        <p style={{ fontSize: 13, fontWeight: 700 }}>
          {loan.type} Loan
        </p>

        <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
          {formatCurrency(loan.amount)} • {loan.loanNo}
        </p>
      </div>

      <span className={`badge ${statusClass}`}>{statusLabel}</span>
    </div>
  );
}

export function ActiveLoanCard({ loan, onPay }) {
  const progress = calcLoanProgress(loan.paidEmis, loan.totalEmis);

  return (
    <div
      className="glass-card-flat"
      style={{
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700 }}>
          {loan.type} Loan
        </span>
        <span className="badge badge-success">{loan.status}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
        <span style={{ color: 'var(--text-muted)' }}>Outstanding</span>
        <strong>{formatCurrency(loan.outstanding)}</strong>
      </div>

      <div className="glass-progress">
        <div className="glass-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span style={{ color: 'var(--text-muted)' }}>
          {loan.paidEmis} / {loan.totalEmis} EMIs paid
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          Next EMI {loan.nextEmiDate ? formatDate(loan.nextEmiDate) : '—'}
        </span>
      </div>

      <button className="btn btn-primary btn-sm" onClick={onPay}>
        <Wallet size={14} />
        Pay Installment
      </button>
    </div>
  );
}

export function LoanOverviewEmpty({ onApply }) {
  return (
    <div className="glass-empty">
      <TrendingUp
        size={40}
        style={{ margin: '0 auto 12px', opacity: 0.4 }}
      />
      No active loans yet.

      {onApply && (
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-primary btn-sm" onClick={onApply}>
            <CreditCard size={14} />
            Apply for a Loan
          </button>
        </div>
      )}
    </div>
  );
}
