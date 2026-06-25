import React, { useState, useEffect, useMemo } from 'react';
import { useDevStore } from '../../stores/devStore';
import { useAuthStore } from '../../stores/authStore';
import useToast from '../../hooks/useToast';
import { 
  Settings, LogOut, Users, Terminal, Activity 
} from 'lucide-react';
import DarkModeToggle from '../../components/ui/DarkModeToggle';

export default function SettingsPage() {
  const { 
    clientesSaas, 
    reports, 
    failures, 
    logs, 
    isSimulated, 
    setIsSimulated, 
    dbStatus, 
    theme, 
    toggleTheme, 
    addLog,
    setTerminalDrawer,
    setActiveTab
  } = useDevStore();

  const { user, logout } = useAuthStore();
  const { showToast } = useToast();

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Estados locales de filtrado para la terminal
  const [telemetryClientFilter, setTelemetryClientFilter] = useState('todos');
  const [telemetryTypeFilter, setTelemetryTypeFilter] = useState('todos');
  const [telemetrySearchQuery, setTelemetrySearchQuery] = useState('');

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

  // Listado unificado de clientes con telemetría
  const telemetryClientsList = useMemo(() => {
    const ids = new Set([
      ...clientesSaas.map(c => c.id),
      ...reports.map(r => r.clientId),
      ...failures.map(f => f.clientId),
      ...logs.map(l => l.client).filter(Boolean)
    ]);
    return Array.from(ids).map(id => {
      const failuresCount = failures.filter(f => f.clientId === id && !f.resolved).length;
      const billingCount = reports.filter(r => r.clientId === id).length;
      const config = clientesSaas.find(c => c.id === id) || {};
      return {
        id,
        name: config.nombre || id,
        failuresCount,
        billingCount,
        niche: config.niche || 'general',
        billingMode: config.billingMode || 'percentage'
      };
    });
  }, [clientesSaas, reports, failures, logs]);

  // Filtrado de logs
  const filteredTelemetryLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesClient = telemetryClientFilter === 'todos' || (log.client && log.client.toLowerCase() === telemetryClientFilter.toLowerCase());
      
      let matchesType = true;
      if (telemetryTypeFilter === 'error') {
        matchesType = log.type === 'error';
      } else if (telemetryTypeFilter === 'billing') {
        matchesType = log.type === 'success' && (log.message.includes('facturación') || log.message.includes('cobro') || log.message.includes('Billing') || log.message.includes('reportes'));
      } else if (telemetryTypeFilter === 'info_warning') {
        matchesType = log.type === 'info' || log.type === 'warning';
      }
      
      const matchesSearch = !telemetrySearchQuery || 
                            log.message.toLowerCase().includes(telemetrySearchQuery.toLowerCase()) || 
                            (log.client && log.client.toLowerCase().includes(telemetrySearchQuery.toLowerCase()));
      
      return matchesClient && matchesType && matchesSearch;
    });
  }, [logs, telemetryClientFilter, telemetryTypeFilter, telemetrySearchQuery]);

  const handleCleanTerminal = () => {
    useDevStore.setState({ logs: [] });
    showToast('Consola de telemetría limpia', { type: 'info' });
  };

  return (
    <div className="space-y-6 tab-content-enter">
      <div>
        <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
          <Settings size={20} className="text-slate-400" />
          Configuración del Sistema
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Ajustes globales de la consola central.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] space-y-4">
          <h3 className="font-extrabold text-sm text-[var(--color-text)]">Entorno y Telemetría</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-[var(--color-text)]">Modo de Ejecución</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">Sandbox no afecta datos reales</p>
              </div>
              <button onClick={() => { setIsSimulated(!isSimulated); addLog(`Modo: ${!isSimulated ? 'SANDBOX' : 'CONECTADO'}`, 'warning'); }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
                  isSimulated ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                {isSimulated ? 'Sandbox' : 'Conectado'}
              </button>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-[var(--color-text)]">Tema de Interfaz</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">Modo oscuro o claro</p>
              </div>
              <DarkModeToggle isDark={theme === 'dark'} onToggle={toggleTheme} />
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] space-y-4">
          <h3 className="font-extrabold text-sm text-[var(--color-text)]">Sesión</h3>
          <div className="space-y-3">
            <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
              <p className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Autenticado como</p>
              <p className="text-sm font-bold text-[var(--color-text)] mt-0.5">{user?.email || 'Bypass User'}</p>
              <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">Root Developer</p>
            </div>
            <button onClick={logout}
              className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]">
              <LogOut size={13} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Panel de Telemetría Centralizada */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Tarjetas de Clientes Activos */}
        <div className="space-y-4">
          <div className="bg-[var(--color-surface)] p-5 rounded-3xl border border-[var(--color-border)] shadow-md">
            <h3 className="font-extrabold text-sm text-[var(--color-text)] flex items-center gap-2">
              <Users size={16} className="text-indigo-400" />
              Instancias Activas ({telemetryClientsList.length})
            </h3>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
              Monitoreo de estado por cliente. Haz clic en una tarjeta para filtrar sus logs de telemetría.
            </p>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1.5 scrollbar-thin">
            {telemetryClientsList.map(client => {
              const isSelected = telemetryClientFilter.toLowerCase() === client.id.toLowerCase();
              const hasFailures = client.failuresCount > 0;
              
              return (
                <div 
                  key={client.id}
                  onClick={() => setTelemetryClientFilter(isSelected ? 'todos' : client.id)}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden select-none ${
                    isSelected 
                      ? 'bg-gradient-to-br from-indigo-500/15 via-[var(--color-surface-2)] to-indigo-500/5 border-indigo-500/40 shadow-md scale-[1.01]' 
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-slate-700/50 hover:bg-[var(--color-surface-2)]/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base select-none shrink-0">
                        {client.niche === 'wellness_podology' ? '🦶' :
                         client.niche === 'retail_clothing' ? '👕' :
                         client.niche === 'technical_services' ? '🛠️' :
                         client.niche === 'refrigeration_ac' ? '❄️' :
                         client.niche === 'contractors' ? '👷' :
                         client.niche === 'machinery_rental' ? '🚜' :
                         client.niche === 'carpentry' ? '🪚' :
                         client.niche === 'laundry' ? '🧺' :
                         client.niche === 'furniture_repair' ? '🛋️' :
                         client.niche === 'grocery_food' ? '🛒' : '📦'}
                      </span>
                      <h4 className="font-extrabold text-xs text-[var(--color-text)] truncate select-all">{client.id}</h4>
                    </div>
                    <span className="flex h-2.5 w-2.5 relative shrink-0">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        hasFailures ? 'bg-red-400' : 'bg-emerald-400'
                      }`} />
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        hasFailures ? 'bg-red-500' : 'bg-emerald-500'
                      }`} />
                    </span>
                  </div>

                  {client.name !== client.id && (
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate font-medium">{client.name}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-3.5">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Guardar filtro y saltar a Consola de Errores
                        useDevStore.setState({ activeTab: 'errors' });
                      }}
                      className={`p-2 rounded-xl border flex items-center justify-between text-[10px] font-bold transition-all hover:scale-[1.03] active:scale-[0.98] ${
                        hasFailures 
                          ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' 
                          : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
                      }`}
                      title="Ver diagnósticos en pestaña errores"
                    >
                      <span>⚠️ Fallos</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${hasFailures ? 'bg-red-500 text-white font-black' : 'bg-[var(--color-surface-2)] text-[var(--color-text)]'}`}>
                        {client.failuresCount}
                      </span>
                    </div>

                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Ir a la pestaña de facturación
                        useDevStore.setState({ activeTab: 'billing' });
                      }}
                      className="p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center justify-between text-[10px] font-bold text-[var(--color-text-muted)] transition-all hover:scale-[1.03] active:scale-[0.98] hover:bg-[var(--color-surface-2)]"
                      title="Ver facturas en pestaña facturación"
                    >
                      <span>💳 Cobros</span>
                      <span className="px-1.5 py-0.5 bg-[var(--color-surface-2)] text-[var(--color-text)] rounded-md text-[9px]">
                        {client.billingCount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna 2 y 3: Consola de logs Unix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-xl relative overflow-hidden flex flex-col h-full justify-between">
            <div className="absolute -top-[20%] -left-[10%] w-[300px] h-[300px] bg-indigo-500/5 blur-[80px] pointer-events-none rounded-full z-0" />
            <div className="absolute -bottom-[20%] -right-[10%] w-[300px] h-[300px] bg-emerald-500/5 blur-[80px] pointer-events-none rounded-full z-0" />
            
            <div className="relative z-1 space-y-4 flex-1 flex flex-col">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--color-border)]/65 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                    <Terminal size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[var(--color-text)] flex items-center gap-2">
                      Consola de Telemetría en Vivo
                      <span className="flex h-2 w-2 relative">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          !isOnline ? 'bg-red-400' : (isSimulated ? 'bg-amber-400' : 'bg-emerald-400')
                        }`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${
                          !isOnline ? 'bg-red-500' : (isSimulated ? 'bg-amber-500' : 'bg-emerald-500')
                        }`} />
                      </span>
                    </h3>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-mono">
                      telemetry_monitor.sh • {!isOnline ? 'Red Fuera de Línea' : (isSimulated ? 'Modo Sandbox' : 'Conectado a Firestore Central')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button 
                    onClick={handleCleanTerminal}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 text-[10px] font-bold rounded-lg border border-slate-700/60 transition-all cursor-pointer select-none active:scale-95 whitespace-nowrap"
                  >
                    Limpiar Terminal
                  </button>
                </div>
              </div>

              {/* Filtros de la terminal */}
              <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between bg-[var(--color-surface-2)]/60 p-3 rounded-2xl border border-[var(--color-border)]/70">
                <div className="flex flex-wrap gap-1 bg-[var(--color-surface-2)]/50 p-0.5 rounded-xl border border-[var(--color-border)]">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'error', label: 'Fallas (FAIL)' },
                    { id: 'billing', label: 'Cobros (BILLING)' },
                    { id: 'info_warning', label: 'Sistema' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTelemetryTypeFilter(t.id)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                        telemetryTypeFilter === t.id 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/80'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Buscar en logs..." 
                    value={telemetrySearchQuery}
                    onChange={(e) => setTelemetrySearchQuery(e.target.value)}
                    className="h-8 pl-8 pr-3 w-full md:w-48 bg-[var(--color-surface-2)]/65 border border-[var(--color-border)] text-[10px] text-[var(--color-text)] placeholder-[var(--color-text-muted)]/60 rounded-xl focus:outline-none focus:border-indigo-500/70 focus:bg-[var(--color-surface)] transition-all"
                  />
                  <Activity size={12} className="absolute left-3 top-2.5 text-[var(--color-text-muted)] animate-pulse" />
                  {telemetrySearchQuery && (
                    <button 
                      onClick={() => setTelemetrySearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-[9px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {telemetryClientFilter !== 'todos' && (
                <div className="flex items-center gap-1.5 self-start px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/25 rounded-full">
                  <span className="text-[8px] font-bold uppercase text-indigo-400 tracking-wider">Filtrando:</span>
                  <span className="text-[9px] font-extrabold text-[var(--color-text)] font-mono">{telemetryClientFilter}</span>
                  <button 
                    onClick={() => setTelemetryClientFilter('todos')}
                    className="w-3.5 h-3.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 flex items-center justify-center text-[8px] text-indigo-300 font-bold ml-1 cursor-pointer transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Terminal logs list */}
              <div className="bg-[var(--color-bg)] border border-[var(--color-border)]/80 rounded-2xl p-4 h-[350px] overflow-y-auto scrollbar-thin flex flex-col gap-2.5 shadow-inner select-text flex-1">
                {filteredTelemetryLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center my-auto space-y-2 select-none">
                    <Activity size={24} className="text-[var(--color-text-muted)] animate-pulse" />
                    <div className="text-[var(--color-text-muted)] italic text-xs font-mono">
                      ~/telemetria $ escuchando_eventos_en_vivo...
                    </div>
                  </div>
                ) : (
                  filteredTelemetryLogs.map((log, index) => {
                    const isClickable = log.type === 'error';
                    const hoverStyle = isClickable ? 'cursor-pointer hover:bg-red-500/10 hover:border-red-500/30 active:scale-[0.99] transition-all' : '';
                    
                    const statusConfig = {
                      info: { label: 'INFO', color: 'text-indigo-650 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
                      warning: { label: 'WARN', color: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
                      error: { label: 'FAIL', color: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20' },
                      success: { label: ' OK ', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
                    }[log.type] || { label: 'LOG', color: 'text-slate-650 dark:text-slate-400 bg-slate-500/10 border-slate-500/20' };

                    return (
                      <div 
                        key={log.id || index} 
                        className={`p-3 rounded-xl border bg-slate-900/40 border-slate-800/40 flex flex-col gap-1.5 transition-all ${hoverStyle}`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-800/40 pb-1.5">
                          <div className="flex items-center gap-2 select-none">
                            <span className={`px-2 py-0.5 rounded font-mono text-[8px] font-black uppercase border tracking-wider ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                            {log.client && (
                              <span 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTelemetryClientFilter(log.client);
                                }}
                                className="px-1.5 py-0.5 bg-slate-800/80 border border-slate-700/50 hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-450 font-mono text-[8px] rounded uppercase cursor-pointer select-all transition-colors"
                              >
                                {log.client}
                              </span>
                            )}
                          </div>
                          <span className="text-[8px] text-slate-500 font-mono select-none">{log.timestamp}</span>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <p className="font-mono text-[10px] text-slate-350 leading-relaxed break-words pl-1 flex-1">
                            <span className="text-slate-500 mr-1 select-none">➔</span>
                            {log.message}
                          </p>
                          {isClickable && (
                            <button
                              onClick={() => {
                                useDevStore.setState({ activeTab: 'errors' });
                              }}
                              className="px-2 py-0.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded text-[8px] font-bold font-mono transition-colors cursor-pointer shrink-0"
                            >
                              Diagnosticar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
