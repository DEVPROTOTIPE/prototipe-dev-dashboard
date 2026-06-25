import React, { useState } from 'react';
import { useNocStore } from '../../../stores/nocStore';
import { useAuthStore } from '../../../stores/authStore';
import useToast from '../../../hooks/useToast';
import { 
  AlertTriangle, CheckCircle, ShieldAlert, Clock, Filter, Eye, ShieldCheck 
} from 'lucide-react';

const SEVERITY_COLORS = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
};

const SEVERITY_LABELS = {
  critical: 'CRÍTICA',
  warning: 'ADVERTENCIA',
  info: 'INFORMACIÓN'
};

export default function AlertCenterView() {
  const { user } = useAuthStore();
  const { alerts, resolveSystemAlert } = useNocStore();
  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState('active'); // 'active' | 'resolved' | 'all'
  const [severityFilter, setSeverityFilter] = useState('all'); // 'all' | 'critical' | 'warning'
  const [actionLoading, setActionLoading] = useState(null);

  // 1. Filtrar alertas
  const filteredAlerts = alerts.filter(a => {
    const matchActive = activeFilter === 'all' 
      ? true 
      : activeFilter === 'active' ? a.active : !a.active;

    const matchSeverity = severityFilter === 'all' 
      ? true 
      : a.severity === severityFilter;

    return matchActive && matchSeverity;
  });

  const handleResolve = async (alertId) => {
    setActionLoading(alertId);
    try {
      await resolveSystemAlert(alertId, user);
      showToast('Incidente marcado como mitiga/resuelto.', { type: 'success' });
    } catch (err) {
      console.error(err);
      showToast('Error al resolver la alerta.', { type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 tab-content-enter select-none text-left">
      
      {/* ===== HEADER Y FILTROS ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--color-surface-glass)] border border-[var(--color-border)] p-4 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Selector Estado */}
          <div className="flex bg-[var(--color-surface-2)]/60 p-1 rounded-xl border border-[var(--color-border)] text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-3 py-1.5 rounded-lg border-none cursor-pointer font-bold ${
                activeFilter === 'active'
                  ? 'bg-indigo-600 text-white font-black'
                  : 'bg-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Activas ({alerts.filter(a => a.active).length})
            </button>
            <button
              onClick={() => setActiveFilter('resolved')}
              className={`px-3 py-1.5 rounded-lg border-none cursor-pointer font-bold ${
                activeFilter === 'resolved'
                  ? 'bg-indigo-600 text-white font-black'
                  : 'bg-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Resueltas ({alerts.filter(a => !a.active).length})
            </button>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg border-none cursor-pointer font-bold ${
                activeFilter === 'all'
                  ? 'bg-indigo-600 text-white font-black'
                  : 'bg-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas
            </button>
          </div>

          {/* Filtro Gravedad */}
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[var(--color-surface-2)]/65 border border-[var(--color-border)]/60 rounded-xl px-4 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500 font-bold"
          >
            <option value="all">Todas las gravedades</option>
            <option value="critical">Críticas</option>
            <option value="warning">Advertencias</option>
          </select>
        </div>

        <span className="text-[10px] text-slate-500 font-mono">
          Visualizando {filteredAlerts.length} alertas de sistema
        </span>
      </div>

      {/* ===== LISTA DE ALERTAS ===== */}
      <div className="space-y-3.5">
        {filteredAlerts.map(alert => {
          const dateStr = alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'N/A';
          const resolvedDateStr = alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : '';

          return (
            <div 
              key={alert.id}
              className={`p-5 rounded-2xl border bg-[var(--color-surface)] shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-[var(--color-border)] ${
                alert.active ? 'hover:border-red-500/25' : 'opacity-70'
              }`}
            >
              <div className="flex gap-4 items-start text-left">
                {/* Icono de Severidad */}
                <div className={`p-2.5 rounded-xl border shrink-0 ${SEVERITY_COLORS[alert.severity]}`}>
                  {alert.severity === 'critical' ? (
                    <ShieldAlert size={18} className="animate-pulse" />
                  ) : (
                    <AlertTriangle size={18} />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase text-slate-200 tracking-wide">
                      🏢 {alert.clientId}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black border uppercase tracking-wider font-mono ${SEVERITY_COLORS[alert.severity]}`}>
                      {SEVERITY_LABELS[alert.severity]}
                    </span>
                    {!alert.active && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase tracking-wider font-mono">
                        RESUELTO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-350 font-medium">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
                    <Clock size={11} />
                    <span>Abierto el {dateStr}</span>
                    {alert.resolvedAt && (
                      <span className="text-emerald-500/80">· Resuelto el {resolvedDateStr}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de Mitigación */}
              {alert.active ? (
                <button
                  disabled={actionLoading === alert.id}
                  onClick={() => handleResolve(alert.id)}
                  className="w-full md:w-auto px-4 py-2 rounded-xl text-xs font-black bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-transparent transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 self-start md:self-auto"
                >
                  <ShieldCheck size={14} />
                  Marcar Resuelta
                </button>
              ) : (
                <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1 shrink-0 self-start md:self-auto font-mono">
                  ✓ Ok · Mitigado
                </div>
              )}
            </div>
          );
        })}
        {filteredAlerts.length === 0 && (
          <div className="p-16 text-center text-slate-500 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
            No se encontraron alertas para el filtro seleccionado.
          </div>
        )}
      </div>

    </div>
  );
}
