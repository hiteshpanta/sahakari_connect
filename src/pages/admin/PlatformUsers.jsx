import React, { useState, useEffect } from 'react';
import { Search, User, Shield, Ban, CheckCircle2, Trash2 } from 'lucide-react';
import { getInitials } from '../../utils/formatters';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { users as mockUsers } from '../../data/mockData';
import { useGetUsersQuery, useUpdateUserStatusMutation, useDeleteUserMutation } from '../../store/mainApi';

const ROLE_BADGES = {
  admin: 'badge-danger',
  manager: 'badge-warning',
  staff: 'badge-info',
  member: 'badge-success',
};

export default function PlatformUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data: usersData, isLoading, isError, refetch } = useGetUsersQuery();

  useEffect(() => {
    setLoading(isLoading);
    if (isError) {
      setUsers(mockUsers);
      toast.error('Could not load users from server — showing sample data');
    } else if (usersData !== undefined) {
      setUsers(usersData);
    }
  }, [usersData, isLoading, isError]);

  const fetchUsers = () => {
    refetch();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const [updateUserStatus] = useUpdateUserStatusMutation();

  const changeStatus = async (id, status) => {
    try {
      const updated = await updateUserStatus({ id, status }).unwrap();
      setUsers(prev => prev.map(u => u._id === id ? updated : u));
      toast.success(`User ${status}`);
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const [deleteUser] = useDeleteUserMutation();

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteUser(deleteTarget._id).unwrap();
      setUsers(prev => prev.filter(u => u._id !== deleteTarget._id));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setBusy(false);
      setDeleteTarget(null);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch =
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    total: users.length,
    managers: users.filter(u => u.role === 'manager').length,
    members: users.filter(u => u.role === 'member').length,
    pending: users.filter(u => u.status === 'pending').length,
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Users</h1>
          <p className="page-subtitle">All users across every cooperative</p>
        </div>
      </div>

      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card" style={{ '--card-accent': '#06b6d4', '--icon-bg': 'rgba(6,182,212,0.1)' }}>
          <div className="stat-card-top"><div className="stat-card-icon"><User size={18} color="#06b6d4" /></div></div>
          <div className="stat-card-value">{counts.total}</div>
          <div className="stat-card-label">Total Users</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#F59E0B', '--icon-bg': 'rgba(245,158,11,0.1)' }}>
          <div className="stat-card-top"><div className="stat-card-icon"><Shield size={18} color="#F59E0B" /></div></div>
          <div className="stat-card-value">{counts.managers}</div>
          <div className="stat-card-label">Managers</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#2A9D8F', '--icon-bg': 'rgba(42,157,143,0.1)' }}>
          <div className="stat-card-top"><div className="stat-card-icon"><User size={18} color="#2A9D8F" /></div></div>
          <div className="stat-card-value">{counts.members}</div>
          <div className="stat-card-label">Members</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#EF4444', '--icon-bg': 'rgba(239,68,68,0.1)' }}>
          <div className="stat-card-top"><div className="stat-card-icon"><Ban size={18} color="#EF4444" /></div></div>
          <div className="stat-card-value">{counts.pending}</div>
          <div className="stat-card-label">Pending</div>
        </div>
      </div>

      <div className="filters-row" style={{ marginTop: 'var(--space-6)' }}>
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            className="form-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" style={{ width: 150 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
          <option value="member">Member</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, marginTop: 'var(--space-4)' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Cooperative</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm avatar-blue">{getInitials(u.name)}</div>
                      <div>
                        <p className="td-primary">{u.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${ROLE_BADGES[u.role] || 'badge-neutral'}`}>{u.role}</span>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {u.cooperativeId ? String(u.cooperativeId).substring(0, 8) + '…' : '—'}
                  </td>
                  <td style={{ fontSize: 12 }}>{u.phone || '—'}</td>
                  <td style={{ fontSize: 12 }}>{formatDate(u.joinDate)}</td>
                  <td>
                    <span className={`badge badge-${u.status === 'active' ? 'success' : u.status === 'pending' ? 'warning' : 'neutral'}`}>
                      <span className="badge-dot" />{u.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {u.role !== 'admin' && (
                        <>
                          {u.status === 'active' ? (
                            <button className="btn btn-outline btn-sm btn-icon" title="Deactivate" onClick={() => changeStatus(u._id, 'inactive')}>
                              <Ban size={12} color="var(--red-light)" />
                            </button>
                          ) : (
                            <button className="btn btn-outline btn-sm btn-icon" title="Activate" onClick={() => changeStatus(u._id, 'active')}>
                              <CheckCircle2 size={12} color="var(--emerald)" />
                            </button>
                          )}
                          <button className="btn btn-outline btn-sm btn-icon" title="Delete" onClick={() => setDeleteTarget(u)}>
                            <Trash2 size={12} color="var(--red-light)" />
                          </button>
                        </>
                      )}
                      {u.role === 'admin' && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={24} color="var(--text-muted)" /></div>
              <h3>No users found</h3>
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete User?</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Permanently remove <strong>{deleteTarget.name}</strong> ({deleteTarget.email})? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="btn btn-danger" disabled={busy} onClick={handleDelete}>
                  {busy ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
