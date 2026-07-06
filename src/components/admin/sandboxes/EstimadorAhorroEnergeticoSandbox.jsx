import React, { useState, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Leaf, Info, Zap, AlertTriangle } from 'lucide-react';

// Recreación inline del componente
function EstimadorAhorroEnergetico({
  onEstimate = null,
  kwhTariff = 0.15,
  basePowerKw = 1.2,
  inverterPowerKw = 0.72
}) {
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [daysPerYear, setDaysPerYear] = useState(250);

  const stats = useMemo(() => {
    const traditionalDailyKwh = basePowerKw * hoursPerDay;
    const traditionalYearlyKwh = traditionalDailyKwh * daysPerYear;
    const traditionalCost = traditionalYearlyKwh * kwhTariff;

    const inverterDailyKwh = inverterPowerKw * hoursPerDay;
    const inverterYearlyKwh = inverterDailyKwh * daysPerYear;
    const inverterCost = inverterYearlyKwh * kwhTariff;

    const yearlyKwhSaved = traditionalYearlyKwh - inverterYearlyKwh;
    const yearlyCostSaved = traditionalCost - inverterCost;
    const savingsPercent = ((traditionalCost - inverterCost) / traditionalCost) * 100;
    const co2SavedKg = yearlyKwhSaved * 0.4;

    return {
      traditional: {
        kwh: Math.round(traditionalYearlyKwh),
        cost: parseFloat(traditionalCost.toFixed(2))
      },
      inverter: {
        kwh: Math.round(inverterYearlyKwh),
        cost: parseFloat(inverterCost.toFixed(2))
      },
      saved: {
        kwh: Math.round(yearlyKwhSaved),
        cost: parseFloat(yearlyCostSaved.toFixed(2)),
        percent: Math.round(savingsPercent),
        co2Kg: Math.round(co2SavedKg)
      }
    };
  }, [hoursPerDay, daysPerYear, kwhTariff, basePowerKw, inverterPowerKw]);

  const handleRegister = () => {
    if (onEstimate) {
      onEstimate(stats);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
        <Zap size={16} className="text-[var(--color-primary)]" />
        <span>Comparador de Eficiencia Energética</span>
      </h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Descubre el ahorro económico y ecológico estimado al sustituir equipos fijos por Inverter.
      </p>

      <div className="space-y-4">
        {/* Sliders de Configuración */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center text-[10px] font-bold text-[var(--color-text-muted)] mb-1">
              <span>Horas de Uso Diario</span>
              <span className="font-mono text-[var(--color-primary)]">{hoursPerDay} Horas</span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)] outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] font-bold text-[var(--color-text-muted)] mb-1">
              <span>Días de Uso al Año</span>
              <span className="font-mono text-[var(--color-primary)]">{daysPerYear} Días</span>
            </div>
            <input
              type="range"
              min="50"
              max="365"
              value={daysPerYear}
              onChange={(e) => setDaysPerYear(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)] outline-none"
            />
          </div>
        </div>

        {/* Tarjetas Comparativas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {/* Tradicional */}
          <div className="p-3.5 border border-[var(--color-border)] bg-[var(--color-surface-2)]/10 rounded-xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-extrabold text-[var(--color-text)]">Tecnología Fija (On/Off)</span>
                <AlertTriangle size={14} className="text-amber-500 shrink-0" />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)] leading-tight block mb-2">
                Compresor arranca y para continuamente consumiendo picos de corriente.
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[var(--color-text-muted)] block">Consumo Anual</span>
              <span className="font-mono text-sm font-bold text-[var(--color-text)]">{stats.traditional.kwh} kWh</span>
              <span className="font-mono text-xs text-[var(--color-text-muted)] block mt-0.5">
                Costo estimado: ${stats.traditional.cost} USD
              </span>
            </div>
          </div>

          {/* Inverter */}
          <div className="p-3.5 border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/5 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-extrabold text-[var(--color-primary)]">Tecnología Inverter</span>
                <Leaf size={14} className="text-[var(--color-primary)] shrink-0" />
              </div>
              <span className="text-[10px] text-[var(--color-primary)]/80 leading-tight block mb-2">
                Compresor disminuye su velocidad sin apagar, ahorrando energía.
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[var(--color-primary)] block">Consumo Anual</span>
              <span className="font-mono text-sm font-black text-[var(--color-primary)]">{stats.inverter.kwh} kWh</span>
              <span className="font-mono text-xs text-[var(--color-text)] font-semibold block mt-0.5">
                Costo estimado: ${stats.inverter.cost} USD
              </span>
            </div>
          </div>
        </div>

        {/* Resumen del Ahorro */}
        <div className="p-4 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl space-y-2">
          <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider block">
            Impacto Anual de Ahorro
          </span>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] text-[var(--color-text-muted)] block">Dinero Ahorrado:</span>
              <span className="font-mono text-sm font-extrabold text-green-500">
                ${stats.saved.cost} USD ({stats.saved.percent}%)
              </span>
            </div>
            <div>
              <span className="text-[9px] text-[var(--color-text-muted)] block">Co2 No Emitido:</span>
              <span className="font-mono text-sm font-extrabold text-green-500">
                {stats.saved.co2Kg} kg Co2
              </span>
            </div>
          </div>
        </div>

        {/* Botón de Registro */}
        <button
          type="button"
          onClick={handleRegister}
          className="w-full h-11 bg-[var(--color-primary)] hover:opacity-90 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Leaf size={14} />
          <span>Confirmar Estimación Ecológica</span>
        </button>
      </div>
    </div>
  );
}

export default function EstimadorAhorroEnergeticoSandbox() {
  const [estimated, setEstimated] = useState(null);

  return (
    <SandboxLayout
      title="Estimador de Ahorro Energético"
      description="Simulador para proyectar la eficiencia e impacto ecológico Inverter vs tecnología fija."
      controls={[]}
    >
      <div className="py-6 flex flex-col items-center justify-center w-full">
        <EstimadorAhorroEnergetico
          onEstimate={setEstimated}
        />
      </div>
    </SandboxLayout>
  );
}
