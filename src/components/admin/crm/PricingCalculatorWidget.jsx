import React, { useState, useEffect } from 'react';
import { DollarSign, Percent, Calculator, AlertTriangle, TrendingUp } from 'lucide-react';

export default function PricingCalculatorWidget({ values = {}, onChange }) {
  // Inputs del modelo comercial (inicializados con props o defaults)
  const [setupValue, setSetupValue] = useState(values.setupValue || 0);
  const [monthlyValue, setMonthlyValue] = useState(values.monthlyValue || 0);
  const [commissionPercent, setCommissionPercent] = useState(values.commissionPercent || 0);
  const [projectedSalesVolume, setProjectedSalesVolume] = useState(values.projectedSalesVolume || 0);
  const [dianCost, setDianCost] = useState(values.dianCost || 0);

  // Costos operativos estimados (Core Infra)
  const [coreSetupCost, setCoreSetupCost] = useState(150);
  const [coreMonthlyCost, setCoreMonthlyCost] = useState(50);
  const [showCostConfig, setShowCostConfig] = useState(false);

  // Sincronizar desde props si cambian externamente
  useEffect(() => {
    if (values.setupValue !== undefined) setSetupValue(values.setupValue);
    if (values.monthlyValue !== undefined) setMonthlyValue(values.monthlyValue);
    if (values.commissionPercent !== undefined) setCommissionPercent(values.commissionPercent);
    if (values.projectedSalesVolume !== undefined) setProjectedSalesVolume(values.projectedSalesVolume);
    if (values.dianCost !== undefined) setDianCost(values.dianCost);
  }, [values]);

  // Cálculos financieros
  const monthlyCommission = (projectedSalesVolume * commissionPercent) / 100;
  const projectedMonthlyRevenue = Number(monthlyValue) + monthlyCommission + Number(dianCost);
  const projectedAnnualRevenue = Number(setupValue) + (projectedMonthlyRevenue * 12);

  const totalAnnualCost = Number(coreSetupCost) + (Number(coreMonthlyCost) * 12);
  const estimatedAnnualProfit = projectedAnnualRevenue - totalAnnualCost;
  const grossMargin = projectedAnnualRevenue > 0 
    ? Math.max(0, Math.min(100, (estimatedAnnualProfit / projectedAnnualRevenue) * 100))
    : 0;

  // Notificar cambios al padre si existe callback
  useEffect(() => {
    if (onChange) {
      onChange({
        setupValue,
        monthlyValue,
        commissionPercent,
        projectedSalesVolume,
        dianCost,
        projectedMonthlyRevenue,
        projectedAnnualRevenue,
        estimatedMargin: Math.round(grossMargin)
      });
    }
  }, [setupValue, monthlyValue, commissionPercent, projectedSalesVolume, dianCost, grossMargin]);

  // Formateador de moneda colombiana
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Color de la barra de margen (HSL dinámico)
  const getMarginColor = (margin) => {
    if (margin < 40) return 'text-rose-400 bg-rose-950/20 border-rose-500/20';
    if (margin < 60) return 'text-amber-400 bg-amber-950/20 border-amber-500/20';
    return 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20';
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-5 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Calculator size={14} className="text-indigo-400" />
          Simulador Financiero Reactivo
        </h4>
        <span className="text-[10px] bg-indigo-950/30 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
          Proyecciones
        </span>
      </div>

      {/* Controles de Entrada Locales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Valor Setup Único</label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="number"
              value={setupValue || ''}
              onChange={(e) => setSetupValue(Number(e.target.value))}
              placeholder="0"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Mensualidad Fija Base</label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="number"
              value={monthlyValue || ''}
              onChange={(e) => setMonthlyValue(Number(e.target.value))}
              placeholder="0"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Comisión de Venta (%)</label>
          <div className="relative">
            <Percent size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="number"
              step="0.01"
              value={commissionPercent || ''}
              onChange={(e) => setCommissionPercent(Number(e.target.value))}
              placeholder="0.00"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Ventas Mensuales Estimadas (Volumen)</label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="number"
              value={projectedSalesVolume || ''}
              onChange={(e) => setProjectedSalesVolume(Number(e.target.value))}
              placeholder="0"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Costo DIAN Fijo Adicional (Mensual)</label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="number"
              value={dianCost || ''}
              onChange={(e) => setDianCost(Number(e.target.value))}
              placeholder="0"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* KPI outputs reactivos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-slate-800/80 pt-4">
        <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-800/60">
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Setup Inicial</span>
          <span className="text-sm font-black font-mono text-slate-200">{formatCurrency(setupValue)}</span>
        </div>

        <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-800/60">
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Proyección Mensual</span>
          <span className="text-sm font-black font-mono text-indigo-300">{formatCurrency(projectedMonthlyRevenue)}</span>
          <span className="block text-[8px] text-slate-500 font-medium">Incluye base + comisión + DIAN</span>
        </div>

        <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-800/60">
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Ingreso Anual Proyectado</span>
          <span className="text-sm font-black font-mono text-emerald-300">{formatCurrency(projectedAnnualRevenue)}</span>
          <span className="block text-[8px] text-slate-500 font-medium">Setup + 12 meses</span>
        </div>
      </div>

      {/* Margen Bruto y Semáforo */}
      <div className={`p-4 rounded-xl border ${getMarginColor(grossMargin)} transition-all duration-300`}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider">Margen Bruto Proyectado</span>
          </div>
          <span className="text-sm font-black font-mono">{grossMargin.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-950/50 rounded-full h-2 overflow-hidden border border-slate-800">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              grossMargin < 40 ? 'bg-rose-500' : grossMargin < 60 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${grossMargin}%` }}
          />
        </div>

        {grossMargin < 40 && (
          <div className="flex items-start gap-2 mt-3 text-[9px] text-rose-300/80 leading-relaxed font-medium bg-rose-950/30 p-2 rounded-lg border border-rose-500/10">
            <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
            <span>
              <strong>Alerta de Margen Crítico:</strong> El margen de ganancia estimado está por debajo de la política de viabilidad recomendada (40%). Revise las tarifas base o reduzca costos operativos asociados.
            </span>
          </div>
        )}
      </div>

      {/* Costos Operativos del Core */}
      <div className="border-t border-slate-800/80 pt-2">
        <button 
          onClick={() => setShowCostConfig(!showCostConfig)}
          type="button"
          className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider flex items-center gap-1.5"
        >
          {showCostConfig ? 'Ocultar Costos de Referencia ▲' : 'Configurar Costos de Referencia Core ▼'}
        </button>

        {showCostConfig && (
          <div className="grid grid-cols-2 gap-3 mt-3 p-3 bg-slate-950/20 border border-slate-800/80 rounded-xl animate-fadeIn">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-500 uppercase">Setup Core (Costo Único)</label>
              <input
                type="number"
                value={coreSetupCost}
                onChange={(e) => setCoreSetupCost(Number(e.target.value))}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-1 px-2 text-[10px] text-slate-300 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-500 uppercase">Suscripción Core Mensual</label>
              <input
                type="number"
                value={coreMonthlyCost}
                onChange={(e) => setCoreMonthlyCost(Number(e.target.value))}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-1 px-2 text-[10px] text-slate-300 font-mono"
              />
            </div>
            <div className="col-span-2 text-[8px] text-slate-500 leading-tight">
              * Estos costos se descuentan de la proyección anual de ingresos para calcular la rentabilidad comercial neta del Core.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
