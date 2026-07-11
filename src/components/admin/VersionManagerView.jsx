import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  GitCommit, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Terminal, 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  Database,
  Lock,
  Unlock,
  AlertTriangle,
  Play
} from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';
import { CLI_URL } from '../../config';

// Mock de permisos disponibles (para la simulación de DevOps Guard de PROTOTIPE)
const USER_PERMISSIONS = {
  'platform.update.preview': true,
  'platform.update.execute': true,
  'platform.rollback.execute': true
};

export function VersionManagerView({ clientesSaas = [] }) {
  const [loading, setLoading] = useState(false);
  const [coreReferenceVersion, setCoreReferenceVersion] = useState('2.8.5');
  const [instancesVersionData, setInstancesVersionData] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Estados para el Preflight y Plan
  const [preflightPlan, setPreflightPlan] = useState(null);
  const [isPreflightModalOpen, setIsPreflightModalOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState({
    backup: false,
    lock: false,
    downtime: false
  });

  // Estados para SSE Update Execution
  const [executionLogs, setExecutionLogs] = useState([]);
  const [executionStatus, setExecutionStatus] = useState('idle'); // idle, running, done, rolled_back, error
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const eventSourceRef = useRef(null);
  const logEndRef = useRef(null);

  // Simulación de Roles/Permisos para validar DevOps Guard
  const [simulatedRole, setSimulatedRole] = useState('devops_senior'); // reader, operator, devops_senior
  const [simulatedPermissions, setSimulatedPermissions] = useState(USER_PERMISSIONS);

  useEffect(() => {
    // Ajustar permisos simulados
    if (simulatedRole === 'reader') {
      setSimulatedPermissions({
        'platform.update.preview': false,
        'platform.update.execute': false,
        'platform.rollback.execute': false
      });
    } else if (simulatedRole === 'operator') {
      setSimulatedPermissions({
        'platform.update.preview': true,
        'platform.update.execute': false,
        'platform.rollback.execute': false
      });
    } else {
      setSimulatedPermissions(USER_PERMISSIONS);
    }
  }, [simulatedRole]);

  // Cargar datos del Version Manager
  const fetchVersionStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${CLI_URL}/api/project/versions`);
      const data = await res.json();
      if (data.success) {
        setCoreReferenceVersion(data.coreReferenceVersion);
        setInstancesVersionData(data.clients);
      }
    } catch (err) {
      console.error('Error al consultar versiones del CLI Bridge:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersionStatus();
  }, [clientesSaas]);

  // Auto-scroll en consola SSE
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [executionLogs]);

  // Iniciar Preflight Check
  const handlePreflightCheck = async (clientId) => {
    if (!simulatedPermissions['platform.update.preview']) {
      alert('🔒 DevOps Guard: Carece del permiso requerido "platform.update.preview" para ver el plan.');
      return;
    }

    setLoading(true);
    setSelectedClient(clientId);
    try {
      const res = await fetch(`${CLI_URL}/api/project/update/preflight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, operator: simulatedRole })
      });
      const data = await res.json();
      if (data.success) {
        setPreflightPlan(data.plan);
        setTermsAccepted({ backup: false, lock: false, downtime: false });
        setIsPreflightModalOpen(true);
      } else {
        alert(`Error al generar plan: ${data.error}`);
      }
    } catch (err) {
      console.error('Error al generar preflight plan:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lanzar Actualización Real por SSE
  const handleExecuteUpdate = () => {
    if (!simulatedPermissions['platform.update.execute']) {
      alert('🔒 DevOps Guard: Carece del permiso requerido "platform.update.execute" para ejecutar la actualización.');
      return;
    }

    if (!termsAccepted.backup || !termsAccepted.lock || !termsAccepted.downtime) {
      alert('Por favor, confirma todas las casillas de validación del pre-flight.');
      return;
    }

    setIsPreflightModalOpen(false);
    setExecutionLogs([]);
    setExecutionStatus('running');
    setIsLogDrawerOpen(true);

    const url = `${CLI_URL}/api/project/update/apply?clientId=${selectedClient}&updateId=${preflightPlan.updateId}&operator=${simulatedRole}`;
    
    eventSourceRef.current = new EventSource(url);
    
    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === 'progress') {
        setExecutionLogs((prev) => [...prev, data.text]);
      } else if (data.status === 'done') {
        setExecutionLogs((prev) => [...prev, `[ÉXITO] ${data.text}`]);
        setExecutionStatus('done');
        fetchVersionStatus();
        eventSourceRef.current.close();
      } else if (data.status === 'rolled_back') {
        setExecutionLogs((prev) => [...prev, `[ROLLBACK] ${data.text}`]);
        setExecutionStatus('rolled_back');
        fetchVersionStatus();
        eventSourceRef.current.close();
      } else if (data.status === 'error') {
        setExecutionLogs((prev) => [...prev, `[FALLO CRÍTICO] ${data.text}`]);
        setExecutionStatus('error');
        eventSourceRef.current.close();
      }
    };

    eventSourceRef.current.onerror = (err) => {
      setExecutionLogs((prev) => [...prev, '[FALLO CONEXIÓN] Desconexión o timeout del SSE Bridge. Actualización en curso en background...']);
      eventSourceRef.current.close();
    };
  };

  // Lanzar Rollback Manual
  const handleManualRollback = async (clientId, updateId) => {
    if (!simulatedPermissions['platform.rollback.execute']) {
      alert('🔒 DevOps Guard: Carece del permiso requerido "platform.rollback.execute" para restaurar copias.');
      return;
    }

    if (!confirm(`¿Está seguro de forzar el rollback físico al respaldo "${updateId}"? Esto sobreescribirá el disco del cliente.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${CLI_URL}/api/project/update/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, updateId })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchVersionStatus();
      } else {
        alert(`Error al revertir: ${data.error}`);
      }
    } catch (err) {
      console.error('Error en rollback manual:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener badge estilizado por tipo de drift
  const getStatusBadge = (status) => {
    switch (status) {
      case 'UP_TO_DATE':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1 w-max">
            <CheckCircle size={10} /> Al día
          </span>
        );
      case 'CORE_DRIFT':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center gap-1 w-max">
            <AlertTriangle size={10} /> Core Desactualizado
          </span>
        );
      case 'FEATURE_UPDATE_AVAILABLE':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center gap-1 w-max">
            <Database size={10} /> Módulos Pendientes
          </span>
        );
      case 'CONFIG_DRIFT':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-slate-500/15 text-slate-400 border border-slate-500/20 rounded-full flex items-center gap-1 w-max">
            <RefreshCw size={10} /> Branding Drift
          </span>
        );
      case 'PENDING_PROVISIONING':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center gap-1 w-max">
            <AlertCircle size={10} /> Sin Aprovisionar
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full flex items-center gap-1 w-max">
            Desconocido
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 tab-content-enter">
      {/* DevOps Guard Simulator (Control de Seguridad en Vivo) */}
      <div className="p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black text-[var(--color-text)] uppercase tracking-wider">DevOps Guard & Control de Accesos</h4>
            <p className="text-[10px] text-[var(--color-text-muted)]">Control de permisos específico para la inyección de parches en caliente.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)]">Simular Rol:</span>
          <div className="w-44">
            <CustomSelect 
              value={simulatedRole} 
              onChange={setSimulatedRole} 
              options={[
                { value: 'devops_senior', label: 'DevOps Senior (All)' },
                { value: 'operator', label: 'Operador (Preview)' },
                { value: 'reader', label: 'Lector (Sin Acceso)' }
              ]} 
            />
          </div>
          <div className="flex gap-1.5">
            {Object.entries(simulatedPermissions).map(([perm, status]) => (
              <span 
                key={perm}
                title={perm}
                className={`w-2.5 h-2.5 rounded-full ${status ? 'bg-emerald-500' : 'bg-red-500'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Header del Versionador */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-lg font-black text-[var(--color-text)] flex items-center gap-2">
            <GitCommit size={18} className="text-indigo-400" />
            <span>Version Manager & Update Pipeline</span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Controla las derivas de código e inyecta parches a los clientes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-2">
            <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase">Referencia Core:</span>
            <span className="text-xs font-mono font-black text-indigo-400">{coreReferenceVersion}</span>
          </div>
          <button 
            onClick={fetchVersionStatus}
            disabled={loading}
            className="p-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl cursor-pointer transition-colors active:scale-95 disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabla de Versiones */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50">
                <th className="p-4 text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">Cliente / Instancia</th>
                <th className="p-4 text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">Versión Instalada</th>
                <th className="p-4 text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">Estado de Drift</th>
                <th className="p-4 text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">Última Actualización</th>
                <th className="p-4 text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider text-right">Operaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-xs">
              {instancesVersionData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-[var(--color-text-muted)] italic">
                    {loading ? 'Escaneando lockfiles...' : 'Sin instancias aprovisionadas en el disco.'}
                  </td>
                </tr>
              ) : (
                instancesVersionData.map((inst) => (
                  <tr key={inst.clientId} className="hover:bg-[var(--color-surface-2)]/30 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold text-[var(--color-text)]">{inst.clientId}</span>
                        <span className="text-[9px] text-[var(--color-text-muted)] font-mono">{inst.drifts.length} derivas detectadas</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text)]">
                        v{inst.currentCoreVersion}
                      </span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(inst.status)}
                    </td>
                    <td className="p-4 text-[var(--color-text-muted)]">
                      {inst.lastUpdate ? (
                        <div className="flex flex-col gap-0.5 text-[10px]">
                          <span>{new Date(inst.lastUpdate.date).toLocaleDateString()}</span>
                          <span className="font-mono text-[9px]">{inst.lastUpdate.operator} / {inst.lastUpdate.updateId}</span>
                        </div>
                      ) : (
                        <span className="italic text-[10px]">Sin registro</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {inst.status !== 'PENDING_PROVISIONING' && inst.status !== 'UP_TO_DATE' && (
                          <button
                            onClick={() => handlePreflightCheck(inst.clientId)}
                            className="h-7 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 text-[10px]"
                          >
                            Ver Plan
                          </button>
                        )}
                        {inst.lastUpdate && (
                          <button
                            onClick={() => handleManualRollback(inst.clientId, inst.lastUpdate.updateId)}
                            className="h-7 px-2.5 bg-[var(--color-surface-2)] hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 border border-[var(--color-border)] rounded-lg font-bold transition-all cursor-pointer active:scale-95 text-[10px]"
                            title="Restaurar a copia física anterior"
                          >
                            Rollback
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Pre-flight Checklist & Update Plan */}
      {isPreflightModalOpen && preflightPlan && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] animate-scale-up">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400 animate-pulse" />
                <h3 className="font-extrabold text-sm text-[var(--color-text)]">
                  Blueprint Plan de Actualización: {selectedClient}
                </h3>
              </div>
              <button 
                onClick={() => setIsPreflightModalOpen(false)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            {/* Contenido Plan */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
              <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-start gap-3">
                <ShieldAlert size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
                  <span className="font-extrabold text-[var(--color-text)] block mb-1">DevOps Guard — Resumen Operativo:</span>
                  Este plan modificará archivos de core y features para actualizar la versión del Core a la <span className="font-mono text-indigo-300 font-bold">v{preflightPlan.coreVersion}</span>. Se ha generado el identificador <span className="font-mono text-indigo-300 font-bold">{preflightPlan.updateId}</span>.
                </div>
              </div>

              {/* Lista de Cambios Físicos */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Manifiesto de Archivos que cambiarán:</h4>
                <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden bg-[var(--color-surface-2)]/40 max-h-48 overflow-y-auto text-[10px] font-mono">
                  {preflightPlan.fileChanges.map((change, idx) => (
                    <div key={idx} className="p-2 border-b border-[var(--color-border)] flex items-center justify-between gap-4">
                      <span className="truncate text-slate-300">{change.file}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                        change.action === 'NEW' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-indigo-500/15 text-indigo-400'
                      }`}>
                        {change.action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dependencias NPM */}
              {Object.keys(preflightPlan.npmChanges).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Cambios en dependencias package.json:</h4>
                  <div className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl font-mono text-[10px] grid grid-cols-2 gap-2 text-indigo-400">
                    {Object.entries(preflightPlan.npmChanges).map(([dep, ver]) => (
                      <div key={dep} className="flex justify-between border-b border-[var(--color-border)] pb-1">
                        <span className="text-slate-350">{dep}</span>
                        <span>{ver}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Checklist de Preflight */}
              <div className="space-y-2.5 pt-2 border-t border-[var(--color-border)]">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-rose-400">Confirmación Pre-flight Requerida:</h4>
                <div className="space-y-2 text-[10px] text-[var(--color-text-muted)]">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={termsAccepted.backup}
                      onChange={(e) => setTermsAccepted(prev => ({ ...prev, backup: e.target.checked }))}
                      className="mt-0.5" 
                    />
                    <span>Entiendo que se creará una copia de respaldo física versionada en el directorio scratch/backups antes de escribir.</span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={termsAccepted.lock}
                      onChange={(e) => setTermsAccepted(prev => ({ ...prev, lock: e.target.checked }))}
                      className="mt-0.5" 
                    />
                    <span>Acepto que se alineará la versión del Core en prototipe.lock.json a la versión {preflightPlan.coreVersion}.</span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={termsAccepted.downtime}
                      onChange={(e) => setTermsAccepted(prev => ({ ...prev, downtime: e.target.checked }))}
                      className="mt-0.5" 
                    />
                    <span>Doy el consentimiento para la ejecución del pipeline y la realización del test de compilación automático.</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)] shrink-0">
              <button 
                onClick={() => setIsPreflightModalOpen(false)}
                className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-[11px] font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleExecuteUpdate}
                disabled={!termsAccepted.backup || !termsAccepted.lock || !termsAccepted.downtime}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white border-none rounded-xl text-[11px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Play size={10} />
                <span>Aplicar Plan de Actualización</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* SSE Progress Drawer / Consola en Vivo */}
      {isLogDrawerOpen && createPortal(
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950 border-l border-white/[0.08] shadow-2xl flex flex-col animate-slide-left">
          {/* Header Drawer */}
          <div className="p-4 border-b border-white/[0.05] flex items-center justify-between shrink-0 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-indigo-400" />
              <span className="font-extrabold text-[var(--color-text)] text-xs uppercase tracking-wider">Update Pipeline Console</span>
            </div>
            {executionStatus !== 'running' && (
              <button 
                onClick={() => setIsLogDrawerOpen(false)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold cursor-pointer"
              >
                Cerrar Consola
              </button>
            )}
          </div>

          {/* Consola Terminal */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-[10px] leading-relaxed text-slate-350 bg-black/60 space-y-2 select-text scrollbar-thin">
            {executionLogs.length === 0 && (
              <div className="text-slate-500 italic">Estableciendo canal de Server-Sent Events...</div>
            )}
            {executionLogs.map((log, idx) => (
              <div key={idx} className={
                log.startsWith('[ÉXITO]') ? 'text-emerald-400' :
                log.startsWith('[ROLLBACK]') ? 'text-amber-400 font-bold' :
                log.startsWith('[FALLO') ? 'text-rose-500 font-bold' :
                log.startsWith('  ➔') ? 'text-slate-400' : 'text-slate-300'
              }>
                {log}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>

          {/* Status Bar */}
          <div className="p-4 border-t border-white/[0.05] shrink-0 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {executionStatus === 'running' && (
                <>
                  <RefreshCw size={12} className="text-indigo-400 animate-spin" />
                  <span className="text-[10px] text-indigo-400 font-bold animate-pulse">Ejecutando parches y build...</span>
                </>
              )}
              {executionStatus === 'done' && (
                <>
                  <CheckCircle size={12} className="text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-bold">Pipeline finalizado con éxito</span>
                </>
              )}
              {executionStatus === 'rolled_back' && (
                <>
                  <AlertTriangle size={12} className="text-amber-400" />
                  <span className="text-[10px] text-amber-400 font-bold">Cambios revertidos automáticamente</span>
                </>
              )}
              {executionStatus === 'error' && (
                <>
                  <AlertCircle size={12} className="text-rose-500" />
                  <span className="text-[10px] text-rose-500 font-bold">Error crítico</span>
                </>
              )}
            </div>
            {executionStatus !== 'running' && (
              <button
                onClick={() => setIsLogDrawerOpen(false)}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-extrabold uppercase rounded-lg cursor-pointer"
              >
                Aceptar
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default VersionManagerView;
