// import React, { useState, useRef, useEffect } from 'react';
import React from 'react';
import { useLocation } from 'react-router-dom';
// import { Bell, LogOut, ChevronRight, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { LogOut, ChevronRight, Menu, Sun, Moon } from "lucide-react";
// import { useAuth } from '../../context/AuthContext';
// import { useOffline } from '../../context/OfflineContext';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { useTheme } from '../../context/ThemeContext';
import { formatToday, getInitials } from '../../utils/formatters';
// import { formatDate } from '../../utils/formatters';

const BREADCRUMB_MAP = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customers',
  '/accounts': 'Accounts',
  '/transactions': 'Transactions',
  '/loans': 'Loans',
  '/reports': 'Reports',
  '/sms-banking': 'SMS Banking',
  '/whatsapp': 'WhatsApp Banking',
  '/offline-sync': 'Offline & Sync',
  '/branches': 'Branch Management',
  '/users': 'User Management',
  '/settings': 'System Settings',
  '/settings/preferences': 'Settings',
  '/member/settings': 'Settings',
  '/admin/settings': 'Settings',
  '/admin/dashboard': 'Platform Analytics',
  '/admin/cooperatives': 'Cooperatives',
  '/admin/cooperatives/new': 'Add Cooperative',
  '/admin/users': 'Platform Users',
};

// const NOTIFICATIONS = [
//   { id: 1, icon: '💰', text: 'New loan application from Laxmi Shrestha', time: '5m ago', unread: true },
//   { id: 2, icon: '✅', text: 'Sync completed — 2 records uploaded', time: '12m ago', unread: true },
//   { id: 3, icon: '📱', text: 'SMS sent to 9841100001 (BAL query)', time: '1h ago', unread: false },
// ];

export default function Topbar({ onMenuClick }) {
  // const { currentUser, logout } = useAuth();

  const currentUser = useSelector((state) => state.auth.user);
  console.log("current user:", currentUser)
  const dispatch = useDispatch();
  const { resolvedDark, setMode } = useTheme();
  // const { isOnline, pendingCount, isSyncing, triggerSync } = useOffline();
  const location = useLocation();
  // const [showNotif, setShowNotif] = useState(false);
  // const notifRef = useRef(null);
  // const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

  const today = formatToday();

  const cleanPath = location.pathname.replace(/^\/c\/[^/]+/, "");

  const matchedKey = BREADCRUMB_MAP[cleanPath]
    ? cleanPath
    : Object.keys(BREADCRUMB_MAP)
        .filter(key => cleanPath.startsWith(key))
        .sort((a, b) => b.length - a.length)[0];

  const currentPage = matchedKey ? BREADCRUMB_MAP[matchedKey] : (cleanPath.slice(1) || 'Home');

  const handleLogout = () => {
    dispatch(logout());
  };

  // useEffect(() => {
  //   const handler = (e) => {
  //     if (notifRef.current && !notifRef.current.contains(e.target)) {
  //       setShowNotif(false);
  //     }
  //   };
  //   document.addEventListener('mousedown', handler);
  //   return () => document.removeEventListener('mousedown', handler);
  // }, []);

  // const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;
console.log('topbar render')
  return (
    <header  className="glass-nav fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between gap-3 px-4 sm:px-6 shadow-sm">
      {/* Breadcrumb */}
      <div className="flex min-w-0 items-center gap-2 text-sm text-gray-500">
        {/* Mobile hamburger */}
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-100 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="font-medium text-gray-700">Aama Cooperatives</span>
          <ChevronRight size={14} />
        </div>
        <span className="truncate font-semibold text-[#2A9D8F]">{currentPage}</span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden text-sm text-gray-500 md:block">{today}</span>

        {/* Theme toggle */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-100"
          onClick={() => setMode(resolvedDark ? 'light' : 'dark')}
          title={resolvedDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {resolvedDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Online status */}
        {/* <div className={`flex items-center rounded-full px-3 py-1 text-xs font-medium ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          <span className="mr-2 h-2 w-2 rounded-full" />
          {isOnline ? 'bg-green-500' : 'bg-red-500'}

          {pendingCount > 0 && isOnline && (
            <span className='ml-1]'>({pendingCount} pending)</span>
          )}
        </div> */}

        {/* Sync button */}
        {/* {isOnline && pendingCount > 0 && (
          <button className="rounded-lg border border-gray-200 p-2 transition hover:bg-gray-100" onClick={triggerSync} title="Sync now">
            <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
          </button>
        )} */}

        {/* Notifications */}
        {/* <div className='relative' ref={notifRef}>
          <button
            className="relative rounded-lg border border-gray-200 p-2 transition hover:bg-gray-100"
            onClick={() => setShowNotif(v => !v)}
          >
            <Bell size={16} />
            {unreadCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />}
          </button>
          {showNotif && (
            <div className="notif-panel">
              <div className="modal-header" style={{ padding: '12px 16px' }}>
                <span className="card-title" style={{ fontSize: '14px' }}>Notifications</span>
                <span className="badge badge-info">{unreadCount} new</span>
              </div>
              {NOTIFICATIONS.map(n => (
                <div key={n.id} className="notif-item">
                  <span style={{ fontSize: '18px' }}>{n.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', color: n.unread ? 'var(--text-primary)' : 'var(--text-muted)', marginBottom: '2px' }}>
                      {n.text}
                    </p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{n.time}</span>
                  </div>
                  {n.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue-primary)', flexShrink: 0, marginTop: 4 }} />}
                </div>
              ))}
            </div>
          )}
        </div> */}


        {
          currentUser && (
            <div className='flex items-center gap-3'>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A9D8F] text-sm font-semibold text-white">                {
                  getInitials(
                    currentUser?.name
                  )
                }

              </div>

              <div className='hidden md:flex flex-col leading-tight'>
                <span className='text-sm font-semibold text-gray-800'>
                  {currentUser.name}
                </span>

                <span className='text-xs text-gray-500 capitalize'>
                  {currentUser.role}
                </span>

              </div>

              {/* Logout */}
              <button 
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-2.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 sm:px-3"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )
        }
        
      </div>
    </header>
  );
}
