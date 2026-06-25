import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useClientPortalStore } from '../stores/clientPortalStore';
import { LogOut, User, Database, RefreshCw, Star, Info } from 'lucide-react';
import DarkModeToggle from '../components/ui/DarkModeToggle';

export default function ClientPortalLayout() {
  const navigate = useNavigate();
  const { clientId, clientData, healthScore, logout, isSimulated } = useClientPortalStore();

  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  const handleLogoutClick = async () => {
    if (window.confirm('¿Está seguro de que desea salir del portal?')) {
      await logout();
      navigate('/portal/login');
    }
  };

  // Determinar color de salud para el badge
  const getHealthColorClass = (score) => {
    if (score >= 85) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
    if (score >= 70) return 'bg-sky-500/10 text-sky-400 border-sky-500/25';
    if (score >= 50) return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
    return 'bg-red-500/10 text-red-400 border-red-500/25';
  };

  const getHealthLabel = (score) => {
    if (score >= 85) return 'Excelente';
    if (score >= 70) return 'Bueno';
    if (score >= 50) return 'En Riesgo';
    return 'Crítico';
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col relative font-sans overflow-x-hidden">
      {/* ===== FONDO TECNOLÓGICO PREMIUM ===== */}
      <div aria-hidden="true" className="tech-bg-dots" />
      <div aria-hidden="true" className="tech-bg-orb-1" />
      <div aria-hidden="true" className="tech-bg-orb-2" />
      <div aria-hidden="true" className="tech-bg-vignette" />

      {/* ===== HEADER / NAVBAR ===== */}
      <nav className="h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-colors duration-300 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
            <img src="/logo.png?v=3" className="w-5 h-5 object-contain rounded-full" alt="Logo" />
          </div>
          <div className="flex items-center gap-2 select-none">
            <span className="font-extrabold text-sm tracking-wide text-[var(--color-text)] leading-none">PROTOTIPE</span>
            <span className="text-[10px] bg-violet-500/10 text-violet-400 px-2 py-0.5 border border-violet-500/20 rounded-md font-bold uppercase tracking-wider">PORTAL</span>
          </div>
        </div>

        {/* Info de Cliente y Acciones en Navbar */}
        <div className="flex items-center gap-3">
          {clientData && (
            <div className="hidden sm:flex items-center gap-2.5 mr-2">
              <span className="text-xs text-[var(--color-text)] font-extrabold">{clientData.nombre}</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getHealthColorClass(healthScore)}`}>
                Salud: {healthScore}% ({getHealthLabel(healthScore)})
              </span>
            </div>
          )}

          {/* Status radar de red/Sandbox */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 h-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 text-[10px] font-bold select-none">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSimulated ? 'bg-amber-400' : !isOnline ? 'bg-red-400' : 'bg-emerald-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                isSimulated ? 'bg-amber-500' : !isOnline ? 'bg-red-500' : 'bg-emerald-500'
              }`}></span>
            </span>
            <span>{isSimulated ? 'Sandbox' : !isOnline ? 'Desconectado' : 'Conectado'}</span>
          </div>

          <button
            onClick={handleLogoutClick}
            className="h-8 px-3 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95 text-xs font-bold"
            title="Cerrar sesión en el portal"
          >
            <LogOut size={13} />
            <span className="hidden xs:inline">Salir</span>
          </button>
        </div>
      </nav>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="flex-grow overflow-y-auto scrollbar-thin">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
          {/* Alerta de Sandbox en Layout */}
          {isSimulated && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-400/90 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              <Info size={16} className="shrink-0 text-amber-500 mt-0.5" />
              <div>
                <strong className="text-amber-900 dark:text-amber-300 font-bold block">Consola en Modo Sandbox (Simulado)</strong>
                <p className="text-[10px] opacity-80 mt-0.5">Estás navegando en modo offline simulado. Toda la información presentada es simulada localmente.</p>
              </div>
            </div>
          )}

          <Outlet />
        </div>
      </main>
    </div>
  );
}
