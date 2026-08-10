import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, CheckCircle2, Ban, Trash2, Building2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cooperatives as mockCooperatives } from '../../data/mockData';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { useGetCooperativesQuery, useUpdateCooperativeStatusMutation, useDeleteCooperativeMutation } from '../../store/mainApi';

export default function CooperativeList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data: coopData, isLoading, isError, refetch } = useGetCooperativesQuery();

  useEffect(() => {
    setLoading(isLoading);
    if (isError) {
      setData(mockCooperatives);
    } else if (coopData !== undefined) {
      setData(coopData);
    }
  }, [coopData, isLoading, isError]);

  const fetchData = () => {
    refetch();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [updateCoopStatus] = useUpdateCooperativeStatusMutation();

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await updateCoopStatus({ id, status: newStatus }).unwrap();
      setData(prev => prev.map(c => (c._id || c.id) === id ? updated : c));
      toast.success(`Cooperative is now ${newStatus}`);
    } catch {
      setData(prev => prev.map(c => (c._id || c.id) === id ? { ...c, status: newStatus } : c));
    }
  };

  const [deleteCoop] = useDeleteCooperativeMutation();

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteCoop(deleteTarget._id).unwrap();
      setData(prev => prev.filter(c => c._id !== deleteTarget._id));
      toast.success('Cooperative deleted');
    } catch {
      toast.error('Failed to delete cooperative');
    } finally {
      setBusy(false);
      setDeleteTarget(null);
    }
  };

  const getId = (c) => c._id || c.id;

  const filtered = data.filter(c => {
    const matchSearch = (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.registrationNo || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.contactEmail || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return <span className="badge badge-success"><span className="badge-dot"/>Active</span>;
      case 'pending': return <span className="badge badge-warning"><span className="badge-dot"/>Pending</span>;
      case 'suspended': return <span className="badge badge-error"><span className="badge-dot"/>Suspended</span>;
      default: return <span className="badge badge-neutral"><span className="badge-dot"/>{status || 'inactive'}</span>;
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cooperatives</h1>
          <p className="page-subtitle">Manage all tenant sahakaris</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/cooperatives/new')}>
          <Plus size={15} /> Add Cooperative
        </button>
      </div>

      <div className="filters-row">
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            className="form-input"
            placeholder="Search by name, reg no or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cooperative Name</th>
                <th>Contact</th>
                <th>Reg. No.</th>
                <th>Plan</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={getId(c)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm avatar-blue">
                        {(c.name || '??').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="td-primary">{c.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.address}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>{c.contactEmail}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.contactPhone}</p>
                  </td>
                  <td className="td-mono">{c.registrationNo || '—'}</td>
                  <td>
                    <span style={{ textTransform: 'capitalize', fontSize: 13, fontWeight: 500 }}>
                      {c.subscriptionPlan}
                    </span>
                  </td>
                  <td>{formatDate(c.createdAt)}</td>
                  <td>{getStatusBadge(c.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm btn-icon" title="Open Workspace" onClick={() => navigate(`/c/${getId(c)}/dashboard`)}>
                        <ExternalLink size={13} color="var(--emerald)" />
                      </button>
                      {c.status === 'pending' && (
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => handleStatusChange(getId(c), 'active')} title="Approve">
                          <CheckCircle2 size={14} color="var(--emerald)" />
                        </button>
                      )}
                      {c.status === 'active' && (
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => handleStatusChange(getId(c), 'suspended')} title="Suspend">
                          <Ban size={14} color="var(--red-light)" />
                        </button>
                      )}
                      {c.status === 'suspended' && (
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => handleStatusChange(getId(c), 'active')} title="Activate">
                          <CheckCircle2 size={14} color="var(--emerald)" />
                        </button>
                      )}
                      <button className="btn btn-outline btn-sm btn-icon" title="View details" onClick={() => navigate(`/admin/cooperatives/${getId(c)}`)}>
                        <Eye size={13} />
                      </button>
                      <button className="btn btn-outline btn-sm btn-icon" title="Edit" onClick={() => navigate(`/admin/cooperatives/${getId(c)}/edit`)}>
                        <Edit2 size={13} />
                      </button>
                      <button className="btn btn-outline btn-sm btn-icon" title="Delete" onClick={() => setDeleteTarget(c)}>
                        <Trash2 size={13} color="var(--red-light)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={24} color="var(--text-muted)" /></div>
              <h3>No cooperatives found</h3>
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Building2 size={18} color="var(--red-light)" /> Delete Cooperative?
              </h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                This will permanently remove <strong>{deleteTarget.name}</strong> and its associated profile, ratings, and user links. This action cannot be undone.
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
