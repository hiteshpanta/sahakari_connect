import React from 'react';
import EmptyState from './EmptyState';

export default function ListItemCard({ items, empty }) {
  if (!items || items.length === 0) {
    return empty || <EmptyState title="All caught up!" padded />;
  }

  return (
    <div
      style={{
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        flex: 1,
        maxHeight: 320,
        overflowY: 'auto',
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            borderRadius: 12,
            border: '1px solid var(--border-color)',
            background: item.background || 'rgba(255,255,255,0.02)',
          }}
        >
          {item.avatar && (
            <div className="avatar avatar-sm avatar-blue" style={{ flexShrink: 0, ...item.avatarStyle }}>
              {item.avatar}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="td-primary" style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</p>
            {item.subtitle && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.subtitle}</p>
            )}
          </div>

          {item.badge}
          {item.actions && (
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>{item.actions}</div>
          )}
        </div>
      ))}
    </div>
  );
}
