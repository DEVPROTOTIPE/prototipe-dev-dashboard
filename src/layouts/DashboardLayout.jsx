import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useDevStore } from '../stores/devStore';
import { cliService } from '../services/cliService';
import { 
  LayoutDashboard, CreditCard, Sparkles, BookOpen, AlertTriangle, GitCommit, FlaskConical, Layers,
  ChevronRight, ChevronLeft, User, Database, X, AlertCircle, RefreshCw, Terminal, Menu, Users, Activity
} from 'lucide-react';
import DarkModeToggle from '../components/ui/DarkModeToggle';

const NAV_TABS = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Inicio', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'crm', label: 'CRM Clientes', shortLabel: 'CRM', icon: Users, path: '/crm' },
  { id: 'noc', label: 'NOC Operaciones', shortLabel: 'NOC', icon: Activity, path: '/noc' },
  { id: 'billing', label: 'Facturación', shortLabel: 'Cobros', icon: CreditCard, path: '/billing' },
  { id: 'onboarding', label: 'Nuevo Cliente', shortLabel: 'Nuevo', icon: Sparkles, path: '/onboarding' },
  { id: 'library', label: 'Biblioteca', shortLabel: 'Biblioteca', icon: BookOpen, path: '/library' },
  { id: 'errors', label: 'Consola de Errores', shortLabel: 'Monitoreo', icon: AlertTriangle, path: '/errors' },
  { id: 'git', label: 'Control Git', shortLabel: 'Git', icon: GitCommit, path: '/git' },
  { id: 'e2e', label: 'Tests E2E', shortLabel: 'E2E', icon: FlaskConical, path: '/e2e' },
  { id: 'cores', label: 'Plantillas Core', shortLabel: 'Cores', icon: Layers, path: '/cores' },
];

// Tabs visibles en la bottom nav móvil (excluir herramientas técnicas de dev)
const MOBILE_NAV_TABS = NAV_TABS.filter(tab => tab.id !== 'e2e' && tab.id !== 'cores' && tab.id !== 'git' && tab.id !== 'noc');

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, role, logout } = useAuthStore();
  const { 
    isSimulated, dbStatus, failures, terminalDrawer, setTerminalDrawer, addLog,
    theme, toggleTheme
  } = useDevStore();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Terminal drawer local variables
  const [terminalLogs, setTerminalLogs] = useState([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addLog("Conexión de red restablecida. Consola de telemetría en línea.", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      addLog("Sin conexión a internet. Operando en modo local/desconectado.", "error");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addLog]);

  // Manejar el streaming de la terminal
  useEffect(() => {
    if (!terminalDrawer.open || !terminalDrawer.clientId) return;
    
    setTerminalLogs([]);
    const isNpm = terminalDrawer.type === 'npm';
    const sseUrl = isNpm 
      ? cliService.getDependencyInstallSseUrl(terminalDrawer.clientId)
      : cliService.getDevLogsSseUrl(terminalDrawer.clientId);

    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.log) {
          setTerminalLogs((prev) => [...prev, data.log].slice(-100)); // Guardar últimos 100
        }
        if (data.status === 'success' || data.status === 'error') {
          addLog(
            `[Terminal] ${terminalDrawer.title} finalizó: ${data.message || ''}`, 
            data.status === 'success' ? 'success' : 'error'
          );
        }
      } catch (err) {
        // En caso de que no sea JSON plano
        setTerminalLogs((prev) => [...prev, event.data].slice(-100));
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      setTerminalLogs((prev) => [...prev, '\n[Conexión SSE cerrada]'].slice(-100));
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [terminalDrawer.open, terminalDrawer.clientId, terminalDrawer.type, terminalDrawer.title, addLog]);

  const activeFailuresCount = failures.filter(f => !f.resolved).length;

  return (
    <div className="h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col relative font-sans overflow-hidden">

      {/* ===== FONDO TECNOLÓGICO PREMIUM ===== */}
      <div aria-hidden="true" className="tech-bg-dots" />
      <div aria-hidden="true" className="tech-bg-orb-1" />
      <div aria-hidden="true" className="tech-bg-orb-2" />
      <div aria-hidden="true" className="tech-bg-vignette" />

      {/* ===== HEADER / NAVBAR ===== */}
      <nav className="h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md pr-4 lg:pr-6 pl-0 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-colors duration-300 shrink-0">
        <div className="flex items-center gap-0">

          {/* Bloque izquierdo sincronizado con el ancho del sidebar en desktop */}
          <div className={`hidden lg:flex items-center h-14 border-r border-[var(--color-border)] transition-all duration-300 shrink-0 px-4 ${
            sidebarCollapsed ? 'w-[64px] justify-center' : 'w-[220px] justify-start gap-3'
          }`}>
            {/* Hamburger */}
            <button
              onClick={() => setSidebarCollapsed(prev => !prev)}
              className="w-8 h-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/50 hover:bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer shrink-0"
              title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              <Menu size={15} />
            </button>
            {/* Logo + Brand (solo cuando sidebar expandido) */}
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3 transition-all duration-300 ease-out select-none truncate">
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                  <img src="/logo.png?v=3" className="w-5 h-5 object-contain rounded-full" alt="Logo" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-sm tracking-wide text-[var(--color-text)] leading-tight">PROTOTIPE</span>
                </div>
              </div>
            )}
          </div>

          {/* Logo + Brand: visible en móvil siempre, en desktop solo cuando sidebar colapsado */}
          <div
            onClick={() => { if (window.innerWidth >= 1024) setSidebarCollapsed(false); }}
            className={`flex items-center gap-3 pl-4 sm:pl-6 transition-all duration-300 ease-out cursor-pointer hover:opacity-80 select-none ${
              !sidebarCollapsed ? 'lg:hidden' : 'lg:flex'
            }`}
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <img src="/logo.png?v=3" className="w-5 h-5 object-contain rounded-full" alt="Logo" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wide text-[var(--color-text)] leading-tight">PROTOTIPE</span>
            </div>
          </div>
        </div>

        {/* Indicadores en Navbar */}
        <div className="flex items-center gap-2">

          {/* Status radar animado */}
          <button
            onClick={() => navigate('/errors')}
            className={`hidden md:flex items-center gap-2 px-3 h-8 rounded-xl border text-[11px] font-bold cursor-pointer transition-all duration-200 active:scale-95 select-none ${
              isSimulated
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/15'
                : activeFailuresCount > 0
                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15'
            }`}
            title="Ver Consola de Errores y Monitoreo"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`animate-radar-pulse absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSimulated ? 'bg-amber-400' : activeFailuresCount > 0 ? 'bg-red-400' : 'bg-emerald-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isSimulated ? 'bg-amber-500' : activeFailuresCount > 0 ? 'bg-red-500' : 'bg-emerald-500'
              }`}></span>
            </span>
            <span className="tracking-wide">
              {isSimulated
                ? 'Sandbox Local'
                : activeFailuresCount > 0
                  ? `${activeFailuresCount} Fallo${activeFailuresCount > 1 ? 's' : ''} en Apps`
                  : 'Sistemas en Línea'
              }
            </span>
          </button>

          {/* Modo Oscuro */}
          <DarkModeToggle isDark={theme === 'dark'} onToggle={toggleTheme} />

          {/* Perfil */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="h-8 px-3 rounded-xl border bg-[var(--color-surface-2)]/50 hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border-[var(--color-border)] transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95 text-xs font-bold"
            title="Ver detalles del perfil"
          >
            <User size={13} />
            <span>Perfil</span>
          </button>
        </div>
      </nav>

      {/* ===== LAYOUT PRINCIPAL: SIDEBAR + CONTENIDO ===== */}
      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* SIDEBAR - Desktop */}
        <aside className={`hidden lg:flex flex-col shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md transition-all duration-300 ${
          sidebarCollapsed ? 'w-[64px]' : 'w-[220px]'
        }`}>
          <div className="flex flex-col gap-1 p-3 flex-1 pt-5 overflow-y-auto scrollbar-none">
            {NAV_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              return (
                <button
                  key={tab.id}
                  id={`sidebar-tab-${tab.id}`}
                  onClick={() => navigate(tab.path)}
                  title={sidebarCollapsed ? tab.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border w-full text-left ${
                    isActive
                      ? 'sidebar-item-active text-violet-400 border-violet-500/30'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/50 border-transparent'
                  }`}
                >
                  <Icon size={16} className={`shrink-0 ${isActive ? 'text-violet-400' : ''}`} />
                  {!sidebarCollapsed && <span className="truncate">{tab.label}</span>}
                  {!sidebarCollapsed && isActive && <ChevronRight size={12} className="ml-auto text-violet-400/60" />}
                </button>
              );
            })}
          </div>
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-[var(--color-border)] text-[9px] text-[var(--color-text-muted)] font-mono shrink-0">
              v{new Date().getFullYear()} · PROTOTIPE ENGINE
            </div>
          )}
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto scrollbar-thin pb-24 lg:pb-8">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-6 mt-6 space-y-6">

            {/* Alerta de Sandbox */}
            {isSimulated && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-400/90 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                <AlertCircle size={16} className="shrink-0 text-amber-500 animate-pulse mt-0.5" />
                <div>
                  <strong className="text-amber-900 dark:text-amber-300 font-bold block">Entorno Sandbox Activo</strong>
                  <p className="text-[10px] opacity-80 mt-0.5">Los cambios son en memoria. Configura <code className="font-mono">VITE_DEVELOPER_CENTRAL_*</code> en <code className="font-mono">.env.local</code> para producción.</p>
                </div>
              </div>
            )}

            {/* Renderizado de Páginas del Router */}
            <Outlet />

          </div>
        </main>
      </div>

      {/* ===== BOTTOM NAVIGATION - Móvil ===== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl pb-safe animate-slide-up">
        <div className="grid grid-cols-5 items-center justify-items-center px-1 py-1.5">
          {MOBILE_NAV_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            const isCenterAction = tab.id === 'onboarding';

            if (isCenterAction) {
              return (
                <button
                  key={tab.id}
                  id={`bottom-tab-${tab.id}`}
                  onClick={() => navigate(tab.path)}
                  className="relative -mt-3.5 flex flex-col items-center cursor-pointer transition-all duration-300 active:scale-95 group w-full"
                >
                  <div className={`w-13 h-13 rounded-full flex items-center justify-center bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 border border-violet-400/20 text-white shadow-[0_0_15px_rgba(124,58,237,0.5)] ${
                    isActive ? 'scale-105 animate-pulse-glow' : 'animate-center-float'
                  }`}>
                    <Icon size={20} className="transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                  </div>
                  <span className={`text-[9px] font-black tracking-wide mt-1.5 transition-colors duration-200 ${
                    isActive ? 'text-indigo-400' : 'text-[var(--color-text-muted)]'
                  }`}>{tab.shortLabel}</span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                id={`bottom-tab-${tab.id}`}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all duration-200 cursor-pointer w-full ${
                  isActive ? 'text-indigo-400' : 'text-[var(--color-text-muted)]'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isActive ? 'bg-indigo-500/15 shadow-[0_0_12px_rgba(99,102,241,0.2)]' : ''
                }`}>
                  <Icon size={18} />
                </div>
                <span className={`text-[9px] font-bold tracking-wide transition-all ${
                  isActive ? 'text-indigo-400' : 'text-[var(--color-text-muted)]'
                }`}>{tab.shortLabel}</span>
                {isActive && <div className="w-4 h-0.5 bg-indigo-400 rounded-full" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ===== TERMINAL DRAWER (FOOTER) ===== */}
      {terminalDrawer.open && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-slate-950 border-t border-slate-800 shadow-2xl flex flex-col h-[35vh] animate-slide-up">
          {/* Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-indigo-400" />
              <span className="text-xs font-black text-slate-200">{terminalDrawer.title}</span>
            </div>
            <button 
              onClick={() => setTerminalDrawer({ open: false, clientId: '', title: '' })}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
            >
              <X size={15} />
            </button>
          </div>
          {/* Terminal Console Output */}
          <div className="flex-1 p-4 font-mono text-[10px] text-slate-300 overflow-y-auto bg-black/40 scrollbar-thin select-text whitespace-pre-wrap leading-relaxed">
            {terminalLogs.length > 0 ? (
              terminalLogs.map((log, idx) => (
                <div key={idx} className={log.includes('error') || log.includes('Error') ? 'text-red-400' : ''}>
                  {log}
                </div>
              ))
            ) : (
              <div className="text-slate-500 animate-pulse flex items-center gap-1.5">
                <RefreshCw size={10} className="animate-spin" /> Conectando stream de salida local...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== MODAL DE DETALLE DE PERFIL ===== */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0" onClick={() => setIsProfileModalOpen(false)} />
          <div className="w-full max-w-sm bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
            
            {/* Header de Modal */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <span className="text-[10px] uppercase font-black text-indigo-400 tracking-wider">Perfil de Administrador</span>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Detalles del Perfil */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 border-2 border-violet-500/40 flex items-center justify-center select-none shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                <span className="text-xl font-extrabold text-violet-400">
                  {user?.email ? user.email.slice(0, 2).toUpperCase() : 'AD'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-base text-[var(--color-text)] tracking-tight leading-tight">{user?.email || 'Bypass User'}</p>
                <p className="text-[10px] text-violet-500 dark:text-violet-400 font-bold uppercase tracking-widest">{role === 'admin' ? 'Root Developer' : role.toUpperCase()}</p>
              </div>
            </div>

            {/* Información del Sistema */}
            <div className="p-4 bg-gradient-to-br from-[var(--color-surface-2)]/40 to-[var(--color-surface)]/60 border border-[var(--color-border)] rounded-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md space-y-3 text-xs text-left relative overflow-hidden group">
              <div className="flex justify-between items-center relative z-10">
                <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Database size={13} className="text-violet-400" />
                  Base de Datos
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider shadow-sm transition-all duration-300 flex items-center gap-1 ${
                  !isOnline 
                    ? 'bg-red-500/10 text-red-400 border-red-500/25 shadow-red-500/5'
                    : (dbStatus === 'connected' && !isSimulated
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-emerald-500/5'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-amber-500/5')
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    !isOnline ? 'bg-red-500' : (dbStatus === 'connected' && !isSimulated ? 'bg-emerald-500' : 'bg-amber-500')
                  }`} />
                  {!isOnline ? 'Offline' : (dbStatus === 'connected' && !isSimulated ? 'Firestore Online' : 'Sandbox')}
                </span>
              </div>
              
              <div className="h-px bg-gradient-to-r from-[var(--color-border)]/50 via-[var(--color-border)] to-transparent" />
              
              <div className="flex justify-between items-center relative z-10">
                <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={13} className="text-cyan-400" />
                  Entorno
                </span>
                <span className="font-extrabold text-[var(--color-text)] flex items-center gap-1 bg-[var(--color-surface-2)]/60 px-2 py-0.5 rounded-lg border border-[var(--color-border)] text-[10px]">
                  Vite + React 19
                </span>
              </div>
            </div>

            {/* Accesos a Herramientas de Desarrollador en Móvil */}
            <div className="lg:hidden grid grid-cols-3 gap-2 w-full mb-2">
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  navigate('/cores');
                }}
                className="py-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
              >
                <Layers size={13} />
                Cores
              </button>
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  navigate('/e2e');
                }}
                className="py-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
              >
                <FlaskConical size={13} />
                Tests E2E
              </button>
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  navigate('/git');
                }}
                className="py-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
              >
                <GitCommit size={13} />
                Git
              </button>
            </div>

            {/* Acción de Ajustes / Configuración */}
            <button 
              onClick={() => {
                setIsProfileModalOpen(false);
                navigate('/settings');
              }}
              className="w-full py-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md mb-2"
            >
              Ajustes del Sistema
            </button>

            {/* Acción de Cierre de Sesión */}
            <button 
              onClick={() => {
                setIsProfileModalOpen(false);
                logout();
              }}
              className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
