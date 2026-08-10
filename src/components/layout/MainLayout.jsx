import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet, useLocation } from 'react-router-dom';
// import { useOffline } from '../../context/OfflineContext';
// import { WifiOff } from 'lucide-react';

export default function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="dashboard-layout flex min-h-screen bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        {/* {!isOnline && (
          <div className={`fixed top-16 right-0 z-40 flex h-10 items-center gap-2 border-b border-amber-300 bg-amber-100 px-6 text-sm text-amber-900 transition-all duration-300 ${collapsed ? 'left-20' : 'left-72'}`}>
            <WifiOff className='h-4 w-4' />
            <span className='font-semibold'>You are offline.</span>
            <span>
              {pendingCount > 0
                ? `${pendingCount} operation${pendingCount > 1 ? 's' : ''} queued for synchronization.`
                : ' Working in offline mode. Changes will sync automatically when you're online.'}
            </span>
          </div>
        )} */}
        {/* <main className={`overflow-y-auto p-6 transition-all duration-300 ${!isOnline ? 'pt-26' : 'pt-16'} p-6`}> */}
        <main className='app-main flex overflow-y-auto'>

          {children ?? <Outlet />}
        </main>

      </div>
    </div>
  );
}
