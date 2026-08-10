import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, Clock, AlertCircle, Database } from 'lucide-react';
import { useOffline } from '../../context/OfflineContext';
import { pendingSyncQueue } from '../../data/mockData';
import { formatDate } from '../../utils/formatters';

export default function OfflineSyncPage() {
  const { isOnline, pendingCount, lastSynced, isSyncing, triggerSync } = useOffline();

  const steps = [
    { label: 'Detect offline status', done: true },
    { label: 'Store operations in local encrypted storage', done: true },
    { label: 'Internet connection restored', done: isOnline },
    { label: 'Upload pending changes to cloud', done: isOnline && pendingCount === 0 },
    { label: 'Conflict detection & resolution', done: isOnline && pendingCount === 0 },
    { label: 'Sync confirmed', done: isOnline && pendingCount === 0 },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Offline &amp; Sync</h1>
          <p className="page-subtitle">Monitor synchronization status and pending operations</p>
        </div>
        <button
          className={`btn ${isOnline ? 'btn-primary' : 'btn-outline'}`}
          onClick={triggerSync}
          disabled={!isOnline || isSyncing}
          id="btn-manual-sync"
        >
          <RefreshCw size={14} className={isSyncing ? 'spinning' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Status Hero */}
      <div style={{
        background: isOnline
          ? 'linear-gradient(135deg, rgba(42,157,143,0.12), rgba(42,157,143,0.04))'
          : 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))',
        border: `1px solid ${isOnline ? 'rgba(42,157,143,0.25)' : 'rgba(239,68,68,0.25)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-8)',
        textAlign: 'center',
        marginBottom: 'var(--space-6)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          {isOnline
            ? <Wifi size={52} color="#2A9D8F" />
            : <WifiOff size={52} color="#EF4444" />
          }
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: isOnline ? 'var(--emerald)' : 'var(--red-light)', marginBottom: 8 }}>
          {isOnline ? 'Connected & Synced' : 'Working Offline'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
          {isOnline
            ? 'All data is synchronized with the cloud. Operations are recorded in real time.'
            : 'Internet connection not detected. Operations are being saved locally and will sync automatically when connectivity is restored.'}
        </p>
        {lastSynced && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Last synced: {lastSynced.toLocaleString()}
          </p>
        )}
      </div>

      <div className="grid-2">
        {/* Sync Workflow */}
        <div className="card">
          <h3 className="card-title mb-5">Sync Workflow</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: step.done ? 'rgba(42,157,143,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${step.done ? 'rgba(42,157,143,0.4)' : 'var(--border-color)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {step.done
                    ? <CheckCircle size={16} color="#2A9D8F" />
                    : <Clock size={16} color="var(--text-muted)" />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: step.done ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step.done ? 500 : 400 }}>
                    {step.label}
                  </p>
                </div>
                <span style={{ fontSize: 11, color: step.done ? 'var(--emerald)' : 'var(--text-muted)' }}>
                  {step.done ? 'Complete' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="stat-cards-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="stat-card" style={{ '--card-accent': '#F59E0B' }}>
              <div className="stat-card-value" style={{ color: pendingCount > 0 ? 'var(--gold)' : 'var(--emerald)' }}>{pendingCount}</div>
              <div className="stat-card-label">Pending Operations</div>
            </div>
            <div className="stat-card" style={{ '--card-accent': '#2A9D8F' }}>
              <div className="stat-card-value">0</div>
              <div className="stat-card-label">Conflicts</div>
            </div>
            <div className="stat-card" style={{ '--card-accent': '#06b6d4' }}>
              <div className="stat-card-value" style={{ fontSize: 20 }}>256 KB</div>
              <div className="stat-card-label">Local Cache Size</div>
            </div>
            <div className="stat-card" style={{ '--card-accent': '#8B5CF6' }}>
              <div className="stat-card-value" style={{ fontSize: 20 }}>AES-256</div>
              <div className="stat-card-label">Encryption</div>
            </div>
          </div>

          {/* Info Box */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Database size={18} color="var(--blue-light)" />
              <h3 className="card-title">How It Works</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
              <p>🔒 All offline data is encrypted using AES-256 before local storage.</p>
              <p>🔄 When internet is restored, data automatically syncs to the cloud.</p>
              <p>⚡ Conflicts are detected and resolved with server-wins strategy.</p>
              <p>📱 Branch staff can process deposits, withdrawals, and loans offline.</p>
              <p>✅ Customers receive confirmation when connection is restored.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Queue */}
      {pendingCount > 0 && (
        <div className="card mt-6">
          <div className="card-header">
            <h3 className="card-title">Pending Sync Queue</h3>
            <span className="badge badge-warning">{pendingCount} pending</span>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Type</th><th>Description</th><th>Queued At</th><th>Status</th></tr>
              </thead>
              <tbody>
                {pendingSyncQueue.map(item => (
                  <tr key={item._id}>
                    <td className="td-mono" style={{ fontSize: 11 }}>{item._id}</td>
                    <td><span className="badge badge-info">{item.type}</span></td>
                    <td className="td-primary">{item.data}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(item.createdAt).toLocaleString()}</td>
                    <td><span className="badge badge-warning"><Clock size={10} /> Pending</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
