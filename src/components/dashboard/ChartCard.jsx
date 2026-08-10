import React from 'react';

export default function ChartCard({ title, subtitle, actions, children, className = '', style, bodyStyle }) {
  return (
    <div className={`card ${className}`.trim()} style={{ display: 'flex', flexDirection: 'column', ...style }}>
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div className="chart-wrapper" style={{ flex: 1, minHeight: 240, ...bodyStyle }}>
        {children}
      </div>
    </div>
  );
}
