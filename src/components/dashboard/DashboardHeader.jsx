import React from 'react';

export default function DashboardHeader({ title, subtitle, actions, className = '', style }) {
  return (
    <div className={`page-header ${className}`.trim()} style={style}>
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>
      )}
    </div>
  );
}
