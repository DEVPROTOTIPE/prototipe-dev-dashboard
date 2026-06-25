import React, { useState, useEffect } from 'react';
import { useNocStore } from '../../stores/nocStore';
import NocDashboardView from '../../components/admin/noc/NocDashboardView';
import ClientFleetView from '../../components/admin/noc/ClientFleetView';
import AlertCenterView from '../../components/admin/noc/AlertCenterView';
import VersionControlView from '../../components/admin/noc/VersionControlView';
import { Activity, ShieldAlert, Cpu, RefreshCw, LayoutDashboard, Database, GitCommit } from 'lucide-react';

export default function NocPage() {
  const { subscribeNoc, unsubscribeNoc, isLoading, alerts } = useNocStore();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'fleet' | 'alerts' | 'versions'

  // Sincronizar listeners y simulación de telemetría al montar/desmontar
  useEffect(() => {
    subscribeNoc();
    return () => unsubscribeNoc();
  }, [subscribeNoc, unsubscribeNoc]);

  const activeAlertsCount = alerts.filter(a => a.active).length;

  return (
    <div className="space-y-6 tab-content-enter select-none">
      
      {/* ===== HEADER GENERAL ===== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)] text-left">
        <div>
          <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
            <Activity size={20} className="text-indigo-400 animate-pulse" />
            Centro de Operaciones (NOC)
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium">
            Supervisión en tiempo real de disponibilidad, incidentes, telemetría de recursos y releases de core.
          </p>
        </div>
      </div>

      {/* ===== SUB-NAVEGACION GENERAL ===== */}
      <div className="flex border-b border-[var(--color-border)] gap-6 text-xs font-bold shrink-0 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5 text-left">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
            activeTab === 'dashboard' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <span className="flex items-center gap-1.5"><LayoutDashboard size={13} /> Dashboard NOC</span>
        </button>
        <button 
          onClick={() => setActiveTab('fleet')}
          className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
            activeTab === 'fleet' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <span className="flex items-center gap-1.5"><Database size={13} /> Flota de Clientes</span>
        </button>
        <button 
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
            activeTab === 'alerts' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <span className="flex items-center gap-1.5 relative">
            <ShieldAlert size={13} /> Centro de Alertas
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1.5 -right-5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] font-black font-sans">
                {activeAlertsCount}
              </span>
            )}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('versions')}
          className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
            activeTab === 'versions' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <span className="flex items-center gap-1.5"><GitCommit size={13} /> Control de Versiones</span>
        </button>
      </div>

      {/* ===== CONTENIDO OPERATIVO ===== */}
      <div className="tab-content-enter">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 text-xs space-y-3 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
            <RefreshCw size={22} className="mx-auto animate-spin text-indigo-400" />
            <p className="font-semibold uppercase tracking-wider text-[10px]">Cargando telemetría del NOC...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <NocDashboardView />}
            {activeTab === 'fleet' && <ClientFleetView />}
            {activeTab === 'alerts' && <AlertCenterView />}
            {activeTab === 'versions' && <VersionControlView />}
          </>
        )}
      </div>

    </div>
  );
}
