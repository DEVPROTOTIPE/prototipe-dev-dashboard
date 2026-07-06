import React, { useState, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { ThermometerSun, ShieldCheck } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

// Recreación inline del componente
function CalculadoraCargaBTU({
  onCalculate = null,
  sunExposureOptions = [
    { value: 'low', label: 'Baja / Sombra constante' },
    { value: 'high', label: 'Alta / Sol directo la mayor parte del día' }
  ]
}) {
  const [width, setWidth] = useState(4); // metros
  const [length, setLength] = useState(5); // metros
  const [height, setHeight] = useState(2.8); // metros
  const [people, setPeople] = useState(2);
  const [appliances, setAppliances] = useState(2); // electrodomésticos que emiten calor
  const [exposure, setExposure] = useState(sunExposureOptions[0].value);

  const calculatedLoad = useMemo(() => {
    const volume = width * length * height;
    let baseBtu = volume * 200;
    const peopleBtu = Math.max(0, people - 1) * 500;
    const appliancesBtu = appliances * 600;
    let totalBtu = baseBtu + peopleBtu + appliancesBtu;
    if (exposure === 'high') {
      totalBtu = totalBtu * 1.2;
    }
    const tons = totalBtu / 12000;

    let recommendation = '9,000 BTU (0.75 Ton)';
    if (totalBtu > 9000 && totalBtu <= 12000) recommendation = '12,000 BTU (1.0 Ton)';
    else if (totalBtu > 12000 && totalBtu <= 18000) recommendation = '18,000 BTU (1.5 Ton)';
    else if (totalBtu > 18000 && totalBtu <= 24000) recommendation = '24,000 BTU (2.0 Ton)';
    else if (totalBtu > 24000 && totalBtu <= 36000) recommendation = '36,000 BTU (3.0 Ton)';
    else if (totalBtu > 36000) recommendation = 'Sistema Multi-Split o Central (3.5+ Ton)';

    return {
      btu: Math.round(totalBtu),
      tons: parseFloat(tons.toFixed(2)),
      recommendation,
      volume: parseFloat(volume.toFixed(1))
    };
  }, [width, length, height, people, appliances, exposure]);

  const handleRegister = () => {
    if (onCalculate) {
      onCalculate(calculatedLoad);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
        <ThermometerSun size={16} className="text-[var(--color-primary)]" />
        <span>Calculadora de Carga Térmica (BTU)</span>
      </h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Determina la capacidad del equipo de aire acondicionado que mejor se adapta a tus necesidades.
      </p>

      <div className="space-y-4">
        {/* Dimensiones */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">Ancho (m)</label>
            <input
              type="number"
              step="0.1"
              value={width}
              onChange={(e) => setWidth(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full h-9 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs font-mono text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">Largo (m)</label>
            <input
              type="number"
              step="0.1"
              value={length}
              onChange={(e) => setLength(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full h-9 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs font-mono text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">Altura (m)</label>
            <input
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full h-9 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs font-mono text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
            />
          </div>
        </div>

        {/* Factores adicionales */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">Personas Habituales</label>
            <input
              type="number"
              value={people}
              onChange={(e) => setPeople(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full h-9 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs font-mono text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
              min="1"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">Electrodomésticos / Equipos</label>
            <input
              type="number"
              value={appliances}
              onChange={(e) => setAppliances(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-9 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs font-mono text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
              min="0"
            />
          </div>
        </div>

        {/* Exposición Solar */}
        <div>
          <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">Exposición Solar</label>
          <CustomSelect
            value={exposure}
            onChange={setExposure}
            options={sunExposureOptions}
          />
        </div>

        {/* Bloque de Resultados */}
        <div className="mt-4 p-4 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center text-[10px] text-[var(--color-text-muted)]">
            <span>Volumen Habitáculo:</span>
            <span className="font-mono">{calculatedLoad.volume} m³</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-[var(--color-text-muted)]">
            <span>Carga Estimada Requerida:</span>
            <span className="font-mono text-[var(--color-text)]">{calculatedLoad.btu} BTU/h ({calculatedLoad.tons} Ton)</span>
          </div>
          <div className="border-t border-[var(--color-border)] pt-2.5 flex justify-between items-center font-bold">
            <span className="text-[var(--color-text)]">Equipo Recomendado:</span>
            <span className="text-[var(--color-primary)] text-sm">{calculatedLoad.recommendation}</span>
          </div>
        </div>

        {/* Botón de acción */}
        <button
          type="button"
          onClick={handleRegister}
          className="w-full h-11 bg-[var(--color-primary)] hover:opacity-90 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <ShieldCheck size={14} />
          <span>Confirmar Selección de BTU</span>
        </button>
      </div>
    </div>
  );
}

export default function CalculadoraCargaBTUSandbox() {
  const [calculation, setCalculation] = useState(null);

  return (
    <SandboxLayout
      title="Calculadora de Carga Térmica (BTU)"
      description="Herramienta interactiva para dimensionar la capacidad de climatización en habitaciones u oficinas."
      controls={[]}
    >
      <div className="py-6 flex flex-col items-center justify-center w-full">
        <CalculadoraCargaBTU
          onCalculate={setCalculation}
        />
        {calculation && (
          <div className="mt-4 p-3 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-xl text-xs">
            Seleccionado: <strong>{calculation.recommendation}</strong> con carga calculada de <strong>{calculation.btu} BTU/h</strong>.
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
