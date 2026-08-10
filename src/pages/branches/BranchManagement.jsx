import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Phone, Users, Edit2 } from 'lucide-react';
import { branches } from '../../data/mockData';
import { formatDate, statusColor } from '../../utils/formatters';

export default function BranchManagement() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Branch Management</h1>
          <p className="page-subtitle">{branches.length} branches across Nepal</p>
        </div>
        <button className="btn btn-primary" id="btn-add-branch">
          <Plus size={15} /> Add Branch
        </button>
      </div>

      {/* Summary */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': '#2A9D8F' }}>
          <div className="stat-card-value">{branches.filter(b => b.status === 'active').length}</div>
          <div className="stat-card-label">Active Branches</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#06b6d4' }}>
          <div className="stat-card-value">{branches.reduce((s, b) => s + b.customers, 0).toLocaleString()}</div>
          <div className="stat-card-label">Total Customers</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#F59E0B' }}>
          <div className="stat-card-value">{branches.reduce((s, b) => s + b.loans, 0)}</div>
          <div className="stat-card-label">Total Loans</div>
        </div>
      </div>

      {/* Branch Cards */}
      <div className="grid-2">
        {branches.map((b, i) => (
          <div key={b._id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: 42, height: 42,
                  background: ['rgba(6,182,212,0.15)', 'rgba(42,157,143,0.12)', 'rgba(245,158,11,0.12)', 'rgba(139,92,246,0.12)', 'rgba(239,68,68,0.1)'][i % 5],
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: ['#06b6d4', '#2A9D8F', '#F59E0B', '#8B5CF6', '#EF4444'][i % 5] }}>
                    {b.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>{b.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b._id}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className={`badge badge-${statusColor(b.status)}`}><span className="badge-dot" />{b.status}</span>
                <button className="btn btn-outline btn-sm btn-icon" id={`btn-edit-branch-${b._id}`}><Edit2 size={12} /></button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <MapPin size={12} /> {b.location}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <Phone size={12} /> {b.phone}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <Users size={12} /> Manager: {b.manager}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
              {[
                { label: 'Customers', value: b.customers.toLocaleString(), color: '#06b6d4' },
                { label: 'Accounts', value: b.accounts.toLocaleString(), color: '#2A9D8F' },
                { label: 'Loans', value: b.loans, color: '#F59E0B' },
              ].map(m => (
                <div key={m.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: m.color }}>{m.value}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
