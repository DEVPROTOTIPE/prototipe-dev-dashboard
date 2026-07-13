import React, { useState, useEffect } from 'react';
import { 
  X, 
  Flame, 
  Plus, 
  RefreshCw, 
  User, 
  LogOut, 
  ShieldCheck, 
  Database,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAlertConfirm } from '../common/AlertConfirmContext';

export default function FirebaseAccountsModal({ isOpen, onClose, cliUrl = '' }) {
  const { showConfirm } = useAlertConfirm();
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // 'add' | 'use-<email>' | 'logout-<email>'
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [warningMsg, setWarningMsg] = useState(null);

  // Cargar cuentas y proyectos de la cuenta activa
  const loadData = async () => {
    setLoading(true);
    setError(null);
    setWarningMsg(null);
    try {
      // 1. Obtener cuentas locales
      const accountsRes = await fetch(`${cliUrl}/api/firebase/accounts`);
      const accountsData = await accountsRes.json();
      
      if (accountsData.success) {
        const list = accountsData.accounts || [];
        setAccounts(list);
        
        // Identificar la activa
        const active = list.find(acc => acc.active);
        if (active) {
          setActiveAccount(active.user.email);
        } else {
          setActiveAccount(null);
        }

        if (accountsData.warning) {
          setWarningMsg(accountsData.warning);
        }
      } else {
        throw new Error(accountsData.error || 'No se pudieron recuperar las cuentas de Firebase.');
      }

      // 2. Obtener proyectos si hay una cuenta activa
      const statusRes = await fetch(`${cliUrl}/api/firebase/accounts/status`);
      const statusData = await statusRes.json();
      if (statusData.success) {
        setProjects(statusData.projects || []);
      } else {
        setProjects([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Alternar cuenta activa (login:use)
  const handleUseAccount = async (email) => {
    setActionLoading(`use-${email}`);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${cliUrl}/api/firebase/accounts/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Cuenta activa cambiada a: ${email}`);
        await loadData();
      } else {
        throw new Error(data.error || 'Fallo al alternar la cuenta.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Agregar una nueva cuenta (login:add)
  const handleAddAccount = async () => {
    setActionLoading('add');
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${cliUrl}/api/firebase/accounts/add`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Se ha abierto el navegador para vincular la nueva cuenta de Google.');
        // Intervalo de re-consulta para actualizar la lista una vez el usuario loguee
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          const checkRes = await fetch(`${cliUrl}/api/firebase/accounts`);
          const checkData = await checkRes.json();
          if (checkData.success && checkData.accounts.length > accounts.length) {
            clearInterval(interval);
            loadData();
          }
          if (attempts > 30) clearInterval(interval); // 1 minuto de timeout
        }, 2000);
      } else {
        throw new Error(data.error || 'Fallo al iniciar vinculación.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Cerrar sesión en cuenta específica (logout)
  const handleLogoutAccount = async (email) => {
    const confirmLogout = await showConfirm({
      title: '¿Cerrar Sesión?',
      message: `Esta acción revocará los tokens locales de Firebase para la cuenta ${email}. ¿Deseas continuar?`,
      variant: 'error',
      confirmText: 'Sí, Cerrar Sesión',
      cancelText: 'Cancelar'
    });

    if (!confirmLogout) return;

    setActionLoading(`logout-${email}`);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${cliUrl}/api/firebase/accounts/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Sesión revocada correctamente para: ${email}`);
        await loadData();
      } else {
        throw new Error(data.error || 'Fallo al cerrar sesión.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  // Límite de proyectos del plan Spark (Firebase permite hasta 10 proyectos gratuitos por cuenta)
  const sparkLimit = 10;
  const projectCount = projects.length;
  const projectPercentage = Math.min(100, Math.round((projectCount / sparkLimit) * 100));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
      <div className="w-full max-w-lg bg-slate-900/60 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 flex flex-col max-h-[85vh] premium-glass-panel overflow-hidden">
        
        {/* Estilo local para pulse */}
        <style dangerouslySetInnerHTML={{ __html: `
          .premium-glass-panel {
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(245, 124, 0, 0.2);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(245, 124, 0, 0.08);
          }
        `}} />

        {/* Header */}
        <div className="p-6 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 rounded-xl border border-orange-500/30">
              <Flame className="text-orange-500 animate-pulse" size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100 tracking-tight leading-tight">Cuentas y Proyectos Firebase</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Gestor de Rotación de Identidades</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Contenido (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* Alertas de Feedback */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-2xl text-xs text-red-400">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{error}</p>
            </div>
          )}
          {successMsg && (
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-xs text-emerald-400">
              <CheckCircle size={15} className="flex-shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{successMsg}</p>
            </div>
          )}
          {warningMsg && (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-xs text-amber-400">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{warningMsg}</p>
            </div>
          )}

          {/* Cuenta Activa Destacada */}
          <div className="p-4 bg-gradient-to-br from-slate-800/40 to-slate-900/60 border border-slate-800/80 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1 min-w-0">
                <span className="text-[9px] font-black uppercase text-orange-400 tracking-wider">Identidad Activa Actual</span>
                {activeAccount ? (
                  <h4 className="text-base font-extrabold text-slate-100 tracking-tight truncate">{activeAccount}</h4>
                ) : (
                  <h4 className="text-sm font-extrabold text-red-400 tracking-tight">Sin cuenta activa (Autenticación requerida)</h4>
                )}
              </div>
              {activeAccount && (
                <span className="flex-shrink-0 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Listo
                </span>
              )}
            </div>

            {activeAccount && (
              <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Database size={13} className="text-orange-400" />
                  Proyectos en la cuenta: <strong>{projectCount}</strong>
                </span>
                <span className="text-[10px] text-slate-500">Spark Plan</span>
              </div>
            )}
          </div>

          {/* Barra de progreso de Proyectos Spark si hay cuenta activa */}
          {activeAccount && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Límite de proyectos Spark (Gratuito)</span>
                <span>{projectCount} / {sparkLimit}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    projectCount >= sparkLimit 
                      ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                      : (projectCount >= sparkLimit - 2 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(245,124,0,0.5)]')
                  }`}
                  style={{ width: `${projectPercentage}%` }}
                />
              </div>
              {projectCount >= sparkLimit && (
                <p className="text-[10px] text-red-400 flex items-center gap-1">
                  <AlertCircle size={10} />
                  Has alcanzado el límite gratuito. Cambia a otra cuenta o elimina proyectos para evitar fallas.
                </p>
              )}
            </div>
          )}

          {/* Listado Completo de Cuentas */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider">Cuentas vinculadas localmente</h5>
              <button 
                onClick={loadData}
                disabled={loading}
                className="text-[10px] text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
                Actualizar
              </button>
            </div>

            {loading && accounts.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">Cargando lista de identidades locales...</div>
            ) : accounts.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500 space-y-2">
                <p>No tienes cuentas de Firebase configuradas en esta máquina.</p>
                <p className="text-[10px] text-slate-600">Presiona "+ Vincular nueva cuenta" para conectar una cuenta de Google.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {accounts.map((acc) => {
                  const isCurrent = acc.active;
                  const isActionBusy = actionLoading === `use-${acc.user.email}` || actionLoading === `logout-${acc.user.email}`;
                  
                  return (
                    <div 
                      key={acc.user.email}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                        isCurrent 
                          ? 'bg-orange-500/5 border-orange-500/30' 
                          : 'bg-slate-800/20 border-slate-800/80 hover:border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl flex-shrink-0 ${isCurrent ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-800 text-slate-400'}`}>
                          <User size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-200 truncate">{acc.user.email}</p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {isCurrent ? 'Sesión activa para creación' : 'Inactiva (almacenada)'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isCurrent && (
                          <button
                            onClick={() => handleUseAccount(acc.user.email)}
                            disabled={!!actionLoading}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-[10px] font-extrabold text-slate-300 rounded-lg border border-slate-700/60 hover:text-slate-100 transition-all duration-200 cursor-pointer"
                          >
                            {isActionBusy ? 'Activando...' : 'Activar'}
                          </button>
                        )}
                        <button
                          onClick={() => handleLogoutAccount(acc.user.email)}
                          disabled={!!actionLoading}
                          title="Cerrar sesión y remover de la máquina"
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-400 rounded-lg border border-red-500/25 transition-all duration-200 cursor-pointer"
                        >
                          <LogOut size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800/60 flex items-center justify-between flex-shrink-0">
          <a 
            href="https://console.firebase.google.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-slate-400 hover:text-orange-400 transition-colors font-bold flex items-center gap-1"
          >
            Consola Firebase
            <ExternalLink size={10} />
          </a>
          
          <button
            onClick={handleAddAccount}
            disabled={actionLoading === 'add'}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-1.5 transition-all duration-300 shadow-md hover:shadow-orange-500/10 disabled:opacity-50 active:scale-95 border border-orange-400/20"
          >
            <Plus size={14} />
            {actionLoading === 'add' ? 'Abriendo login...' : 'Vincular nueva cuenta'}
          </button>
        </div>

      </div>
    </div>
  );
}
