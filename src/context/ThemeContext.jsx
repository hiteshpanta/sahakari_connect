import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useGetTenantQuery } from '../store/mainApi';
import { useSelector } from 'react-redux';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const THEME_KEY = 'aama_theme_mode';

const isValidMode = (m) => m === 'light' || m === 'dark' || m === 'system';

const getSystemDark = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

const readStored = (key) => {
  try {
    const stored = localStorage.getItem(key);
    if (isValidMode(stored)) return stored;
  } catch {}
  return null;
};

export const ThemeProvider = ({ children }) => {
  const [defaultBranding] = useState({
    colors: {
      primary: '#0f172a',
      secondary: '#06b6d4',
      accent: '#2A9D8F'
    },
    appName: 'Aama Cooperatives',
    logo: '',
    favicon: ''
  });

  const user = useSelector((state) => state.auth.user);
  const userId = user?.id || user?._id || user?.userId;
  const storageKey = userId ? `${THEME_KEY}_${userId}` : THEME_KEY;

  const [mode, setModeState] = useState(() => readStored(storageKey) || 'light');

  // When the logged-in user changes, load that user's stored theme preference.
  useEffect(() => {
    const stored = readStored(storageKey);
    if (stored) setModeState(stored);
  }, [storageKey]);

  const setMode = useCallback((next) => {
    if (!isValidMode(next)) return;
    setModeState(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {}
  }, [storageKey]);

  const resolvedDark =
    mode === 'dark' || (mode === 'system' && getSystemDark());

  // Apply / remove the dark class on the document root.
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [resolvedDark]);

  // Follow OS preference changes while in "system" mode.
  useEffect(() => {
    if (mode !== 'system' || typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => document.documentElement.classList.toggle('dark', mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const { data, isLoading } = useGetTenantQuery(host);

  const loading = isLoading;
  const profile = data?.success && data?.profile ? data.profile : null;
  const branding = profile || defaultBranding;

  useEffect(() => {
    if (!loading) {
      // Apply CSS variables for Tailwind or plain CSS
      document.documentElement.style.setProperty('--blue-primary', branding.colors.primary);
      document.documentElement.style.setProperty('--blue-light', branding.colors.secondary);
      document.documentElement.style.setProperty('--emerald', branding.colors.accent);

      // Also update some background colors that use primary
      document.documentElement.style.setProperty('--bg-primary', branding.colors.primary === '#0f172a' ? '#050d1a' : branding.colors.primary);

      // Update document title and favicon
      document.title = branding.appName;
      if (branding.favicon) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = branding.favicon;
      }
    }
  }, [branding, loading]);

  return (
    <ThemeContext.Provider value={{ branding, loading, mode, setMode, resolvedDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
