import React from 'react';
import {
  CreditCard,
  ArrowLeftRight,
  Landmark,
  Percent,
  Loader2,
  ArrowDownToLine,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useMemberCooperative } from '../../context/MemberCooperativeContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  useGetMemberDashboardQuery,
} from '../../store/mainApi';

import DashboardHeader from '../../components/dashboard/DashboardHeader';
import CooperativeSwitcher from '../../components/member/CooperativeSwitcher';
import { StatCard, StatGrid } from '../../components/dashboard/StatCard';
import BalanceCard from '../../components/dashboard/BalanceCard';
import QuickActions from '../../components/dashboard/QuickActions';
import ActivityList from '../../components/dashboard/ActivityList';
import CooperativeMembershipGrid from '../../components/dashboard/CooperativeMembershipGrid';
import { LoanStatusCard, ActiveLoanCard, LoanOverviewEmpty } from '../../components/dashboard/LoanCards';
import {
  getTransactionTone,
  isOutflow,
  getPaymentMethodLabel,
  getToday,
} from '../../components/dashboard/memberUtils';

const COOP_STATUS = {
  active: {
    label: 'Active Member',
    className: 'badge-success',
  },
  pending_approval: {
    label: 'Pending Approval',
    className: 'badge-warning',
  },
  on_hold: {
    label: 'On Hold',
    className: 'badge-info',
  },
  rejected: {
    label: 'Rejected',
    className: 'badge-danger',
  },
};

const TRANSACTION_TONES = {
  Withdrawal: {
    color: '#ef4444',
    background: 'rgba(239,68,68,0.12)',
  },
  'Loan Payment': {
    color: '#8b5cf6',
    background: 'rgba(139,92,246,0.12)',
  },
  Transfer: {
    color: '#06b6d4',
    background: 'rgba(6,182,212,0.12)',
  },
};

const ACTIONS = [
  {
    label: 'Deposit Money',
    sub: 'Add to an account',
    icon: ArrowDownToLine,
    color: '#2A9D8F',
    to: '/member/accounts',
  },
  {
    label: 'Apply for Loan',
    sub: 'New loan request',
    icon: CreditCard,
    color: '#8b5cf6',
    to: '/member/loans/apply',
  },
  {
    label: 'Pay Loan EMI',
    sub: 'Make an installment',
    icon: CreditCard,
    color: '#8b5cf6',
    to: '/member/loans',
  },
  {
    label: 'Statements',
    sub: 'Download history',
    icon: ArrowLeftRight,
    color: '#06b6d4',
    to: '/member/transactions',
  },
];

function DashboardLoader() {
  return (
    <div
      className="glass-content"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <Loader2 size={30} className="spin" style={{ color: 'var(--emerald)' }} />
    </div>
  );
}

export default function MemberDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { activeCoopId, activeCoop, memberships: cooperatives, loading: cooperativesLoading } = useMemberCooperative();

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
  } = useGetMemberDashboardQuery(activeCoopId, { skip: !activeCoopId });

  if (dashboardLoading) {
    return <DashboardLoader />;
  }

  const {
    summary = {},
    accounts = [],
    loans = [],
    recentTransactions = [],
  } = dashboardData || {};

  const {
    totalBalance = 0,
    totalAccounts = 0,
    activeLoans: activeLoanCount = 0,
    savingsAccounts = 0,
    totalOutstanding = 0,
  } = summary;

  const activeLoans = loans.filter((loan) => loan.status === 'active');

  const pendingLoans = loans.filter(
    (loan) =>
      loan.status === 'pending' ||
      loan.status === 'on_hold'
  );

  const rejectedLoans = loans.filter(
    (loan) => loan.status === 'rejected'
  );

  const firstName = currentUser?.name?.split(' ')[0] || 'Member';

  const balanceChips = [
    { label: 'Active Loans', value: activeLoanCount },
    { label: 'Savings Accounts', value: savingsAccounts },
    { label: 'Outstanding', value: formatCurrency(totalOutstanding) },
  ];

  const statCards = [
    {
      label: 'My Accounts',
      value: totalAccounts,
      icon: Landmark,
      color: '#2A9D8F',
      variant: 'glass',
    },
    {
      label: 'Active Loans',
      value: activeLoanCount,
      icon: CreditCard,
      color: '#8b5cf6',
      variant: 'glass',
    },
    {
      label: 'Total Outstanding',
      value: formatCurrency(totalOutstanding),
      icon: Percent,
      color: '#ef4444',
      variant: 'glass',
    },
  ];

  const txnItems = recentTransactions.map((transaction) => {
    const tone = getTransactionTone(transaction.type, TRANSACTION_TONES);
    const outflow = isOutflow(transaction.type);

    return {
      id: transaction._id,
      title: transaction.type,
      iconBg: tone.background,
      iconColor: tone.color,
      badge:
        transaction.paymentMethod && transaction.paymentMethod !== 'cash' ? (
          <span
            className={`badge ${transaction.paymentMethod === 'esewa' ? 'badge-success' : 'badge-info'}`}
            style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}
          >
            {getPaymentMethodLabel(transaction.paymentMethod)}
          </span>
        ) : null,
      meta: `${transaction.accountNo} • ${formatDate(transaction.date)}${transaction.transactionCode ? ` • ${transaction.transactionCode}` : ''}`,
      remark: transaction.remarks,
      amount: formatCurrency(transaction.amount),
      amountSign: outflow ? '-' : '+',
    };
  });

  return (
    <div className="glass-content">
      <DashboardHeader
        title={`Welcome back, ${firstName}`}
        subtitle={`Your Member Dashboard • ${getToday()}`}
        actions={activeCoop && <CooperativeSwitcher />}
      />

      {/* Balance */}
      <BalanceCard
        label="Total Balance"
        value={formatCurrency(totalBalance)}
        footnote={
          <>
            Across <strong>{totalAccounts}</strong>{' '}
            {totalAccounts === 1 ? 'account' : 'accounts'}
            {activeCoop?.cooperative?.name ? (
              <> in <strong>{activeCoop.cooperative.name}</strong></>
            ) : null}
          </>
        }
        chips={balanceChips}
        accounts={accounts}
        accountRenderer={(account) => (
          <div
            key={account._id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '10px 14px',
            }}
          >
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {account.accountNo}
              </p>
              <p style={{ fontSize: 11.5, opacity: 0.85 }}>
                {account.type} • {account.branch}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 14, fontWeight: 800 }}>
                {formatCurrency(account.balance)}
              </p>
              <span className={`badge ${account.status === 'active' ? 'badge-success' : account.status === 'frozen' ? 'badge-warning' : 'badge-neutral'}`}>
                {account.status}
              </span>
            </div>
          </div>
        )}
      />

      {/* Stats */}
      <StatGrid
        style={{
          gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
          gap: 16,
          marginTop: 20,
        }}
      >
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </StatGrid>

      {/* Quick Actions */}
      <QuickActions actions={ACTIONS} />

      {/* Cooperatives */}
      <div className="glass-card" style={{ marginTop: 20 }}>
        <div className="card-header" style={{ padding: '0 0 14px' }}>
          <div>
            <h3 className="card-title">My Cooperatives</h3>
            <p className="card-subtitle">Your membership status across cooperatives</p>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/marketplace')}>
            <Plus size={14} />
            Browse more
          </button>
        </div>

        <CooperativeMembershipGrid
          cooperatives={cooperatives}
          loading={cooperativesLoading}
          statusMap={COOP_STATUS}
          emptyAction={
            <button className="btn btn-primary" onClick={() => navigate('/marketplace')}>
              <Landmark size={14} />
              Browse Cooperatives
            </button>
          }
        />
      </div>

      {/* Transactions + Loans */}
      <div className="grid-2-1" style={{ marginTop: 20 }}>
        {/* Transactions */}
        <div className="glass-card">
          <div className="card-header" style={{ padding: '0 0 14px' }}>
            <div>
              <h3 className="card-title">Recent Transactions</h3>
              <p className="card-subtitle">Your latest account activity</p>
            </div>

            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/member/transactions')}>
              View all
              <ChevronRight size={14} />
            </button>
          </div>

          {txnItems.length > 0 ? (
            <ActivityList items={txnItems} icon={ArrowLeftRight} />
          ) : (
            <div className="glass-empty">No recent transactions.</div>
          )}
        </div>

        {/* Loans */}
        <div
          className="glass-card"
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div>
            <h3 className="card-title">Loan Overview</h3>
            <p className="card-subtitle">Your active repayment plan</p>
          </div>

          {/* Pending Loans */}
          {pendingLoans.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pendingLoans.map((loan) => (
                <LoanStatusCard
                  key={loan._id}
                  loan={loan}
                  statusClass={loan.status === 'on_hold' ? 'badge-info' : 'badge-warning'}
                  statusLabel={loan.status === 'on_hold' ? 'On Hold' : 'Awaiting Approval'}
                />
              ))}
            </div>
          )}

          {/* Rejected Loans */}
          {rejectedLoans.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rejectedLoans.map((loan) => (
                <LoanStatusCard
                  key={loan._id}
                  loan={loan}
                  statusClass="badge-danger"
                  statusLabel="Rejected"
                />
              ))}
            </div>
          )}

          {/* Active Loans */}
          {activeLoans.length > 0 ? (
            activeLoans.map((loan) => (
              <ActiveLoanCard
                key={loan._id}
                loan={loan}
                onPay={() => navigate('/member/loans')}
              />
            ))
          ) : (
            <LoanOverviewEmpty onApply={() => navigate('/member/loans/apply')} />
          )}
        </div>
      </div>
    </div>
  );
}
