import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { MemberCooperativeProvider } from './context/MemberCooperativeContext';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import MarketplaceDirectory from './pages/marketplace/MarketplaceDirectory';
import CooperativeProfilePage from './pages/marketplace/CooperativeProfile';
import ApplyMembership from './pages/marketplace/ApplyMembership';
import TenantLayout from './components/layout/TenantLayout';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import CustomerList from './pages/customers/CustomerList';
import MembershipApplications from './pages/customers/MembershipApplications';
import CustomerDetail from './pages/customers/CustomerDetail';
import CustomerForm from './pages/customers/CustomerForm';
import AccountList from './pages/accounts/AccountList';
import AccountForm from './pages/accounts/AccountForm';
import DepositPage from './pages/accounts/DepositPage';
import WithdrawalPage from './pages/accounts/WithdrawalPage';
import TransactionList from './pages/transactions/TransactionList';
import TransactionDetail from './pages/transactions/TransactionDetail';
import LoanList from './pages/loans/LoanList';
import LoanDetail from './pages/loans/LoanDetail';
import LoanForm from './pages/loans/LoanForm';
import ReportsDashboard from './pages/reports/ReportsDashboard';
import SMSBankingPanel from './pages/sms-banking/SMSBankingPanel';
import WhatsAppPanel from './pages/whatsapp/WhatsAppPanel';
import OfflineSyncPage from './pages/offline-sync/OfflineSyncPage';
import BranchManagement from './pages/branches/BranchManagement';
import UserManagement from './pages/settings/UserManagement';
import SystemSettings from './pages/settings/SystemSettings';
import UserSettings from './pages/settings/UserSettings';
import CooperativeSettings from './pages/cooperative/CooperativeSettings';
import MemberDashboard from './pages/member/MemberDashboard';
import MemberAccounts from './pages/member/MemberAccounts';
import MemberLoans from './pages/member/MemberLoans';
import ApplyLoan from './pages/member/ApplyLoan';
import MemberProfile from './pages/member/MemberProfile';
import MemberTransactions from './pages/member/MemberTransactions';
import AdminDashboard from './pages/admin/AdminDashboard';
import CooperativeList from './pages/admin/CooperativeList';
import CooperativeForm from './pages/admin/CooperativeForm';
import CooperativeDetail from './pages/admin/CooperativeDetail';
import PlatformUsers from './pages/admin/PlatformUsers';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/home/Home';
import FAQChatbot from './components/FAQChatbot';
import { useSelector } from 'react-redux';

function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />
}

const router = createBrowserRouter([

      // --- Public Routes ---
      {
        path: "/",
        element: <Home />,
      },
      {
        path: '/login',
        element: <LoginPage />
      },
      {
        path: '/register',
        element: <RegisterPage />
      },
      {
        path: '/marketplace',
        element: <MarketplaceDirectory />
      },
      {
        path: '/marketplace/:id',
        element: <CooperativeProfilePage />
      },
      {
        path: '/apply-membership/:cooperativeId',
        element: <ApplyMembership />
      },

        // --- Manager / Staff Routes ---
        {
          element: (
            <ProtectedRoute
              allowedRoles={['manager','staff','admin']}
            />
          ),

          children: [
            {
              path: '/c/:cooperativeId',
              element: <TenantLayout />,

              children: [
                {
                  index: true,
                  element: <Navigate to='dashboard' replace />,
                },
                {
                  path: 'dashboard',
                  element: <ManagerDashboard />
                },
                {
                  path: 'customers',
                  element: <CustomerList />
                },
                {
                  path: 'customers/applications',
                  element: <MembershipApplications />
                },
                {
                  path: 'customers/new',
                  element: <CustomerForm />
                },
                {
                  path: 'customers/:id',
                  element: <CustomerDetail />
                },
                {
                  path: 'customers/:id/edit',
                  element: <CustomerForm />
                },
                {
                  path: 'accounts',
                  element: <AccountList />
                },
                {
                  path: 'accounts/new',
                  element: <AccountForm />
                },
                {
                  path: 'deposits',
                  element: <DepositPage />
                },
                {
                  path: 'withdrawals',
                  element: <WithdrawalPage />
                },
                {
                  path: 'transactions',
                  element: <TransactionList />
                },
                {
                  path: 'transactions/:id',
                  element: <TransactionDetail />
                },
                {
                  path: 'loans',
                  element: <LoanList />
                },
                {
                  path: 'loans/new',
                  element: <LoanForm />
                },
                {
                  path: 'loans/:id',
                  element: <LoanDetail />
                },
                {
                  path: 'reports',
                  element: <ReportsDashboard />
                },
                {
                  path: 'sms-banking',
                  element: <SMSBankingPanel />
                },
                {
                  path: 'whatsapp',
                  element: <WhatsAppPanel/>
                },
                {
                  path: 'offline-sync',
                  element: <OfflineSyncPage />
                },
                {
                  path: 'branches',
                  element: <BranchManagement />
                },
                {
                  path: 'users',
                  element: <UserManagement />
                },
                {
                  path: 'settings',
                  element: <SystemSettings />
                },
                {
                  path: 'settings/preferences',
                  element: <UserSettings />
                },
                {
                  path: 'cooperative',
                  element: <CooperativeSettings />
                },

              ]
            }
          ]
        },

        // --- member routes ---
        {
          element: (
            <ProtectedRoute allowedRoles={['member']} />
          ),

          children: [
            {
              element: (
                <MemberCooperativeProvider>
                  <MainLayout />
                </MemberCooperativeProvider>
              ),
              children: [
                {
                  path: '/member/dashboard',
                  element: <MemberDashboard />
                },
                {
                  path: '/member/accounts',
                  element: <MemberAccounts />
                },
                {
                  path: '/member/transactions',
                  element: <MemberTransactions />
                },
                {
                  path: '/member/loans',
                  element: <MemberLoans />
                },
                {
                  path: '/member/loans/apply',
                  element: <ApplyLoan />
                },
                {
                  path: '/member/profile',
                  element: <MemberProfile />
                },
                {
                  path: '/member/settings',
                  element: <UserSettings />
                },
              ]
            }
          ]
        },

        // --- admin routes ---
        {
          element: ( <ProtectedRoute allowedRoles={['admin']} /> ),

          children: [
            {
              element: <MainLayout />,
              children: [
                {
                  path: '/admin/dashboard',
                  element: <AdminDashboard />,
                },
                {
                  path: '/admin/cooperatives',
                  element: <CooperativeList />,
                },
                {
                  path: '/admin/cooperatives/new',
                  element: <CooperativeForm />,
                },
                {
                  path: '/admin/cooperatives/:id',
                  element: <CooperativeDetail />,
                },
                {
                  path: '/admin/cooperatives/:id/edit',
                  element: <CooperativeForm />,
                },
                {
                  path: '/admin/users',
                  element: <PlatformUsers />,
                },
                {
                  path: '/admin/settings',
                  element: <UserSettings />,
                }
              ]
            }
          ]
        },

        {
          path: '*',
          element: <Navigate to='/' replace />,
        }

  ]);

export default function App() {
  return (
    <AuthProvider>
      <OfflineProvider>
        <RouterProvider router={router} />
        <FAQChatbot />
      </OfflineProvider>
    </AuthProvider>
  );
}
