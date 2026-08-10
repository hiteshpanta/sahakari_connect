import React from 'react';
import { useParams, Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from './MainLayout';

export default function TenantLayout() {
  const { cooperativeId } = useParams();
  const currentUser = useSelector((state) => state.auth.user);

  // Enforce Tenant Isolation for member/Admins
  if (currentUser?.role !== 'admin' && currentUser?.cooperativeId) {
    if (currentUser.cooperativeId !== cooperativeId) {
      // Prevent cross-tenant access and redirect back to their own tenant
      return <Navigate to={`/c/${currentUser.cooperativeId}/dashboard`} replace />;
    }
  }

  // We could fetch cooperative details here if needed, but for now we just validate and pass down
  return (
    <MainLayout>
      <Outlet context={{ activeCooperativeId: cooperativeId }} />
    </MainLayout>
  );
}
