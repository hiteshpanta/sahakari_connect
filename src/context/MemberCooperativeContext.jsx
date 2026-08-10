import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useGetMemberCooperativesQuery } from '../store/mainApi';
import { useAuth } from './AuthContext';

const MemberCooperativeContext = createContext(null);

const storageKey = (userId) => `member_active_coop_${userId}`;

// A member can belong to several cooperatives, each with its own account,
// transactions and loans. This provider loads the member's memberships and
// tracks which cooperative they currently have selected (persisted per user).
export const MemberCooperativeProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?._id;

  const { data: memberships = [], isLoading } = useGetMemberCooperativesQuery(undefined, {
    skip: !currentUser,
  });

  const activeMemberships = useMemo(
    () => (memberships || []).filter((m) => m.status === 'active'),
    [memberships]
  );

  const [selectedCoopId, setSelectedCoopIdState] = useState(() =>
    userId ? localStorage.getItem(storageKey(userId)) || '' : ''
  );

  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(storageKey(userId)) || '';
      setSelectedCoopIdState(stored);
    }
  }, [userId]);

  // If the stored selection no longer matches a membership (e.g. approval is
  // still pending), fall back to the first active membership.
  const effectiveId = useMemo(() => {
    const valid = activeMemberships.find((m) => String(m.cooperative?._id) === String(selectedCoopId));
    if (valid) return String(valid.cooperative._id);
    if (activeMemberships.length > 0) return String(activeMemberships[0].cooperative._id);
    return null;
  }, [activeMemberships, selectedCoopId]);

  const setSelectedCoopId = (id) => {
    setSelectedCoopIdState(id);
    if (userId) localStorage.setItem(storageKey(userId), id);
  };

  const activeCoop = useMemo(
    () => activeMemberships.find((m) => String(m.cooperative?._id) === String(effectiveId)) || null,
    [activeMemberships, effectiveId]
  );

  return (
    <MemberCooperativeContext.Provider
      value={{
        memberships,
        activeMemberships,
        activeCoop,
        activeCoopId: effectiveId,
        customerId: activeCoop?._id || null,
        loading: isLoading,
        setSelectedCoopId,
      }}
    >
      {children}
    </MemberCooperativeContext.Provider>
  );
};

export const useMemberCooperative = () => {
  const ctx = useContext(MemberCooperativeContext);
  if (!ctx) throw new Error('useMemberCooperative must be used inside MemberCooperativeProvider');
  return ctx;
};
