import React from 'react';

export default function EmptyState({ icon, title, message, action, padded = true }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        textAlign: 'center',
        ...(padded ? { padding: 'var(--space-6)' } : {}),
      }}
    >
      {icon && (
        <div className="empty-state-icon" style={icon.style}>
          {icon.content}
        </div>
      )}
      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
      {message && (
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', maxWidth: 260, margin: 0 }}>
          {message}
        </p>
      )}
      {action && <div style={{ marginTop: 6 }}>{action}</div>}
    </div>
  );
}
