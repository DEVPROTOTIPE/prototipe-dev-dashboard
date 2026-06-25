import React, { useMemo } from 'react';
import { useDevStore } from '../../../stores/devStore';
import { useNocStore } from '../../../stores/nocStore';
import { 
  Activity, Cpu, Database, AlertCircle, Clock, Zap, CheckCircle, XCircle 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function NocDashboardView() {
  const { clientesSaas, failures } = useDevStore();
  const { metrics, heartbeats, alerts } = useNocStore();

  // 1. Calcular KPIs del NOC
  const stats = useMemo(() => {
    const totalClients = clientesSaas.length;
    
    // Contar online/offline basados en métricas en tiempo real
    const online = metrics.filter(m => m.online).length;
    const offline = totalClients - online;
    
    const activeErrors = failures.filter(f => !f.resolved).length;
    const activeAlerts = alerts.filter(a => a.active).length;

    // Latencia promedio de clientes online
    const onlineMetrics = metrics.filter(m => m.online);
    const avgLatency = onlineMetrics.length > 0
      ? Math.round(onlineMetrics.reduce((sum, m) => sum + m.latency, 0) / onlineMetrics.length)
      : 0;

    // Uso de CPU promedio y Memoria total
    const avgCpu = onlineMetrics.length > 0
      ? Math.round(onlineMetrics.reduce((sum, m) => sum + m.cpu, 0) / onlineMetrics.length)
      : 0;
    const totalMem = onlineMetrics.reduce((sum, m) => sum + m.memory, 0);

    // Obtener la fecha del último heartbeat
    let lastHeartbeatTime = 'N/A';
    if (heartbeats.length > 0) {
      const dates = heartbeats.map(h => new Date(h.timestamp));
      const maxDate = new Date(Math.max(...dates));
      lastHeartbeatTime = maxDate.toLocaleTimeString();
    }

    return {
      totalClients,
      online,
      offline,
      activeErrors,
      activeAlerts,
      avgLatency,
      avgCpu,
      totalMem,
      lastHeartbeatTime
    };
  }, [clientesSaas, failures, metrics, heartbeats, alerts]);

  // Datos del histórico de latencia (simulación reactiva para el gráfico)
  const chartData = useMemo(() => {
    return heartbeats.slice(0, 10).reverse().map((hb, idx) => ({
      time: new Date(hb.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      latency: hb.latency,
      cpu: metrics[idx % metrics.length]?.cpu || 15
    }));
  }, [heartbeats, metrics]);

  return (
    <div className="space-y-6 tab-content-enter select-none text-left">
      
      {/* ===== FILA DE METRICAS PRINCIPALES ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* KPI 1: Estado Flota */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm hover:border-violet-500/20 transition-all">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block tracking-widest">Estado de Flota</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-emerald-450 text-emerald-400 font-mono">{stats.online}</span>
              <span className="text-[10px] text-slate-500">/ {stats.totalClients} online</span>
            </div>
            <span className="text-[8.5px] text-[var(--color-text-muted)] block font-medium">Clientes Offline: {stats.offline}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Zap size={16} className={stats.online > 0 ? "animate-pulse" : ""} />
          </div>
        </div>

        {/* KPI 2: Latencia Promedio */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm hover:border-violet-500/20 transition-all">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block tracking-widest">Latencia de Red</span>
            <span className="text-xl font-black text-cyan-400 font-mono">{stats.avgLatency} ms</span>
            <span className="text-[8.5px] text-[var(--color-text-muted)] block font-medium">Último Heartbeat: {stats.lastHeartbeatTime}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Clock size={16} />
          </div>
        </div>

        {/* KPI 3: Uso de Recursos Pool */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm hover:border-violet-500/20 transition-all">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block tracking-widest">Recursos Pool</span>
            <span className="text-xl font-black text-purple-400 font-mono">{stats.avgCpu}% CPU</span>
            <span className="text-[8.5px] text-[var(--color-text-muted)] block font-medium">Memoria Total: {stats.totalMem} MB</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <Cpu size={16} />
          </div>
        </div>

        {/* KPI 4: Incidentes y Alertas */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm hover:border-violet-500/20 transition-all">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block tracking-widest">Incidentes Activos</span>
            <span className={`text-xl font-black font-mono ${stats.activeAlerts > 0 ? 'text-red-400' : 'text-slate-400'}`}>{stats.activeAlerts} Alertas</span>
            <span className="text-[8.5px] text-[var(--color-text-muted)] block font-medium">Errores activos de telemetría: {stats.activeErrors}</span>
          </div>
          <div className={`p-2.5 rounded-xl border shrink-0 ${stats.activeAlerts > 0 ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-bounce' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
            <AlertCircle size={16} />
          </div>
        </div>

      </div>

      {/* ===== SECCION CENTRAL GRÁFICO Y LIVE PINGS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Latencia Gráfico (7 columnas) */}
        <div className="lg:col-span-8 bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="font-black text-xs uppercase text-indigo-500 tracking-wider flex items-center gap-1.5">
              <Activity size={14} />
              Telemetría de Red y Carga de Trabajo (POOL)
            </h3>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-medium">Monitoreo histórico reciente de latencia (ms) y uso de CPU simulado en Sandbox.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="cpuGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="latency" name="Latencia (ms)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#latencyGlow)" />
                <Area type="monotone" dataKey="cpu" name="CPU (%)" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#cpuGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Heartbeat Stream (5 columnas) */}
        <div className="lg:col-span-4 bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-black text-xs uppercase text-indigo-500 tracking-wider flex items-center gap-1.5">
                <Database size={14} />
                Heartbeat Stream (Tiempo Real)
              </h3>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-medium">Logs de disponibilidad recibidos de las instancias de clientes activos.</p>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
              {heartbeats.map((hb, idx) => (
                <div 
                  key={hb.id || idx} 
                  className="p-2.5 bg-slate-950/60 border border-slate-900 rounded-xl text-[10px] flex items-center justify-between font-mono"
                >
                  <div className="flex items-center gap-2">
                    {hb.online ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    )}
                    <span className="font-bold text-slate-300 uppercase">{hb.clientId}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400 font-bold">{hb.latency}ms</span>
                    <span className="text-slate-600">[{new Date(hb.timestamp).toLocaleTimeString()}]</span>
                  </div>
                </div>
              ))}
              {heartbeats.length === 0 && (
                <div className="p-8 text-center text-slate-600 italic">
                  Esperando pings de telemetría...
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
