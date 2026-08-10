import React from 'react';
import EmptyState from './EmptyState';

export default function ActivityList({
  items,
  icon: DefaultIcon,
  emptyTitle = 'No activity yet',
  emptyMessage = 'Nothing to show right now.',
  emptyIcon,
}) {
  const isEmpty = !items || items.length === 0;

  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
        padded
      />
    );
  }

  return (
    <div className="activity-list">
      {items.map((item) => (
        <div key={item.id} className="activity-item">
          <div
            className="activity-icon"
            style={{ background: item.iconBg || 'rgba(42,157,143,0.12)' }}
          >
            {item.icon ? (
              item.icon
            ) : (
              <DefaultIcon size={14} color={item.iconColor || '#2A9D8F'} />
            )}
          </div>

          <div className="activity-text">
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{item.title}</strong>
              {item.badge}
            </p>

            <span>{item.meta}</span>

            {item.remark && (
              <span
                style={{
                  display: 'block',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  marginTop: 1,
                }}
              >
                {item.remark}
              </span>
            )}
          </div>

          {item.amount && (
            <span className={`activity-amount ${item.amountSign === '-' ? 'txn-down' : 'txn-up'}`}>
              {item.amountSign === '-' ? '-' : '+'}
              {item.amount}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
