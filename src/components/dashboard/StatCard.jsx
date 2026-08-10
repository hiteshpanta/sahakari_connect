import React from 'react';

const hexToRgba = (hex, alpha) => {
  const value = String(hex || '').replace('#', '');
  if (value.length !== 6) return `rgba(42,157,143,${alpha})`;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export function StatCard({ label, value, icon: Icon, color, iconBg, trend, footnote, variant = 'card' }) {
  if (variant === 'glass') {
    const accent = color || '#2A9D8F';
    return (
      <div
        className="glassy-stat"
        style={{
          '--accent': accent,
          '--icon-bg': iconBg || hexToRgba(accent, 0.12),
          '--glow': hexToRgba(accent, 0.22),
        }}
      >
        <div className="glassy-stat-top">
          <span className="glassy-stat-label">{label}</span>
          <span className="glassy-stat-icon"><Icon size={20} /></span>
        </div>
        <div className="glassy-stat-value">{value}</div>
        {footnote && (
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6 }}>{footnote}</p>
        )}
      </div>
    );
  }

  return (
    <div className="stat-card" style={{ '--card-accent': color || '#2A9D8F', '--icon-bg': iconBg || 'rgba(42,157,143,0.1)' }}>
      <div className="stat-card-top">
        <div className="stat-card-icon"><Icon size={20} color={color || '#2A9D8F'} /></div>
        {trend && (
          <span className={`stat-card-trend ${trend.startsWith('+') ? 'up' : 'down'}`}>{trend}</span>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {footnote && (
        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6 }}>{footnote}</p>
      )}
    </div>
  );
}

export function StatGrid({ children, className = '', style }) {
  return (
    <div className={`stat-cards-grid ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
