import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useClientPortalStore } from '../stores/clientPortalStore';
import { ConsoleLoader } from './RoleGuard';

export default function ClientPortalGuard({ children }) {
  const { isAuthenticated, loading, initializePortal } = useClientPortalStore();

  useEffect(() => {
    initializePortal();
  }, [initializePortal]);

  if (loading) {
    return <ConsoleLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/portal/login" replace />;
  }

  return children ? children : <Outlet />;
}
