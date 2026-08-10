import React from 'react';
import {
  Users, Wallet, ArrowLeftRight, CreditCard, TrendingUp,
  Building2, Clock, CheckCircle, ChevronRight, Loader2, Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { useNavigate, useOutletContext } from 'react-router-dom';
import KycApplicationsSection from '../../components/dashboard/KycApplicationsSection';
import { useGetDashboardStatsQuery } from '../../store/mainApi';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import { StatCard, StatGrid } from '../../components/dashboard/StatCard';
import ActivityList from '../../components/dashboard/ActivityList';
import EmptyState from '../../components/dashboard/EmptyState';

const compactNPR = (v) => {
  const n = Number(v) || 0;
  if (n >= 1e6) return `NPR ${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `NPR ${(n / 1e3).toFixed(0)}K`;
  return `NPR ${n.toLocaleString()}`;
};

const getTxnTone = (type) => {
  if (type === 'Deposit' || type === 'Interest Credit') {
    return { bg: 'rgba(42,157,143,0.12)', color: '#2A9D8F' };
  }
  if (type === 'Withdrawal') {
    return { bg: 'rgba(239,68,68,0.1)', color: '#F87171' };
  }
  return { bg: 'rgba(6,182,212,0.1)', color: '#06b6d4' };
};

const initialStats = {
  totalCustomers: 0,
  totalAccounts: 0,
  totalLoans: 0,
  totalBalance: 0,
  activeLoans: 0,
  pendingLoans: 0,
  activeBranches: 0,
  todayTransactions: 0,
  recentTransactions: [],
  branches: []
};

export default function ManagerDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';

  const { activeCooperativeId } = useOutletContext() || {};

  const { data: statsData, isLoading } = useGetDashboardStatsQuery(activeCooperativeId);
  const stats = { ...initialStats, ...(statsData || {}) };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  const statCards = [
    {
      label: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      icon: Users,
      color: '#06b6d4',
      iconBg: 'rgba(6,182,212,0.15)',
    },
    {
      label: 'Total Accounts',
      value: stats.totalAccounts.toLocaleString(),
      icon: Wallet,
      color: '#2A9D8F',
      iconBg: 'rgba(42,157,143,0.12)',
    },
    {
      label: 'Total Balance',
      value: compactNPR(stats.totalBalance),
      icon: TrendingUp,
      color: '#F59E0B',
      iconBg: 'rgba(245,158,11,0.12)',
    },
    {
      label: 'Active Loans',
      value: stats.activeLoans,
      icon: CreditCard,
      color: '#8B5CF6',
      iconBg: 'rgba(139,92,246,0.12)',
    },
  ];

  if (isAdmin || isManager) {
    statCards.push({
      label: "Today's Transactions",
      value: stats.todayTransactions,
      icon: ArrowLeftRight,
      color: '#06B6D4',
      iconBg: 'rgba(6,182,212,0.12)',
    });
    statCards.push({
      label: 'Active Branches',
      value: stats.activeBranches,
      icon: Building2,
      color: '#F97316',
      iconBg: 'rgba(249,115,22,0.12)',
    });
  }

  const txnItems = (stats.recentTransactions || []).map((txn) => {
    const tone = getTxnTone(txn.type);
    return {
      id: txn._id,
      title: `${txn.customerName} — ${txn.type}`,
      meta: `${txn.accountNo} • ${txn.branch} • ${txn.date}${txn.time ? ` ${txn.time}` : ''}`,
      iconBg: tone.bg,
      iconColor: tone.color,
      amount: formatCurrency(txn.amount),
      amountSign: txn.type === 'Withdrawal' ? '-' : '+',
    };
  });

  return (
    <div className="animate-fade-in">
      <DashboardHeader
        title={`Good ${greeting}, ${currentUser?.name?.split(' ')[0]} 👋`}
        subtitle={`${currentUser?.branch} • ${today}`}
        actions={
          (isAdmin || isManager) && (
            <button className="btn btn-primary" onClick={() => navigate('/customers/new')} id="btn-new-customer">
              <Plus size={15} /> New Customer
            </button>
          )
        }
      />

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={32} className="spin" style={{ color: 'var(--emerald)' }} />
        </div>
      ) : (
        <>
          {/* Stats */}
          <StatGrid>
            {statCards.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </StatGrid>

          {/* KYC Applications (from user/member section) */}
          {(isManager || isAdmin) && <KycApplicationsSection />}

          {/* Bottom Row */}
          <div className="grid-2-1">
            {/* Recent Transactions */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Recent Transactions</h3>
                  <p className="card-subtitle">Latest activity across all branches</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/transactions')}>
                  View all <ChevronRight size={14} />
                </button>
              </div>
              <ActivityList
                items={txnItems}
                icon={ArrowLeftRight}
                emptyTitle="No transactions yet"
                emptyMessage="Transactions will appear here as they happen."
                padded={false}
              />
            </div>

            {/* Quick Status Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              {/* Pending Actions */}
              <div className="card">
                <h3 className="card-title mb-4">Pending Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {stats.pendingLoans > 0 && (
                    <div className="info-box warning" style={{ cursor: 'pointer' }} onClick={() => navigate('/loans')}>
                      <Clock size={15} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{stats.pendingLoans} Loan Application{stats.pendingLoans > 1 ? 's' : ''}</p>
                        <span style={{ fontSize: 12, opacity: 0.8 }}>Awaiting review</span>
                      </div>
                    </div>
                  )}
                  <div className="info-box success">
                    <CheckCircle size={15} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>System Healthy</p>
                      <span style={{ fontSize: 12, opacity: 0.8 }}>All services operational</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Branch Snapshot */}
              {(isAdmin || isManager) && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Branch Snapshot</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/branches')}>View <ChevronRight size={13} /></button>
                  </div>
                  {stats.branches.length > 0 ? (
                    stats.branches.slice(0, 3).map(b => (
                      <div key={b._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{b.name}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.location}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--emerald)' }}>{b.customers} customers</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.loans} loans</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      icon={{ content: <Building2 size={24} color="var(--text-muted)" /> }}
                      title="No branches yet"
                      message="Branch information will appear here."
                      padded={false}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
