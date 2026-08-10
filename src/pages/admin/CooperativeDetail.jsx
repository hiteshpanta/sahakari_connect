import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Calendar, Users, ShieldCheck, Trash2, CheckCircle2, Ban, Crown, Clock, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';
import { useGetCooperativeByIdQuery, useGetPublicCooperativeQuery, useGetUsersQuery, useUpdateCooperativeStatusMutation, useDeleteCooperativeMutation } from '../../store/mainApi';

const STATUS_STYLES = {
  active: { label: 'Active', cls: 'badge-success' },
  pending: { label: 'Pending', cls: 'badge-warning' },
  inactive: { label: 'Inactive', cls: 'badge-neutral' },
  suspended: { label: 'Suspended', cls: 'badge-error' },
  rejected: { label: 'Rejected', cls: 'badge-error' },
};

export default function CooperativeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [coop, setCoop] = useState(null);
  const [profile, setProfile] = useState(null);
  const [memberUsers, setMemberUsers] = useState([]);
  const [managerUsers, setManagerUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: coopData, isLoading: coopLoading } = useGetCooperativeByIdQuery(id);
  const { data: publicProfile, isLoading: profileLoading } = useGetPublicCooperativeQuery(id);
  const { data: usersData, isLoading: usersLoading, isError: usersError } = useGetUsersQuery();

  useEffect(() => {
    setLoading(coopLoading || profileLoading || usersLoading);
  }, [coopLoading, profileLoading, usersLoading]);

  useEffect(() => {
    if (coopData !== undefined) setCoop(coopData);
  }, [coopData]);

  useEffect(() => {
    if (publicProfile !== undefined) setProfile(publicProfile.profile || null);
  }, [publicProfile]);

  useEffect(() => {
    if (usersError) {
      toast.error('Failed to load cooperative details');
    } else if (usersData !== undefined) {
      setMemberUsers(usersData);
      setManagerUsers(usersData.filter(u => u.role === 'manager'));
    }
  }, [usersData, usersError]);

  const [updateStatus] = useUpdateCooperativeStatusMutation();

  const changeStatus = async (status) => {
    setBusy(true);
    try {
      const updated = await updateStatus({ id, status }).unwrap();
      setCoop(updated);
      toast.success(`Cooperative is now ${status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setBusy(false);
    }
  };

  const changePlan = async (plan) => {
    setBusy(true);
    try {
      const updated = await updateStatus({ id, subscriptionPlan: plan }).unwrap();
      setCoop(updated);
      toast.success(`Subscription plan set to ${plan}`);
    } catch {
      toast.error('Failed to update plan');
    } finally {
      setBusy(false);
    }
  };

  const [deleteCoop] = useDeleteCooperativeMutation();

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteCoop(id).unwrap();
      toast.success('Cooperative deleted');
      navigate('/admin/cooperatives');
    } catch {
      toast.error('Failed to delete cooperative');
      setBusy(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!coop) return <div className="p-8">Cooperative not found</div>;

  const st = STATUS_STYLES[coop.status] || { label: coop.status, cls: 'badge-neutral' };
  const memberNames = (coop.members || []).map(mid => memberUsers.find(u => u._id === mid)).filter(Boolean);
  const managerNames = (coop.managers || []).map(mid => memberUsers.find(u => u._id === mid)).filter(Boolean);
  const hasProfile = profile && Object.keys(profile).length > 0;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-icon" onClick={() => navigate('/admin/cooperatives')}><ArrowLeft size={16} /></button>
          <div className="avatar avatar-md avatar-blue">{coop.name.substring(0, 2).toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <h1 className="page-title">{coop.name}</h1>
            <p className="page-subtitle">{coop.address}{coop.district ? `, ${coop.district}` : ''}{coop.province ? ` (${coop.province})` : ''}</p>
          </div>
          <span className={`badge ${st.cls}`}><span className="badge-dot" />{st.label}</span>
        </div>
      </div>

      {/* Action bar */}
      <div className="card mb-5" style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/c/${id}/dashboard`)}>
          <ExternalLink size={14} /> Open Workspace
        </button>
        {coop.status === 'pending' && (
          <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => changeStatus('active')}>
            <CheckCircle2 size={14} /> Approve Cooperative
          </button>
        )}
        {coop.status === 'active' && (
          <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => changeStatus('suspended')}>
            <Ban size={14} /> Suspend
          </button>
        )}
        {coop.status === 'suspended' && (
          <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => changeStatus('active')}>
            <CheckCircle2 size={14} /> Reactivate
          </button>
        )}
        <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => changePlan(coop.subscriptionPlan === 'free' ? 'basic' : 'free')}>
          <Crown size={14} /> Plan: {coop.subscriptionPlan} {coop.subscriptionPlan === 'free' ? '(upgrade to basic)' : '(downgrade to free)'}
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/admin/cooperatives/${id}/edit`)}>
          Edit Details
        </button>
        <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto', color: 'var(--red-light)' }} onClick={() => setConfirmDelete(true)}>
          <Trash2 size={14} /> Delete
        </button>
      </div>

      {confirmDelete && (
        <div className="card mb-5" style={{ borderColor: 'var(--red-light)' }}>
          <p style={{ marginBottom: 'var(--space-3)' }}>Are you sure? This permanently deletes the cooperative, its profile, ratings, and unlinks all users.</p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
            <button className="btn btn-danger btn-sm" disabled={busy} onClick={handleDelete}>Yes, Delete Cooperative</button>
          </div>
        </div>
      )}

      {/* Overview cards */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card" style={{ '--card-accent': '#06b6d4', '--icon-bg': 'rgba(6,182,212,0.1)' }}>
          <div className="stat-card-top"><div className="stat-card-icon"><Users size={18} color="#06b6d4" /></div></div>
          <div className="stat-card-value">{(coop.members || []).length}</div>
          <div className="stat-card-label">Members</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#8B5CF6', '--icon-bg': 'rgba(139,92,246,0.1)' }}>
          <div className="stat-card-top"><div className="stat-card-icon"><ShieldCheck size={18} color="#8B5CF6" /></div></div>
          <div className="stat-card-value">{(coop.managers || []).length}</div>
          <div className="stat-card-label">Managers</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#2A9D8F', '--icon-bg': 'rgba(42,157,143,0.1)' }}>
          <div className="stat-card-top"><div className="stat-card-icon"><Building2 size={18} color="#2A9D8F" /></div></div>
          <div className="stat-card-value">{coop.category}</div>
          <div className="stat-card-label">Category</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#F59E0B', '--icon-bg': 'rgba(245,158,11,0.1)' }}>
          <div className="stat-card-top"><div className="stat-card-icon"><Crown size={18} color="#F59E0B" /></div></div>
          <div className="stat-card-value" style={{ textTransform: 'capitalize' }}>{coop.subscriptionPlan}</div>
          <div className="stat-card-label">Subscription</div>
        </div>
      </div>

      <div className="grid-2 mb-6" style={{ marginTop: 'var(--space-6)' }}>
        {/* Info card */}
        <div className="card">
          <h3 className="card-title mb-5">Cooperative Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
              <MapPin size={16} /> {coop.address || '—'}{coop.district ? `, ${coop.district}` : ''}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
              <Mail size={16} /> {coop.contactEmail || '—'}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
              <Phone size={16} /> {coop.contactPhone || '—'}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
              <Calendar size={16} /> Established {coop.establishedYear || '—'}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
              <Clock size={16} /> Joined {formatDate(coop.createdAt)}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
              <Building2 size={16} /> Reg. No: <span className="td-mono">{coop.registrationNo || '—'}</span>
            </div>
          </div>

          {coop.subscriptionExpiry && (
            <p style={{ marginTop: 'var(--space-4)', fontSize: 13, color: 'var(--text-muted)' }}>
              Subscription expires: {formatDate(coop.subscriptionExpiry)}
            </p>
          )}
        </div>

        {/* Profile card */}
        <div className="card">
          <h3 className="card-title mb-5">Public Profile</h3>
          {hasProfile ? (
            <>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>{profile.description || 'No description'}</p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                {profile.colors?.primary && <span className="badge badge-neutral" style={{ color: profile.colors.primary }}>Brand: {profile.colors.primary}</span>}
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 'var(--space-2)' }}>Loan Products ({profile.loanProducts?.length || 0})</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {profile.loanProducts?.length ? profile.loanProducts.map(p => p.name).join(', ') : 'None'}
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, margin: 'var(--space-3) 0 var(--space-2)' }}>Savings Products ({profile.savingsProducts?.length || 0})</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {profile.savingsProducts?.length ? profile.savingsProducts.map(p => p.name).join(', ') : 'None'}
              </p>
            </>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No public profile yet. Members see generic info until the cooperative publishes a profile.</p>
          )}
        </div>
      </div>

      {/* Members & Managers */}
      <div className="grid-2 mb-6">
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header"><div><h3 className="card-title">Managers</h3></div></div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead>
              <tbody>
                {managerNames.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 16 }}>No managers assigned</td></tr>
                )}
                {managerNames.map(u => (
                  <tr key={u._id}>
                    <td className="td-primary">{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>{u.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="card-header"><div><h3 className="card-title">Members</h3><p className="card-subtitle">Approved members of this cooperative</p></div></div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead>
              <tbody>
                {memberNames.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 16 }}>No approved members yet</td></tr>
                )}
                {memberNames.map(u => (
                  <tr key={u._id}>
                    <td className="td-primary">{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>{u.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {managerUsers.length > 0 && managerUsers.length !== (coop.managers || []).length && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Note: {managerUsers.length} manager accounts exist on the platform. Assign them via "Edit Details".
        </p>
      )}
    </div>
  );
}
