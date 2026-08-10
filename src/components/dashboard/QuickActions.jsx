import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions({ actions, className = 'member-actions', style }) {
  const navigate = useNavigate();

  return (
    <div className={className} style={{ marginTop: 20, ...style }}>
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.label}
            className="member-action"
            onClick={action.onClick || (() => navigate(action.to))}
          >
            <span
              className="member-action-icon"
              style={{ background: action.color }}
            >
              <Icon size={18} />
            </span>

            <span style={{ textAlign: 'left' }}>
              <span style={{ display: 'block' }}>{action.label}</span>

              <span
                style={{
                  display: 'block',
                  fontSize: 11.5,
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                }}
              >
                {action.sub}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
