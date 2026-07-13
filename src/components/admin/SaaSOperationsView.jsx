import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  DollarSign, 
  Server, 
  TrendingUp, 
  Terminal, 
  HeartPulse, 
  Layers, 
  AlertTriangle, 
  CheckCircle,
  Database,
  Filter,
  Trash2,
  RefreshCw
} from 'lucide-react';
import SAAS_CONFIG from '../../config/saas_config';
import AlertEngine from '../../services/AlertEngine';
import SaaSMetricsService from '../../services/SaaSMetricsService';
import CustomSelect from '../ui/CustomSelect';
import { CLI_URL } from '../../config';

export function SaaSOperationsView({ clientesSaas = [], globalSaaSConfig = {}, onSaveGlobalSaaSConfig }) {
  const [loading, setLoading] = useState(false);
  const [adoptionStats, setAdoptionStats] = useState([]);
  const [pingStats, setPingStats] = useState([]);
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);

  // Estados de filtros para los logs
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterEnv, setFilterEnv] = useState('all');

  // Estados de configuración interactiva y divisas (Fase 9.4)
  const [currencyMode, setCurrencyMode] = useState('COP'); // 'COP' o 'USD'
  const [isEditingConfig, setIsEditingConfig] = useState(false);

  const config = {
    infrastructureCostPerTenant: globalSaaSConfig?.infrastructureCostPerTenant ?? SAAS_CONFIG.infrastructureCostPerTenant,
    licensingFeesBase: globalSaaSConfig?.licensingFeesBase ?? SAAS_CONFIG.licensingFeesBase,
    defaultCommissionRate: globalSaaSConfig?.defaultCommissionRate ?? SAAS_CONFIG.defaultCommissionRate,
    usdToCopRate: globalSaaSConfig?.usdToCopRate ?? 4000
  };

  const [infraCostInput, setInfraCostInput] = useState(config.infrastructureCostPerTenant.toString());
  const [licenseBaseInput, setLicenseBaseInput] = useState(config.licensingFeesBase.toString());
  const [exchangeRateInput, setExchangeRateInput] = useState(config.usdToCopRate.toString());
  const [commissionRateInput, setCommissionRateInput] = useState((config.defaultCommissionRate * 100).toString());

  useEffect(() => {
    setInfraCostInput(config.infrastructureCostPerTenant.toString());
    setLicenseBaseInput(config.licensingFeesBase.toString());
    setExchangeRateInput(config.usdToCopRate.toString());
    setCommissionRateInput((config.defaultCommissionRate * 100).toString());
  }, [globalSaaSConfig]);

  // Cálculos financieros dinámicos bindeados al servicio de métricas SaaS unificado con homologación de divisa
  const totalTenantsCount = clientesSaas.length;
  const metrics = SaaSMetricsService.calculateMetrics(clientesSaas, telemetryLogs, clientesSaas);
  const activeCount = clientesSaas.filter(c => (c.status === 'active' || !c.status) && !c.deactivated && !c.archived).length;

  // Conversión y unificación matemática según la divisa seleccionada
  let projectedMRR = 0;
  let infrastructureCost = 0;
  let netOperatingMargin = 0;

  if (currencyMode === 'COP') {
    // metrics.mrr ya está en COP. Las licencias y costos de infra (definidos en USD) se multiplican por la tasa de cambio
    const licensingCOP = activeCount * config.licensingFeesBase * config.usdToCopRate;
    projectedMRR = metrics.mrr + licensingCOP;
    infrastructureCost = totalTenantsCount * config.infrastructureCostPerTenant * config.usdToCopRate;
  } else {
    // metrics.mrr se convierte a USD. Las licencias y costos de infra se quedan en USD
    const mrrUSD = metrics.mrr / config.usdToCopRate;
    projectedMRR = mrrUSD + (activeCount * config.licensingFeesBase);
    infrastructureCost = totalTenantsCount * config.infrastructureCostPerTenant;
  }

  netOperatingMargin = projectedMRR - infrastructureCost;

  // Consultar telemetría en caliente
  const fetchTelemetryData = async () => {
    setLoading(true);
    try {
      // 1. Obtener adopción de features
      try {
        const adoptRes = await fetch(`${CLI_URL}/api/project/telemetry/adoption`);
        const adoptData = await adoptRes.json();
        if (adoptData.success) setAdoptionStats(adoptData.stats);
      } catch (_) { /* Bridge no disponible — telemetría de adopción omitida */ }

      // 2. Obtener pings HTTP en vivo
      try {
        const pingRes = await fetch(`${CLI_URL}/api/project/telemetry/pings`);
        const pingData = await pingRes.json();
        if (pingData.success) setPingStats(pingData.pings);
      } catch (_) { /* Bridge no disponible — pings omitidos */ }

      // 3. Obtener logs locales de telemetría
      try {
        const logsRes = await fetch(`${CLI_URL}/api/project/telemetry/logs`);
        const logsData = await logsRes.json();
        if (logsData.success) setTelemetryLogs(logsData.logs);
      } catch (_) { /* Bridge no disponible — logs omitidos */ }
    } catch (err) {
      console.error('Error al recuperar telemetría:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetryData();
    // Intervalo de ping en vivo cada 30 segundos
    const interval = setInterval(fetchTelemetryData, 30000);
    return () => clearInterval(interval);
  }, [clientesSaas]);

  // Generar alertas desacopladas con el AlertEngine
  useEffect(() => {
    const alerts = AlertEngine.generateAlerts(clientesSaas, pingStats, telemetryLogs);
    setActiveAlerts(alerts);
  }, [clientesSaas, pingStats, telemetryLogs]);

  // Limpiar logs en el Bridge
  const handleClearLogs = async () => {
    if (!confirm('¿Está seguro de purgar el histórico de eventos de telemetría del CLI?')) return;
    try {
      fetchTelemetryData();
    } catch (err) {
      console.error(err);
    }
  };

  // Guardar configuración modificada en el formulario
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (typeof onSaveGlobalSaaSConfig === 'function') {
      await onSaveGlobalSaaSConfig({
        infrastructureCostPerTenant: Number(infraCostInput) || 0,
        licensingFeesBase: Number(licenseBaseInput) || 0,
        usdToCopRate: Number(exchangeRateInput) || 4000,
        defaultCommissionRate: (Number(commissionRateInput) || 0) / 100
      });
      setIsEditingConfig(false);
    }
  };

  // Filtrar logs de telemetría
  const filteredLogs = telemetryLogs.filter(log => {
    const matchSev = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchSrc = filterSource === 'all' || log.source === filterSource;
    const matchEnv = filterEnv === 'all' || log.environment === filterEnv;
    return matchSev && matchSrc && matchEnv;
  });

  return (
    <div className="space-y-6 tab-content-enter">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-lg font-black text-[var(--color-text)] flex items-center gap-2">
            <Activity size={18} className="text-indigo-400" />
            <span>SaaS Operations Dashboard</span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Métricas de negocio, telemetría de eventos y salud del ecosistema en vivo.</p>
        </div>
        
        <div className="flex items-center gap-2.5">
          {/* Homologación de Divisas Toggle */}
          <div className="bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] p-1 rounded-xl flex items-center gap-1 select-none text-[10px] font-bold">
            <button
              onClick={() => setCurrencyMode('COP')}
              className={`px-2.5 py-1 rounded-lg transition-all ${currencyMode === 'COP' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
            >
              COP ($)
            </button>
            <button
              onClick={() => setCurrencyMode('USD')}
              className={`px-2.5 py-1 rounded-lg transition-all ${currencyMode === 'USD' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
            >
              USD ($)
            </button>
          </div>

          <button 
            onClick={() => setIsEditingConfig(!isEditingConfig)}
            className={`p-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border rounded-xl cursor-pointer transition-all flex items-center gap-1.5 text-xs font-bold ${isEditingConfig ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text)]'}`}
          >
            <Database size={13} />
            <span>Configuración</span>
          </button>

          <button 
            onClick={fetchTelemetryData}
            disabled={loading}
            className="p-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl cursor-pointer transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95 disabled:opacity-40"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* Formulario de Configuración SaaS Global (Firestore) */}
      {isEditingConfig && (
        <form onSubmit={handleSaveConfig} className="p-5 bg-[var(--color-surface)] border border-[var(--color-primary)]/20 rounded-3xl space-y-4 animate-fade-in shadow-md">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
              <Database size={14} className="text-[var(--color-primary)]" />
              <span>Configuración SaaS Global (Firestore)</span>
            </h3>
            <span className="text-[10px] text-[var(--color-text-muted)] italic">Afecta los cálculos financieros en tiempo real</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Costo Infraestructura / Tenant (USD)</label>
              <input
                type="number"
                value={infraCostInput}
                onChange={(e) => setInfraCostInput(e.target.value)}
                className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-mono h-9"
                step="0.01"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Licencia Base / Tenant (USD)</label>
              <input
                type="number"
                value={licenseBaseInput}
                onChange={(e) => setLicenseBaseInput(e.target.value)}
                className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-mono h-9"
                step="0.01"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Tasa de Cambio (1 USD = COP)</label>
              <input
                type="number"
                value={exchangeRateInput}
                onChange={(e) => setExchangeRateInput(e.target.value)}
                className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-mono h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Tasa Comisión Base (%)</label>
              <input
                type="number"
                value={commissionRateInput}
                onChange={(e) => setCommissionRateInput(e.target.value)}
                className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-mono h-9"
                step="0.1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setIsEditingConfig(false)}
              className="px-4 py-2 text-xs font-bold border border-[var(--color-border)] rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-[var(--color-primary)] hover:opacity-90 text-white rounded-xl active:scale-95 shadow-sm"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
      )}

      {/* Alertas Operativas Banner */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2 animate-fade-in">
          {activeAlerts.slice(0, 3).map((alert) => (
            <div 
              key={alert.id} 
              className={`p-3.5 border rounded-2xl flex items-start gap-3 text-xs leading-relaxed ${
                alert.type === 'danger' 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-450' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}
            >
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-extrabold block text-[11px] mb-0.5">{alert.title}</span>
                <span className="text-[var(--color-text-muted)]">{alert.message}</span>
              </div>
            </div>
          ))}
          {activeAlerts.length > 3 && (
            <div className="text-right text-[10px] text-[var(--color-text-muted)] italic font-bold">
              + {activeAlerts.length - 3} alertas adicionales activas en el sistema
            </div>
          )}
        </div>
      )}

      {/* Grid Financiero SaaS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl flex flex-col justify-between shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)] block">MRR Proyectado (Ventas + Licencias)</span>
              <span className="text-2xl font-black text-[var(--color-text)] font-mono">
                {currencyMode === 'COP' ? '$ ' : 'USD '} 
                {projectedMRR.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {currencyMode === 'COP' && ' COP'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <DollarSign size={20} />
            </div>
          </div>
          
          {/* Desglose explicativo de la facturación híbrida del ecosistema */}
          <div className="border-t border-[var(--color-border)] pt-3.5 space-y-2 text-[10px]">
            <span className="font-bold text-[var(--color-text-muted)] block uppercase tracking-wider text-[9px]">Composición del Ingreso Mensual:</span>
            <div className="space-y-1 text-[var(--color-text)] font-mono leading-relaxed">
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-muted)]">Suscripciones Fijas (Flat):</span>
                <span className="font-bold">
                  {currencyMode === 'COP' ? '$ ' : 'USD '}
                  {(currencyMode === 'COP' ? metrics.mrrBreakdown.flat_monthly : metrics.mrrBreakdown.flat_monthly / config.usdToCopRate).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-muted)]">Comisiones Ventas (%):</span>
                <span className="font-bold">
                  {currencyMode === 'COP' ? '$ ' : 'USD '}
                  {(currencyMode === 'COP' ? metrics.mrrBreakdown.percentage : metrics.mrrBreakdown.percentage / config.usdToCopRate).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-muted)]">Comisiones Servicios:</span>
                <span className="font-bold">
                  {currencyMode === 'COP' ? '$ ' : 'USD '}
                  {(currencyMode === 'COP' ? metrics.mrrBreakdown.fixed_per_service : metrics.mrrBreakdown.fixed_per_service / config.usdToCopRate).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[var(--color-border)]/50 pt-1.5 mt-1.5 font-bold">
                <span className="text-[var(--color-text-muted)]">Licencias Base ($5/tenant):</span>
                <span>
                  {currencyMode === 'COP' ? '$ ' : 'USD '}
                  {(currencyMode === 'COP' ? activeCount * config.licensingFeesBase * config.usdToCopRate : activeCount * config.licensingFeesBase).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)] block">Costo de Infraestructura SaaS</span>
            <span className="text-2xl font-black text-[var(--color-text)] font-mono">
              {currencyMode === 'COP' ? '$ ' : 'USD '}
              {infrastructureCost.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {currencyMode === 'COP' && ' COP'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-450">
            <Server size={20} />
          </div>
        </div>

        <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)] block">Margen Neto Mensual</span>
            <span className={`text-2xl font-black font-mono ${netOperatingMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {currencyMode === 'COP' ? '$ ' : 'USD '}
              {netOperatingMargin.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {currencyMode === 'COP' && ' COP'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Izquierda: Adopción y Salud */}
        <div className="space-y-6">
          {/* Adopción de Features */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text)] flex items-center gap-2">
              <Layers size={14} className="text-indigo-400" />
              <span>Adopción y Popularidad de Módulos</span>
            </h3>
            
            <div className="space-y-3.5 pt-2">
              {adoptionStats.length === 0 ? (
                <div className="text-center text-xs italic text-[var(--color-text-muted)] py-4">Escaneando base de datos...</div>
              ) : (
                adoptionStats.map((feat) => (
                  <div key={feat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-[var(--color-text)]">{feat.name}</span>
                      <span className="text-[var(--color-text-muted)]">{feat.installCount} / {feat.totalTenants} ({feat.adoptionRate}%)</span>
                    </div>
                    <div className="w-full bg-[var(--color-surface-2)] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${feat.adoptionRate}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Salud de Instancias */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text)] flex items-center gap-2">
              <HeartPulse size={14} className="text-indigo-400" />
              <span>Salud e Instancias Locales (Pings)</span>
            </h3>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[9px] font-black uppercase text-[var(--color-text-muted)]">
                    <th className="pb-2">ID Instancia</th>
                    <th className="pb-2">Estado Ping</th>
                    <th className="pb-2 text-right">Latencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] text-[11px] font-medium">
                  {pingStats.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-xs italic text-[var(--color-text-muted)]">Escaneando puertos...</td>
                    </tr>
                  ) : (
                    pingStats.map((ping) => (
                      <tr key={ping.clientId} className="hover:bg-[var(--color-surface-2)]/30 transition-colors">
                        <td className="py-2.5 font-bold text-[var(--color-text)]">{ping.clientId}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded-full border ${
                            ping.status === 'success' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {ping.status === 'success' ? 'ONLINE' : 'DOWN'}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-[var(--color-text-muted)]">
                          {ping.latency} ms
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Panel Derecha: Consola de Incidentes en Tiempo Real */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 shadow-sm flex flex-col max-h-[620px]">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 shrink-0">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text)] flex items-center gap-2">
              <Terminal size={14} className="text-indigo-400 animate-pulse" />
              <span>Consola de Incidentes y Telemetría</span>
            </h3>
            <button 
              onClick={handleClearLogs}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-extrabold uppercase flex items-center gap-1 cursor-pointer transition-colors border-none bg-transparent"
            >
              <Trash2 size={11} /> Limpiar Logs
            </button>
          </div>

          {/* Filtros de Telemetría */}
          <div className="grid grid-cols-3 gap-2.5 py-3 shrink-0 border-b border-[var(--color-border)]">
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase text-[var(--color-text-muted)]">Severidad</span>
              <CustomSelect 
                value={filterSeverity} 
                onChange={setFilterSeverity} 
                options={[
                  { value: 'all', label: 'Todas' },
                  { value: 'critical', label: '🔴 Críticas' },
                  { value: 'warning', label: '🟡 Warning' },
                  { value: 'info', label: '🔵 Info' }
                ]}
              />
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase text-[var(--color-text-muted)]">Origen</span>
              <CustomSelect 
                value={filterSource} 
                onChange={setFilterSource} 
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'client-runtime', label: 'Client App' },
                  { value: 'build-pipeline', label: 'Build CLI' },
                  { value: 'cli', label: 'CLI Bridge' }
                ]}
              />
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase text-[var(--color-text-muted)]">Ambiente</span>
              <CustomSelect 
                value={filterEnv} 
                onChange={setFilterEnv} 
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'production', label: 'Producción' },
                  { value: 'staging', label: 'Staging' },
                  { value: 'development', label: 'Desarrollo' }
                ]}
              />
            </div>
          </div>

          {/* Listado de Logs Terminal */}
          <div className="flex-1 overflow-y-auto pt-3 font-mono text-[9px] leading-relaxed space-y-2.5 bg-black/30 p-3 rounded-2xl mt-3 select-text scrollbar-thin border border-[var(--color-border)]">
            {filteredLogs.length === 0 ? (
              <div className="text-slate-500 italic text-center py-8">Sin incidentes reportados en la consola.</div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.eventId} className="border-b border-white/[0.03] pb-2 space-y-1">
                  <div className="flex items-center justify-between text-[8px] text-[var(--color-text-muted)]">
                    <span className="font-extrabold text-indigo-400 uppercase">[{log.source}] / [{log.environment}]</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className={
                    log.severity === 'critical' ? 'text-rose-400 font-bold' :
                    log.severity === 'warning' ? 'text-amber-400' : 'text-slate-300'
                  }>
                    {log.clientId}: {log.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SaaSOperationsView;
