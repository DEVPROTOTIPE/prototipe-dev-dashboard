import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import RoleGuard, { ConsoleLoader } from './RoleGuard';

// Páginas con Carga Perezosa (Lazy Loading)
const LoginPage          = lazy(() => import('../pages/LoginPage'));
const DevDashboard       = lazy(() => import('../pages/admin/DevDashboard'));
const BillingPage        = lazy(() => import('../pages/admin/BillingPage'));
const OnboardingPage     = lazy(() => import('../pages/admin/OnboardingPage'));
const TelemetryErrors    = lazy(() => import('../pages/admin/TelemetryErrors'));
const SettingsPage       = lazy(() => import('../pages/admin/SettingsPage'));
const CrmPage            = lazy(() => import('../pages/admin/CrmPage'));
const NocPage            = lazy(() => import('../pages/admin/NocPage'));

// Páginas de Portal de Clientes
const ClientPortalLoginPage = lazy(() => import('../pages/client/ClientPortalLoginPage'));
const ClientPortalDashboard = lazy(() => import('../pages/client/ClientPortalDashboard'));
const ClientPortalLayout    = lazy(() => import('../layouts/ClientPortalLayout'));
const ClientPortalGuard     = lazy(() => import('./ClientPortalGuard'));

// Componentes modularizados que actúan como páginas directas
const ComponentLibraryView = lazy(() => import('../components/admin/ComponentLibraryView'));
const GitBackupPanel       = lazy(() => import('../components/admin/GitBackupPanel'));
const E2EPanel             = lazy(() => import('../components/admin/E2EPanel'));
const CoreManagerPanel     = lazy(() => import('../components/admin/CoreManagerPanel'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<ConsoleLoader />}>
      <Routes>
        {/* Ruta pública de Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas — el RoleGuard raíz muestra el spinner de auth */}
        <Route
          path="/"
          element={
            <RoleGuard allowedRoles={['admin', 'comercial', 'ops']}>
              <DashboardLayout />
            </RoleGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Sub-guards con silent=true: auth ya resolvió en el guard padre */}
          <Route path="dashboard" element={
            <RoleGuard silent allowedRoles={['admin']}>
              <DevDashboard />
            </RoleGuard>
          } />

          <Route path="crm" element={
            <RoleGuard silent allowedRoles={['admin', 'comercial']}>
              <CrmPage />
            </RoleGuard>
          } />

          <Route path="noc" element={
            <RoleGuard silent allowedRoles={['admin', 'ops']}>
              <NocPage />
            </RoleGuard>
          } />

          <Route path="billing" element={
            <RoleGuard silent allowedRoles={['admin']}>
              <BillingPage />
            </RoleGuard>
          } />

          <Route path="onboarding" element={
            <RoleGuard silent allowedRoles={['admin']}>
              <OnboardingPage />
            </RoleGuard>
          } />

          <Route path="library" element={
            <RoleGuard silent allowedRoles={['admin']}>
              <ComponentLibraryView />
            </RoleGuard>
          } />

          <Route path="errors" element={
            <RoleGuard silent allowedRoles={['admin']}>
              <TelemetryErrors />
            </RoleGuard>
          } />

          <Route path="git" element={
            <RoleGuard silent allowedRoles={['admin']}>
              <GitBackupPanel />
            </RoleGuard>
          } />

          <Route path="e2e" element={
            <RoleGuard silent allowedRoles={['admin']}>
              <E2EPanel />
            </RoleGuard>
          } />

          <Route path="cores" element={
            <RoleGuard silent allowedRoles={['admin']}>
              <CoreManagerPanel />
            </RoleGuard>
          } />

          <Route path="settings" element={
            <RoleGuard silent allowedRoles={['admin']}>
              <SettingsPage />
            </RoleGuard>
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Portal de Clientes */}
        <Route path="/portal/login" element={<ClientPortalLoginPage />} />
        <Route 
          path="/portal" 
          element={
            <ClientPortalGuard>
              <ClientPortalLayout />
            </ClientPortalGuard>
          }
        >
          <Route index element={<ClientPortalDashboard />} />
          <Route path="*" element={<Navigate to="/portal" replace />} />
        </Route>

        {/* Catch-all global a login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
