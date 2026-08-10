import React from 'react';
import { Building2 } from 'lucide-react';
import { useMemberCooperative } from '../../context/MemberCooperativeContext';

// Dropdown to switch between the cooperatives a member has joined.
// Accounts, transactions and loans are scoped to the selected cooperative.
export default function CooperativeSwitcher({ compact = false }) {
  const { activeMemberships, activeCoopId, setSelectedCoopId, loading } = useMemberCooperative();

  if (loading) return null;
  if (!activeMemberships || activeMemberships.length === 0) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Building2 size={15} style={{ color: 'var(--emerald)', flexShrink: 0 }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          className="glass-select"
          style={{ minWidth: compact ? 170 : 220, paddingRight: 30, appearance: 'auto' }}
          value={activeCoopId || ''}
          onChange={(e) => setSelectedCoopId(e.target.value)}
          title="Switch cooperative"
        >
          {activeMemberships.map((m) => (
            <option key={m._id} value={m.cooperative?._id}>
              {m.cooperative?.name || 'Cooperative'}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
