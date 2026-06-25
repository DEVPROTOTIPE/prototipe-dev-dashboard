import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import CustomCursor from './components/ui/CustomCursor';
import { useAuthStore } from './stores/authStore';
import { useDevStore } from './stores/devStore';

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const subscribeTelemetry = useDevStore((state) => state.subscribeTelemetry);
  const unsubscribeTelemetry = useDevStore((state) => state.unsubscribeTelemetry);
  const theme = useDevStore((state) => state.theme);

  // Inicializar autenticación de Firebase
  useEffect(() => {
    const unsubAuth = initializeAuth();
    if (typeof window !== 'undefined') {
      window.useAuthStore = useAuthStore;
      window.useDevStore = useDevStore;
    }
    return () => {
      unsubAuth();
    };
  }, [initializeAuth]);

  const user = useAuthStore((state) => state.user);

  // Inicializar telemetría de Firestore si hay usuario autenticado
  useEffect(() => {
    if (user) {
      subscribeTelemetry();
    } else {
      unsubscribeTelemetry();
      useDevStore.getState().loadMockTelemetryData();
    }
    return () => {
      unsubscribeTelemetry();
    };
  }, [user, subscribeTelemetry, unsubscribeTelemetry]);

  // Sincronizar el tema con la clase 'light'
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  return (
    <>
      <CustomCursor />
      <AppRoutes />
    </>
  );
}
