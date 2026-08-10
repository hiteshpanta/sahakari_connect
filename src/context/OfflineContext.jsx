import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const OfflineContext = createContext(null);

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(2);
  const [lastSynced, setLastSynced] = useState(new Date(Date.now() - 5 * 60000));
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerSync = useCallback(() => {
    if (!isOnline) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setPendingCount(0);
      setLastSynced(new Date());
    }, 2500);
  }, [isOnline]);

  return (
    <OfflineContext.Provider value={{ isOnline, pendingCount, lastSynced, isSyncing, triggerSync, setPendingCount }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used inside OfflineProvider');
  return ctx;
};
