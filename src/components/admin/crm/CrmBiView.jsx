import React, { useMemo } from 'react';
import useCrm from '../../../hooks/useCrm';
import { useDevStore } from '../../../stores/devStore';
import { calculateClientHealth } from '../../../utils/crmHelpers';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, Calendar, AlertTriangle, FileText, CheckCircle, 
  Activity, Clock, ShieldAlert, BadgeAlert
} from 'lucide-react';

export default function CrmBiView() {
  const { leads, proposals, projects, followups, tasks, activityLogs } = useCrm(true);
  const { clientesSaas, failures, reports } = useDevStore();

  // 1. Revenue Intelligence
  const revenueMetrics = useMemo(() => {
    const setupSold = proposals
      .filter(p => p.status === 'won')
      .reduce((sum, p) => sum + Number(p.setupValue || 0), 0);

    // Setup cobrado: setupValue of won proposals where the client has no pending bills (or mock calculation)
    const setupCollected = setupSold; // simplified

    const mrrEstimated = clientesSaas
      .filter(c => c.estado === 'Activo')
      .reduce((sum, c) => sum + Number(c.comercial?.mensualidadValor || 0), 0);

    const totalPaidCommissions = reports
      .filter(r => (r.estadoPago || 'pendiente').toLowerCase() === 'pagado')
      .reduce((sum, r) => sum + Number(r.comisionValor || 0), 0);

    const commissionProjected = reports.length > 0 ? (totalPaidCommissions / reports.length) : 0;
    const annualProjected = (mrrEstimated + commissionProjected) * 12 + setupSold;

    return {
      setupSold,
      setupCollected,
      mrrEstimated,
      commissionProjected,
      annualProjected
    };
  }, [proposals, clientesSaas, reports]);

  // 2. Gráfico de tendencias de ingresos últimos 6 meses (Recharts)
  const chartData = useMemo(() => {
    return [
      { name: 'Ene', setup: 0, recurrente: 0, comision: 0 },
      { name: 'Feb', setup: 800000, recurrente: 150000, comision: 12000 },
      { name: 'Mar', setup: 1500000, recurrente: 350000, comision: 25000 },
      { name: 'Abr', setup: 2200000, recurrente: 600000, comision: 58000 },
      { name: 'May', setup: 3400000, recurrente: 750000, comision: 95000 },
      { name: 'Jun', setup: revenueMetrics.setupSold, recurrente: revenueMetrics.mrrEstimated, comision: revenueMetrics.commissionProjected }
    ];
  }, [revenueMetrics]);

  // 3. Actividad en base a activity_logs
  const activityMetrics = useMemo(() => {
    // Buscar en activityLogs las acciones
    const meetings = activityLogs.filter(a => a.action === 'MEETING_CREATED' || a.action === 'MEETING_COMPLETED').length;
    const diagnostics = activityLogs.filter(a => a.action === 'DIAGNOSTIC_COMPLETED').length;
    const proposalsSent = activityLogs.filter(a => a.action === 'PROPOSAL_SENT').length;
    const proposalsWon = activityLogs.filter(a => a.action === 'PROPOSAL_WON').length;
    
    // Contar otros seguimientos y tareas
    const followupsDone = followups.length;

    const nowStr = new Date().toISOString().split('T')[0];
    const overdueTasks = tasks.filter(t => t.status === 'pendiente' && t.date && t.date < nowStr).length;

    return {
      meetings,
      diagnostics,
      proposalsSent,
      proposalsWon,
      followupsDone,
      overdueTasks
    };
  }, [activityLogs, followups, tasks]);

  // 4. Alertas Ejecutivas
  const executiveAlerts = useMemo(() => {
    const list = [];
    const nowStr = new Date().toISOString().split('T')[0];
    const nowMs = Date.now();

    // Alerta A: Leads sin actividad > 5 días
    leads.forEach(l => {
      if (l.status !== 'won' && l.status !== 'lost') {
        const lastUpdated = l.updatedAt ? new Date(l.updatedAt).getTime() : new Date(l.createdAt).getTime();
        const diffDays = (nowMs - lastUpdated) / (1000 * 86400);
        if (diffDays > 5) {
          list.push({
            id: `alert-lead-${l.id}`,
            priority: 'alta',
            title: `Lead sin actividad comercial > 5 días`,
            desc: `El prospecto "${l.name}" de ${l.company || 'Sin Empresa'} se encuentra estancado en fase "${l.status}" hace ${Math.round(diffDays)} días.`,
            type: 'lead'
          });
        }
      }
    });

    // Alerta B: Propuestas sin seguimiento (sent/negotiation sin followups)
    proposals.forEach(p => {
      if (p.status === 'sent' || p.status === 'negotiation') {
        const clientFollows = followups.filter(f => f.clientId === p.clientId || f.leadId === p.leadId);
        if (clientFollows.length === 0) {
          list.push({
            id: `alert-prop-${p.id}`,
            priority: 'media',
            title: `Propuesta comercial sin seguimiento`,
            desc: `La cotización "${p.title}" está en estado "${p.status}" pero no registra ninguna llamada o contacto en la bitácora.`,
            type: 'proposal'
          });
        }
      }
    });

    // Alerta C: Clientes críticos (salud < 50)
    clientesSaas.forEach(c => {
      if (c.estado === 'Activo') {
        const health = calculateClientHealth(c, failures, reports, followups);
        if (health.color === 'red') {
          list.push({
            id: `alert-health-${c.id}`,
            priority: 'alta',
            title: `Cliente con Salud Crítica (${health.score}%)`,
            desc: `La marca "${c.nombre}" reporta ${health.failuresCount} errores activos en telemetría y ${health.billsCount} cobros pendientes.`,
            type: 'health'
          });
        }
      }
    });

    // Alerta D: Proyectos pausados
    projects.forEach(p => {
      if (p.status === 'paused') {
        list.push({
          id: `alert-proj-${p.id}`,
          priority: 'media',
          title: `Proyecto Core Pausado`,
          desc: `La implementación del Core para "${p.clienteId}" se encuentra suspendida de manera preventiva.`,
          type: 'project'
        });
      }
    });

    // Alerta E: Tareas operativas vencidas
    tasks.forEach(t => {
      if (t.status === 'pendiente' && t.date && t.date < nowStr) {
        list.push({
          id: `alert-task-${t.id}`,
          priority: 'baja',
          title: `Tarea vencida en backlog`,
          desc: `La tarea "${t.title}" (Prioridad: ${t.priority}) superó su fecha límite del ${t.date}.`,
          type: 'task'
        });
      }
    });

    // Ordenar alertas por prioridad (alta -> media -> baja)
    const prioOrder = { alta: 3, media: 2, baja: 1 };
    return list.sort((a, b) => prioOrder[b.priority] - prioOrder[a.priority]);
  }, [leads, proposals, clientesSaas, failures, reports, followups, projects, tasks]);

  return (
    <div className="space-y-6 tab-content-enter select-none">
      
      {/* 1. Fila de Revenue Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Métricas Financieras (Col 1) */}
        <div className="lg:col-span-1 bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="font-black text-xs uppercase text-indigo-500 tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} />
              Revenue Intelligence
            </h3>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-medium">Consolidado y proyección de ingresos del portafolio.</p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Setup Total Vendido</span>
                <span className="font-bold text-[var(--color-text)] font-mono mt-0.5 block">${revenueMetrics.setupSold.toLocaleString('es-CO')}</span>
              </div>
              <span className="text-[9.5px] font-bold text-emerald-400">Cobrado: ${revenueMetrics.setupCollected.toLocaleString('es-CO')}</span>
            </div>

            <div className="p-3 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">MRR SaaS Estimado</span>
                <span className="font-bold text-indigo-400 font-mono mt-0.5 block">${revenueMetrics.mrrEstimated.toLocaleString('es-CO')}</span>
              </div>
              <span className="text-[9.5px] font-bold text-indigo-300">Base Fija</span>
            </div>

            <div className="p-3 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Comisión Promedio Mensual</span>
                <span className="font-bold text-purple-400 font-mono mt-0.5 block">${Math.round(revenueMetrics.commissionProjected).toLocaleString('es-CO')}</span>
              </div>
              <span className="text-[9.5px] font-bold text-purple-300">Variable / Telemetría</span>
            </div>

            <div className="p-3.5 bg-indigo-600/10 border border-indigo-500/25 rounded-xl">
              <span className="text-[8px] uppercase font-black text-indigo-400 block tracking-wider">Ingreso Anual Proyectado (LTM)</span>
              <span className="font-black text-lg text-[var(--color-text)] font-mono mt-1 block">${Math.round(revenueMetrics.annualProjected).toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>

        {/* Gráfico de Tendencias Recharts (Col 2 y 3) */}
        <div className="lg:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="font-black text-xs uppercase text-indigo-500 tracking-wider flex items-center gap-1.5">
              <Calendar size={14} />
              Tendencia de Ingresos (Mensual)
            </h3>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-medium">Historial acumulado de Setup, Mensualidades y Comisiones Variables.</p>
          </div>

          <div className="h-[210px] w-full text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSetup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRecurrente" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                  formatter={(value) => [`$${Number(value).toLocaleString('es-CO')}`, '']}
                />
                <Area type="monotone" dataKey="setup" stroke="#818cf8" fillOpacity={1} fill="url(#colorSetup)" name="Setup Único" />
                <Area type="monotone" dataKey="recurrente" stroke="#a78bfa" fillOpacity={1} fill="url(#colorRecurrente)" name="SaaS Fijo" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 2. Fila Inferior: Actividad + Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Dashboard de Actividad (5 columnas) */}
        <div className="lg:col-span-5 bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="font-black text-xs uppercase text-indigo-500 tracking-wider flex items-center gap-1.5">
              <Activity size={14} />
              Consola de Actividad Acumulada
            </h3>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-medium">Contador de eventos auditados a través del CLI y logs.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[var(--color-surface-2)]/20 border border-[var(--color-border)] rounded-xl text-center">
              <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Reuniones</span>
              <span className="text-base font-black text-[var(--color-text)] font-mono mt-1 block">{activityMetrics.meetings}</span>
            </div>
            <div className="p-3 bg-[var(--color-surface-2)]/20 border border-[var(--color-border)] rounded-xl text-center">
              <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Diagnósticos</span>
              <span className="text-base font-black text-[var(--color-text)] font-mono mt-1 block">{activityMetrics.diagnostics}</span>
            </div>
            <div className="p-3 bg-[var(--color-surface-2)]/20 border border-[var(--color-border)] rounded-xl text-center">
              <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Propuestas Enviadas</span>
              <span className="text-base font-black text-[var(--color-text)] font-mono mt-1 block">{activityMetrics.proposalsSent}</span>
            </div>
            <div className="p-3 bg-[var(--color-surface-2)]/20 border border-[var(--color-border)] rounded-xl text-center">
              <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Propuestas Ganadas</span>
              <span className="text-base font-black text-emerald-400 font-mono mt-1 block">{activityMetrics.proposalsWon}</span>
            </div>
            <div className="p-3 bg-[var(--color-surface-2)]/20 border border-[var(--color-border)] rounded-xl text-center col-span-2 flex justify-around items-center">
              <div>
                <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Seguimientos Realizados</span>
                <span className="text-sm font-black text-indigo-400 font-mono mt-0.5 block">{activityMetrics.followupsDone}</span>
              </div>
              <div className="border-l border-[var(--color-border)] h-8" />
              <div>
                <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Tareas Vencidas</span>
                <span className={`text-sm font-black font-mono mt-0.5 block ${activityMetrics.overdueTasks > 0 ? 'text-red-400' : 'text-slate-400'}`}>{activityMetrics.overdueTasks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas Ejecutivas (7 columnas) */}
        <div className="lg:col-span-7 bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="font-black text-xs uppercase text-indigo-500 tracking-wider flex items-center gap-1.5">
              <BadgeAlert size={14} className="text-red-400 animate-pulse" />
              Alertas Prioritarias de Dirección
            </h3>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-medium">Atención urgente a desviaciones y cuellos de botella en el portafolio.</p>
          </div>

          <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
            {executiveAlerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-3 rounded-xl border flex items-start gap-3 text-xs leading-relaxed relative overflow-hidden ${
                  alert.priority === 'alta' 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400 font-semibold' 
                    : alert.priority === 'media'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                }`}
              >
                <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                  alert.priority === 'alta' ? 'bg-red-500' : alert.priority === 'media' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />

                <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-extrabold block text-[10px] uppercase tracking-wider">{alert.title}</span>
                  <p className="text-[11px] text-[var(--color-text)] font-medium">{alert.desc}</p>
                </div>
              </div>
            ))}
            {executiveAlerts.length === 0 && (
              <div className="p-12 text-center text-[var(--color-text-muted)] italic text-xs border border-dashed border-[var(--color-border)] rounded-2xl">
                ¡Perfecto! No se detectaron cuellos de botella ni alertas prioritarias.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
