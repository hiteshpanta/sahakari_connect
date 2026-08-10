import React from 'react';
import { getAccountStatusClass, getAccountStatusLabel } from './memberUtils';

export default function BalanceCard({
  label = 'Total Balance',
  value,
  footnote,
  chips = [],
  accounts = [],
  accountRenderer,
  children,
}) {
  return (
    <div className="glass-balance-card">
      <div
        className="glass-balance-inner"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <p className="glass-balance-label">{label}</p>
          <div className="glass-balance-amount">{value}</div>
          {footnote && (
            <p style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>{footnote}</p>
          )}
        </div>

        {chips.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {chips.map((chip) => (
              <span key={chip.label} className="glass-chip">
                {chip.label}: {chip.value}
              </span>
            ))}
          </div>
        )}
      </div>

      {accounts.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginTop: 18,
            borderTop: '1px solid rgba(255,255,255,0.15)',
            paddingTop: 16,
          }}
        >
          <p style={{ fontSize: 12, opacity: 0.85, fontWeight: 600 }}>Your Accounts</p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 10,
            }}
          >
            {accounts.map((account) =>
              accountRenderer ? (
                accountRenderer(account)
              ) : (
                <div
                  key={account._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: '10px 14px',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {account.accountNo}
                    </p>
                    <p style={{ fontSize: 11.5, opacity: 0.85 }}>
                      {account.type} • {account.branch}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 800 }}>
                      {account.balanceText || account.balance}
                    </p>
                    <span className={`badge ${getAccountStatusClass(account.status)}`}>
                      {getAccountStatusLabel(account.status)}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
