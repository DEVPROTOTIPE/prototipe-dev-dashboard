import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function ConsoleLoader() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-xl border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
        <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest animate-pulse">Cargando consola...</span>
      </div>
    </div>
  );
}

export default function RoleGuard({ allowedRoles, children, silent = false }) {
  const { user, role, loading } = useAuthStore();

  // Solo el guard del layout raíz muestra el spinner — los sub-guards son silenciosos
  if (loading) {
    if (silent) return null;
    return <ConsoleLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    console.warn(`Acceso denegado a la ruta. Rol del usuario: "${role}". Roles permitidos: ${JSON.stringify(allowedRoles)}`);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
