import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Users, CheckCircle, AlertCircle,
  RefreshCw, MapPin, Clock, UserPlus, ShieldCheck, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cooperatives as mockCooperatives } from '../../data/mockData';
import { getInitials, formatDate, statusColor } from '../../utils/formatters';
import { useGetAdminAnalyticsQuery, useGetCooperativesQuery, useGetUsersQuery, useUpdateCooperativeStatusMutation } from '../../store/mainApi';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import { StatCard, StatGrid } from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import AreaTrendChart from '../../components/dashboard/AreaTrendChart';
import DonutChart from '../../components/dashboard/DonutChart';
import DataTable from '../../components/dashboard/DataTable';
import ListItemCard from '../../components/dashboard/ListItemCard';

const COLORS = ['#2A9D8F', '#06b6d4', '#F59E0B', '#EF4444', '#8B5CF6'];

const PLAN_BADGES = { free: 'badge-neutral', basic: 'badge-info', premium: 'badge-warning' };
const ROLE_BADGES = { admin: 'badge-danger', manager: 'badge-warning', staff: 'badge-info', member: 'badge-success' };

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const monthLabel = (key) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1).toLocaleDateString('en-GB', { month: 'short' });
};

const buildOnboardingTrend = (coops, months = 6) => {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: monthKey(d), label: monthLabel(monthKey(d)), count: 0 });
  }
  const map = {};
  coops.forEach(c => {
    if (!c.createdAt) return;
    const k = monthKey(new Date(c.createdAt));
    map[k] = (map[k] || 0) + 1;
  });
  buckets.forEach(b => { b.count = map[b.key] || 0; });
  return buckets;
};

const initialStats = {
  total: 0,
  active: 0,
  pending: 0,
  totalUsers: 0,
  subscriptionData: []
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(initialStats);
  const [coops, setCoops] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyCoop, setBusyCoop] = useState(null);

  const { data: analytics, isLoading: analyticsLoading, isError: analyticsError, refetch: refetchAnalytics } = useGetAdminAnalyticsQuery();
  const { data: coopsData, isLoading: coopsLoading, isError: coopsError, refetch: refetchCoops } = useGetCooperativesQuery();
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useGetUsersQuery();

  useEffect(() => {
    setLoading(analyticsLoading || coopsLoading || usersLoading);
  }, [analyticsLoading, coopsLoading, usersLoading]);

  useEffect(() => {
    if (analyticsError) {
      setStats({
        total: mockCooperatives.length,
        active: mockCooperatives.filter(c => c.status === 'active').length,
        pending: mockCooperatives.filter(c => c.status === 'pending').length,
        totalUsers: 1254,
        subscriptionData: [
          { name: 'Free', value: mockCooperatives.filter(c => c.subscriptionPlan === 'free').length },
          { name: 'Basic', value: mockCooperatives.filter(c => c.subscriptionPlan === 'basic').length },
          { name: 'Premium', value: mockCooperatives.filter(c => c.subscriptionPlan === 'premium').length }
        ]
      });
    } else if (analytics !== undefined) {
      setStats({
        total: analytics.totalCooperatives,
        active: analytics.activeCooperatives,
        pending: analytics.pendingCooperatives,
        totalUsers: analytics.totalUsers,
        subscriptionData: analytics.subscriptionData || [],
      });
    }
  }, [analytics, analyticsError]);

  useEffect(() => {
    if (coopsError) {
      setCoops(mockCooperatives);
    } else if (coopsData !== undefined) {
      setCoops(coopsData);
    }
  }, [coopsData, coopsError]);

  useEffect(() => {
    if (usersData !== undefined) setUsers(usersData);
  }, [usersData]);

  const fetchAll = useCallback(() => {
    refetchAnalytics();
    refetchCoops();
    refetchUsers();
  }, [refetchAnalytics, refetchCoops, refetchUsers]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const [updateCoopStatusMutation] = useUpdateCooperativeStatusMutation();

  const updateCoopStatus = async (id, status, label) => {
    setBusyCoop(id);
    try {
      await updateCoopStatusMutation({ id, status }).unwrap();
      toast.success(`Cooperative ${label}`);
      fetchAll();
    } catch {
      toast.error(`Could not ${label.toLowerCase()} cooperative`);
    } finally {
      setBusyCoop(null);
    }
  };

  const sortedCoops = [...coops].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const recentCoops = sortedCoops.slice(0, 6);
  const pendingCoops = coops.filter(c => c.status === 'pending');
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt || b.joinDate || 0) - new Date(a.createdAt || a.joinDate || 0))
    .slice(0, 6);
  const onboardingTrend = buildOnboardingTrend(coops);
  const pieData = stats.subscriptionData.length ? stats.subscriptionData : [{ name: 'No data', value: 1 }];

  const statCards = [
    {
      label: 'Total Cooperatives',
      value: stats.total.toLocaleString(),
      icon: Building2,
      color: '#06b6d4',
      iconBg: 'rgba(6,182,212,0.1)',
      footnote: 'Across all provinces',
    },
    {
      label: 'Active Tenants',
      value: stats.active.toLocaleString(),
      icon: CheckCircle,
      color: '#2A9D8F',
      iconBg: 'rgba(42,157,143,0.1)',
      footnote: `${stats.total ? Math.round((stats.active / stats.total) * 100) : 0}% of total`,
    },
    {
      label: 'Pending Approvals',
      value: stats.pending.toLocaleString(),
      icon: AlertCircle,
      color: '#F59E0B',
      iconBg: 'rgba(245,158,11,0.1)',
      footnote: stats.pending ? 'Needs your review' : 'All caught up',
    },
    {
      label: 'Platform Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: '#8B5CF6',
      iconBg: 'rgba(139,92,246,0.1)',
      footnote: 'Members, staff & managers',
    },
  ];

  const coopColumns = [
    {
      key: 'name',
      label: 'Cooperative',
      render: (c) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="avatar avatar-sm avatar-blue">{getInitials(c.name)}</div>
          <div>
            <p className="td-primary">{c.name}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.district || c.address}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'province',
      label: 'Province',
      style: { fontSize: 12 },
      render: (c) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
          <MapPin size={12} color="var(--text-muted)" /> {c.province || '—'}
        </span>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (c) => (
        <span className={`badge ${PLAN_BADGES[c.subscriptionPlan] || 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>
          {c.subscriptionPlan || 'free'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      style: { fontSize: 12, color: 'var(--text-secondary)' },
      render: (c) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Clock size={12} color="var(--text-muted)" /> {formatDate(c.createdAt)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (c) => (
        <span className={`badge badge-${statusColor(c.status)}`}>
          <span className="badge-dot" />{c.status}
        </span>
      ),
    },
  ];

  const pendingItems = pendingCoops.slice(0, 6).map(c => ({
    id: c._id,
    avatar: getInitials(c.name),
    avatarStyle: { background: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
    title: c.name,
    subtitle: [c.address, c.district].filter(Boolean).join(', '),
    actions: (
      <>
        <button
          className="btn btn-outline btn-sm btn-icon"
          title="Approve"
          disabled={busyCoop === c._id}
          onClick={() => updateCoopStatus(c._id, 'active', 'approved')}
        >
          <ShieldCheck size={13} color="var(--emerald)" />
        </button>
        <button
          className="btn btn-outline btn-sm btn-icon"
          title="Reject"
          disabled={busyCoop === c._id}
          onClick={() => updateCoopStatus(c._id, 'rejected', 'rejected')}
        >
          <XCircle size={13} color="var(--red-light)" />
        </button>
      </>
    ),
  }));

  const userColumns = [
    {
      key: 'user',
      label: 'User',
      render: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="avatar avatar-sm avatar-blue">{getInitials(u.name)}</div>
          <div>
            <p className="td-primary">{u.name}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (u) => (
        <span className={`badge ${ROLE_BADGES[u.role] || 'badge-neutral'}`}>{u.role}</span>
      ),
    },
    {
      key: 'cooperativeId',
      label: 'Cooperative',
      style: { fontSize: 12, color: 'var(--text-secondary)' },
      render: (u) => (u.cooperativeId ? String(u.cooperativeId).substring(0, 8) + '…' : '—'),
    },
    {
      key: 'joined',
      label: 'Joined',
      style: { fontSize: 12, color: 'var(--text-secondary)' },
      render: (u) => formatDate(u.createdAt || u.joinDate),
    },
  ];

  return (
    <div className="animate-fade-in">
      <DashboardHeader
        title="Platform Analytics"
        subtitle="Overview of cooperatives, users and platform health"
        actions={
          <button className="btn btn-outline btn-sm" onClick={fetchAll} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        }
      />

      {/* Stat cards */}
      <StatGrid>
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </StatGrid>

      {/* Recent cooperatives + pending approvals */}
      <div className="grid-2" style={{ marginTop: 'var(--space-6)', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 className="card-title">Recent Cooperatives</h3>
              <p className="card-subtitle">Latest onboarded tenants</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/cooperatives')}>View all</button>
          </div>
          <DataTable
            columns={coopColumns}
            rows={recentCoops}
            onRowClick={(c) => navigate(`/admin/cooperatives/${c._id}`)}
            emptyIcon={<Building2 size={24} color="var(--text-muted)" />}
            emptyTitle="No cooperatives yet"
            minWidth={0}
          />
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 className="card-title">Pending Approvals</h3>
              <p className="card-subtitle">Cooperatives awaiting review</p>
            </div>
            <span className={`badge ${pendingCoops.length ? 'badge-warning' : 'badge-success'}`}>
              <span className="badge-dot" />{pendingCoops.length}
            </span>
          </div>
          <ListItemCard
            items={pendingItems}
            empty={
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 'var(--space-6)', textAlign: 'center' }}>
                <div className="empty-state-icon" style={{ background: 'rgba(42,157,143,0.1)' }}>
                  <CheckCircle size={26} color="var(--emerald)" />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>All caught up!</h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', maxWidth: 220 }}>No cooperatives are waiting for approval right now.</p>
              </div>
            }
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2 mb-6" style={{ marginTop: 'var(--space-6)' }}>
        <ChartCard
          title="Onboarding Trend"
          subtitle="New cooperatives per month"
        >
          <AreaTrendChart
            data={onboardingTrend}
            color="#2A9D8F"
            gradientId="colorRev"
            unit="cooperatives"
            name="Onboarded"
          />
        </ChartCard>

        <ChartCard
          title="Subscription Distribution"
          subtitle="Active cooperatives by plan"
        >
          <DonutChart
            data={pieData}
            colors={COLORS}
            valueFormatter={(v) => `${v} Cooperatives`}
          />
        </ChartCard>
      </div>

      {/* Recent users */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 'var(--space-6)' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 className="card-title">Recently Joined Users</h3>
            <p className="card-subtitle">Latest accounts across the platform</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/users')}>
            <UserPlus size={14} /> Manage users
          </button>
        </div>
        <DataTable
          columns={userColumns}
          rows={recentUsers}
          emptyIcon={<Users size={24} color="var(--text-muted)" />}
          emptyTitle="No users yet"
          minWidth={0}
        />
      </div>
    </div>
  );
}
