import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Plus, Eye, Edit2, Phone, Loader2 } from 'lucide-react';
import { formatDate, getInitials, statusColor } from '../../utils/formatters';
import { useGetCustomersQuery } from '../../store/mainApi';

const AVATAR_COLORS = ['avatar-blue', 'avatar-emerald', 'avatar-gold', 'avatar-red'];

export default function CustomerList() {
  const navigate = useNavigate();
  const { activeCooperativeId } = useOutletContext() || {};
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: customersData, isLoading, isError } = useGetCustomersQuery();

  useEffect(() => {
    setLoading(isLoading);
    if (isError) {
      setCustomers([]);
    } else if (customersData !== undefined) {
      setCustomers(customersData);
    }
  }, [customersData, isLoading, isError]);

  const tenantCustomers = activeCooperativeId
    ? customers.filter(c => String(c.cooperativeId) === String(activeCooperativeId))
    : customers;

  const branches = [...new Set(tenantCustomers.map(c => c.branch))];

  const filtered = tenantCustomers.filter(c => {
    const matchSearch = (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search) ||
      (c.citizenshipNo || '').toLowerCase().includes(search.toLowerCase());
    const matchBranch = branchFilter === 'all' || c.branch === branchFilter;
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchBranch && matchStatus;
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{tenantCustomers.length} registered members</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/customers/new')} id="btn-add-customer">
          <Plus size={15} /> Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            id="search-customers"
            className="form-input"
            placeholder="Search by name, phone, or citizenship no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select id="filter-branch" className="form-select" style={{ width: 180 }} value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
          <option value="all">All Branches</option>
          {branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select id="filter-status" className="form-select" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {filtered.length} of {tenantCustomers.length} shown
        </span>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Branch</th>
                <th>Citizenship No.</th>
                <th>Join Date</th>
                <th>SMS</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40 }}>
                    <Loader2 size={22} className="spin" style={{ color: 'var(--emerald)' }} />
                  </td>
                </tr>
              ) : filtered.map((c, i) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className={`avatar avatar-sm ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <p className="td-primary">{c.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.gender || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={12} color="var(--text-muted)" />
                      {c.phone}
                    </div>
                  </td>
                  <td>{c.branch}</td>
                  <td className="td-mono">{c.citizenshipNo || '—'}</td>
                  <td>{formatDate(c.joinDate)}</td>
                  <td>
                    <span className={`badge ${c.smsEnabled ? 'badge-success' : 'badge-neutral'}`}>
                      {c.smsEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${statusColor(c.status)}`}>
                      <span className="badge-dot" />
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-outline btn-sm btn-icon"
                        onClick={() => navigate(`/customers/${c._id}`)}
                        title="View"
                        id={`btn-view-${c._id}`}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        className="btn btn-outline btn-sm btn-icon"
                        onClick={() => navigate(`/customers/${c._id}/edit`)}
                        title="Edit"
                        id={`btn-edit-${c._id}`}
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={24} color="var(--text-muted)" /></div>
              <h3>No customers found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
