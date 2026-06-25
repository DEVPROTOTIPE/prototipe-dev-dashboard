import React from 'react';
import useCrm from '../../../hooks/useCrm';
import { LayoutDashboard, Users, Calendar, ClipboardList, TrendingUp, AlertCircle } from 'lucide-react';

export default function CrmDashboardView() {
  const { leads, meetings, diagnostics, proposals, getKpis } = useCrm(true);
  const kpis = getKpis();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md">
        <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <LayoutDashboard size={16} className="text-indigo-400" />
          Dashboard CRM (Fase de Validación)
        </h2>
        <p className="text-[10px] text-slate-450 mt-1 leading-relaxed">
          Esta es una vista de diagnóstico temporal conectada directamente a <code className="font-mono text-indigo-300">useCrm()</code>. 
          Verifica que la persistencia en Firestore (o Sandbox local) y los contadores en tiempo real estén sincronizados antes del desarrollo de gráficos avanzados.
        </p>
      </div>

      {/* Grid de KPIs Básicos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Leads */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-450 uppercase tracking-wider">
            <span>Leads Totales</span>
            <Users size={14} className="text-blue-400" />
          </div>
          <div>
            <span className="text-xl font-black font-mono text-slate-100">{kpis.totalLeads}</span>
            <span className="block text-[9px] text-slate-500 font-medium">En base de datos</span>
          </div>
        </div>

        {/* KPI: Reuniones */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-450 uppercase tracking-wider">
            <span>Reuniones Pendientes</span>
            <Calendar size={14} className="text-violet-400" />
          </div>
          <div>
            <span className="text-xl font-black font-mono text-slate-100">{kpis.pendingMeetings}</span>
            <span className="block text-[9px] text-slate-500 font-medium">Programadas activas</span>
          </div>
        </div>

        {/* KPI: Diagnósticos */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-450 uppercase tracking-wider">
            <span>Briefings Completados</span>
            <ClipboardList size={14} className="text-emerald-400" />
          </div>
          <div>
            <span className="text-xl font-black font-mono text-slate-100">{diagnostics.length}</span>
            <span className="block text-[9px] text-slate-500 font-medium">Diagnósticos guardados</span>
          </div>
        </div>

        {/* KPI: Conversión */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-450 uppercase tracking-wider">
            <span>Tasa de Conversión</span>
            <TrendingUp size={14} className="text-indigo-400" />
          </div>
          <div>
            <span className="text-xl font-black font-mono text-slate-100">{kpis.conversionRate}%</span>
            <span className="block text-[9px] text-slate-500 font-medium">Leads a ganados</span>
          </div>
        </div>
      </div>

      {/* Detalle de Carga de Datos */}
      <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-300">Resumen Lógico de Conectividad</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-slate-400">
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
            <span className="text-[10px] uppercase font-black text-indigo-400 block mb-1">Leads (Último Registro)</span>
            {leads.length > 0 ? (
              <div className="space-y-1 text-[10px]">
                <p className="font-bold text-slate-200">{leads[0].name}</p>
                <p className="text-slate-500">{leads[0].company || 'Sin Empresa'}</p>
                <p className="text-[9px] bg-indigo-950/20 text-indigo-400 border border-indigo-500/10 px-1.5 py-0.5 rounded w-max mt-1">{leads[0].status}</p>
              </div>
            ) : (
              <span className="text-slate-500 text-[10px]">Ninguno</span>
            )}
          </div>
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
            <span className="text-[10px] uppercase font-black text-violet-400 block mb-1">Reunión Más Reciente</span>
            {meetings.length > 0 ? (
              <div className="space-y-1 text-[10px]">
                <p className="font-bold text-slate-200">Fecha: {new Date(meetings[0].date?.seconds * 1000 || meetings[0].date).toLocaleString('es-CO')}</p>
                <p className="text-slate-500">Tipo: {meetings[0].type}</p>
                <p className="text-[9px] bg-violet-950/20 text-violet-400 border border-violet-500/10 px-1.5 py-0.5 rounded w-max mt-1">{meetings[0].status}</p>
              </div>
            ) : (
              <span className="text-slate-500 text-[10px]">Ninguna</span>
            )}
          </div>
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
            <span className="text-[10px] uppercase font-black text-emerald-400 block mb-1">Último Briefing Realizado</span>
            {diagnostics.length > 0 ? (
              <div className="space-y-1 text-[10px]">
                <p className="font-bold text-slate-200">ID Lead: {diagnostics[0].leadId?.substring(0, 8)}...</p>
                <p className="text-slate-500">Complejidad: {diagnostics[0].complexityLevel || 'N/A'}</p>
                <p className="text-[9px] bg-emerald-950/20 text-emerald-400 border border-emerald-500/10 px-1.5 py-0.5 rounded w-max mt-1">Completo</p>
              </div>
            ) : (
              <span className="text-slate-500 text-[10px]">Ninguno</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
