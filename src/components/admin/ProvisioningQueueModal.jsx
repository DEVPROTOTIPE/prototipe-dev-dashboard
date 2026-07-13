import React, { useState, useEffect } from 'react';
import { 
  X, 
  History, 
  Trash2, 
  RefreshCw, 
  Play, 
  Pause, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Clock,
  Ban,
  Loader2
} from 'lucide-react';
import { useAlertConfirm } from '../common/AlertConfirmContext';

export default function ProvisioningQueueModal({ isOpen, onClose, cliUrl = '' }) {
  const { showConfirm } = useAlertConfirm();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState(null);

  // Cargar cola desde el API Bridge
  const fetchQueue = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetch(`${cliUrl}/api/provisioning/queue`);
      if (!res.ok) {
        throw new Error(`Fallo de conexión: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success && data.queue) {
        setQueue(data.queue);
      } else {
        throw new Error(data.error || 'No se pudo obtener la cola de tareas.');
      }
      setError(null);
    } catch (err) {
      console.error('[ProvisioningQueueModal] Error:', err);
      setError(err.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Efecto de carga inicial y polling periódico (cada 4 segundos)
  useEffect(() => {
    if (isOpen) {
      fetchQueue(true);
      const interval = setInterval(() => {
        fetchQueue(false);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Cancelar un aprovisionamiento
  const handleCancelJob = async (taskId, clientId) => {
    const confirmed = await showConfirm({
      title: '¿Confirmar Cancelación?',
      message: `¿Estás completamente seguro de que deseas cancelar el aprovisionamiento de "${clientId}"? Esta acción liberará la cola y detendrá la tarea actual si está en proceso.`,
      confirmText: 'Sí, Cancelar Tarea',
      cancelText: 'No, Mantener Tarea',
      variant: 'error'
    });

    if (!confirmed) return;

    setCancellingId(taskId);
    try {
      const res = await fetch(`${cliUrl}/api/provisioning/queue/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      const data = await res.json();
      if (data.success) {
        // Recargar de inmediato
        fetchQueue(false);
      } else {
        throw new Error(data.error || 'No se pudo cancelar el trabajo.');
      }
    } catch (err) {
      console.error('[ProvisioningQueueModal] Error al cancelar:', err);
      alert(`Error al cancelar: ${err.message}`);
    } finally {
      setCancellingId(null);
    }
  };

  if (!isOpen) return null;

  // Renderizador estético de badges de estado
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'processing':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            En Proceso
          </span>
        );
      case 'queued':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono">
            <Clock className="w-2.5 h-2.5 animate-pulse" />
            En Cola
          </span>
        );
      case 'waiting_lock':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono">
            <Pause className="w-2.5 h-2.5" />
            Esperando Lock
          </span>
        );
      case 'acquiring_lock':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            Bloqueando
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-600/10 border border-emerald-600/15 text-emerald-500/90 font-mono">
            <CheckCircle className="w-2.5 h-2.5" />
            Completado
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono">
            <AlertCircle className="w-2.5 h-2.5" />
            Fallido
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-800/20 border border-slate-700/30 text-slate-500 font-mono">
            <Ban className="w-2.5 h-2.5" />
            Cancelado
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-400 font-mono">
            <HelpCircle className="w-2.5 h-2.5" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
      <div className="w-full max-w-3xl bg-slate-950 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-slate-800/60 px-6 py-4.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-wide uppercase">Cola e Historial de Aprovisionamientos</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Cola persistente en disco y control de concurrencia secuencial.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchQueue(true)}
              disabled={loading}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Refrescar cola"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-red-500/30 hover:bg-red-950/20 text-slate-400 hover:text-red-400 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Contenido / Tabla */}
        <div className="flex-1 overflow-y-auto p-6 text-left">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && queue.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <div className="text-xs text-slate-500 italic">Cargando cola persistente...</div>
            </div>
          ) : queue.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 border border-dashed border-slate-800 rounded-2xl">
              <History className="w-8 h-8 text-slate-700" />
              <div className="text-xs text-slate-400 font-extrabold uppercase mt-2">Cola Vacía</div>
              <p className="text-[10px] text-slate-650 text-center max-w-xs leading-relaxed mt-1">
                No hay registros de aprovisionamiento en la cola activa. Las nuevas instalaciones aparecerán aquí de forma automática.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto scrollbar-thin border border-slate-800 rounded-xl">
              <table className="w-full text-xs text-slate-300">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="px-4 py-3 text-left whitespace-nowrap">Cliente</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Plantilla</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Fecha de Registro</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Estado</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 bg-slate-950/20">
                  {queue.map((job) => {
                    const isCancelable = ['queued', 'processing', 'waiting_lock', 'acquiring_lock'].includes(job.status);
                    const formattedDate = job.createdAt 
                      ? new Date(job.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      : 'N/A';

                    return (
                      <tr key={job.taskId} className="hover:bg-slate-900/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-extrabold text-white text-xs">{job.answers?.projectName || job.clientId}</div>
                          <div className="text-[9px] text-slate-550 font-mono tracking-tighter mt-0.5">{job.taskId}</div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[10px] text-indigo-300">
                          {job.answers?.template || 'Desconocida'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-450 text-[10px] whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {renderStatusBadge(job.status)}
                          {job.error && (
                            <div className="text-[8px] text-rose-400 font-mono mt-1 break-words max-w-[200px]" title={job.error}>
                              Err: {job.error.length > 50 ? `${job.error.substring(0, 50)}...` : job.error}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          {isCancelable ? (
                            <button
                              onClick={() => handleCancelJob(job.taskId, job.answers?.projectName || job.clientId)}
                              disabled={cancellingId === job.taskId}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/20 text-rose-450 hover:text-rose-400 transition-all cursor-pointer disabled:opacity-50"
                              title="Cancelar aprovisionamiento"
                            >
                              {cancellingId === job.taskId ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Ban className="w-3 h-3" />
                              )}
                              <span>Cancelar</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-650 font-mono select-none">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
