import React, { useMemo } from 'react';
import { useDevStore } from '../../../stores/devStore';
import { useNocStore } from '../../../stores/nocStore';
import useCrm from '../../../hooks/useCrm';
import { calculateClientHealth } from '../../../utils/crmHelpers';
import { 
  ShieldCheck, AlertTriangle, XCircle, CheckCircle, 
  Activity, Cpu, Database, Server, RefreshCw, Layers, Calendar, ExternalLink 
} from 'lucide-react';

const STATUS_CHIPS = {
  ONLINE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  WARNING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  OFFLINE: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
};

export default function ClientFleetView() {
  const { clientesSaas, failures, reports } = useDevStore();
  const { metrics, alerts } = useNocStore();
  const { projects, followups } = useCrm(true);

  // Computar el estado de cada cliente en la flota
  const fleet = useMemo(() => {
    return clientesSaas.map(client => {
      const metric = metrics.find(m => m.clientId === client.id);
      const clientAlerts = alerts.filter(a => a.clientId === client.id);
      const clientFailures = failures.filter(f => f.clientId === client.id);
      const project = projects.find(p => p.clienteId === client.id);

      // 1. Determinar Estado Operativo del NOC
      let opStatus = 'OFFLINE';
      if (metric && metric.online) {
        const activeErrors = clientFailures.filter(f => !f.resolved).length;
        const hasCriticalAlert = clientAlerts.some(a => a.active && a.severity === 'critical');
        
        if (activeErrors > 5 || hasCriticalAlert) {
          opStatus = 'CRITICAL';
        } else if (metric.latency > 120 || activeErrors > 0) {
          opStatus = 'WARNING';
        } else {
          opStatus = 'ONLINE';
        }
      }

      // 2. Calcular Salud de Portafolio
      const health = calculateClientHealth(client, failures, reports, followups);

      return {
        ...client,
        metric,
        opStatus,
        health,
        projectStage: project?.status || 'N/A'
      };
    });
  }, [clientesSaas, metrics, alerts, failures, reports, followups, projects]);

  return (
    <div className="space-y-6 tab-content-enter select-none text-left">
      
      {/* ===== GRID DE LA FLOTA ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {fleet.map(client => {
          const cpu = client.metric?.cpu || 0;
          const mem = client.metric?.memory || 0;
          const lat = client.metric?.latency || 0;

          return (
            <div 
              key={client.id}
              className={`p-5 rounded-2xl border bg-[var(--color-surface)] shadow-md hover:border-indigo-500/30 transition-all duration-200 flex flex-col justify-between h-[300px] relative overflow-hidden group border-[var(--color-border)]`}
            >
              {/* Fondo decorativo premium con glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-300" />
              
              <div className="space-y-4">
                {/* Header: Cliente y Badge de Estado */}
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                      🏢 {client.nombre}
                    </h4>
                    <span className="text-[9px] text-slate-500 font-mono font-medium block">ID: {client.id}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wider ${STATUS_CHIPS[client.opStatus]}`}>
                    ● {client.opStatus}
                  </span>
                </div>

                {/* Info técnica y de salud */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-950/40 border border-slate-900/60 rounded-xl">
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Salud Comercial</span>
                    <span className={`text-[10px] font-black block mt-0.5 ${
                      client.health.color === 'emerald' ? 'text-emerald-400' :
                      client.health.color === 'blue' ? 'text-blue-400' :
                      client.health.color === 'amber' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {client.health.score}% ({client.health.color.toUpperCase()})
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Versión Core</span>
                    <span className="text-[10px] font-bold text-slate-350 block mt-0.5">
                      ⚙️ v{client.tecnico?.versionCore || '1.0.0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Proyecto Asociado</span>
                    <span className="text-[10px] font-bold text-slate-350 block mt-0.5 uppercase tracking-wide">
                      📋 {client.projectStage === 'planning' ? 'Planeación' :
                          client.projectStage === 'development' ? 'Desarrollo' :
                          client.projectStage === 'testing' ? 'Pruebas' :
                          client.projectStage === 'validation' ? 'Validación' :
                          client.projectStage === 'production' ? 'Producción' : 'Ninguno'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Último Ping</span>
                    <span className="text-[10px] font-mono font-bold text-slate-405 text-slate-400 block mt-0.5">
                      {client.metric ? new Date(client.metric.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Métricas de Hardware (NOC) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                    <span className="flex items-center gap-1"><Cpu size={10} /> CPU: {cpu}%</span>
                    <span className="flex items-center gap-1"><Server size={10} /> MEM: {mem}MB</span>
                    <span className="flex items-center gap-1"><Activity size={10} /> LAT: {lat}ms</span>
                  </div>
                  {/* Progress bars */}
                  <div className="grid grid-cols-2 gap-2 h-1 bg-slate-950 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${cpu}%` }} />
                    <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${(mem / 120) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="border-t border-[var(--color-border)]/40 pt-3 flex items-center justify-between mt-auto">
                <a 
                  href={client.tecnico?.urlHosting || '#'} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] text-indigo-400 font-bold flex items-center gap-1 hover:text-indigo-300"
                >
                  Visitar Instancia <ExternalLink size={10} />
                </a>
                <span className="text-[9px] font-mono text-slate-500">
                  Shard: {client.tecnico?.projectId || 'N/A'}
                </span>
              </div>
            </div>
          );
        })}
        {fleet.length === 0 && (
          <div className="col-span-full p-16 text-center text-slate-500 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
            No se encontraron clientes activos registrados en la flota.
          </div>
        )}
      </div>

    </div>
  );
}
