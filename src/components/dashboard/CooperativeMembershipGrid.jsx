import React from 'react';
import { Loader2, Building2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function CooperativeMembershipGrid({
  cooperatives,
  loading,
  emptyAction,
  statusMap = {},
  emptyText = 'You are not linked to any cooperative yet.',
}) {
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--text-muted)',
          fontSize: 13,
          padding: '8px 0',
        }}
      >
        <Loader2 size={15} className="spin" />
        Loading your cooperatives...
      </div>
    );
  }

  if (!cooperatives || cooperatives.length === 0) {
    return (
      <div className="glass-empty">
        <p>{emptyText}</p>
        {emptyAction && <div style={{ marginTop: 14 }}>{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 12,
      }}
    >
      {cooperatives.map((coop) => {
        const status =
          statusMap[coop.status] || {
            label: coop.status || '—',
            className: 'badge-neutral',
          };

        const name = coop.cooperative?.name || 'Unknown cooperative';
        const location =
          [coop.cooperative?.district, coop.cooperative?.category]
            .filter(Boolean)
            .join(' • ') || '—';

        return (
          <div
            key={coop._id}
            className="glass-card-flat"
            style={{
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg,#2A9D8F,#21867A)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Building2 size={18} color="#fff" />
              </div>

              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {name}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {location}
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span className={`badge ${status.className}`}>{status.label}</span>

              {coop.joinedAt && (
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Applied {formatDate(coop.joinedAt)}
                </span>
              )}
            </div>

            {coop.status === 'rejected' && coop.rejectionReason && (
              <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>
                {coop.rejectionReason}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
