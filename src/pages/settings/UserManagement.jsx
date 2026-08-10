import React, { useState } from 'react';
import { Plus, Search, Shield, User, Edit2, Trash2 } from 'lucide-react';
import { users, ROLES } from '../../data/mockData';
import { getInitials, statusColor } from '../../utils/formatters';

export default function UserManagement() {
  const [search, setSearch] = useState('');
  
  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system access and roles</p>
        </div>
        <button className="btn btn-primary" id="btn-add-user">
          <Plus size={15} /> Add User
        </button>
      </div>

      <div className="card mb-5">
        <div className="filters-row mb-0">
          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input 
              id="search-users" 
              className="form-input" 
              placeholder="Search users..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Phone</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className={`avatar avatar-sm ${
                        u.role === ROLES.ADMIN ? 'avatar-red' : 
                        u.role === ROLES.MANAGER ? 'avatar-gold' : 'avatar-emerald'
                      }`}>
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <p className="td-primary">{u.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      u.role === ROLES.ADMIN ? 'badge-danger' : 
                      u.role === ROLES.MANAGER ? 'badge-warning' : 'badge-success'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.branch}</td>
                  <td style={{ fontSize: 12 }}>{u.phone}</td>
                  <td style={{ fontSize: 12 }}>{u.joinDate}</td>
                  <td>
                    <span className={`badge badge-${statusColor(u.status)}`}>
                      <span className="badge-dot" />{u.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-outline btn-sm btn-icon" title="Edit"><Edit2 size={12} /></button>
                      <button className="btn btn-danger btn-sm btn-icon" title="Delete"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
