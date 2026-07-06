import React, { useState, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Settings, Ruler, Info, ShoppingBag } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

// Recreación inline del componente
function SelectorTramosTuberia({
  onChange = null,
  liquidPipeOptions = [
    { value: '1_4', label: 'Línea de Líquido: 1/4" (6.35 mm)', priceMeter: 3.50 },
    { value: '3_8', label: 'Línea de Líquido: 3/8" (9.52 mm)', priceMeter: 4.80 }
  ],
  suctionPipeOptions = [
    { value: '3_8', label: 'Línea de Succión: 3/8" (9.52 mm)', priceMeter: 4.80 },
    { value: '1_2', label: 'Línea de Succión: 1/2" (12.7 mm)', priceMeter: 6.50 },
    { value: '5_8', label: 'Línea de Succión: 5/8" (15.8 mm)', priceMeter: 8.20 }
  ]
}) {
  const [liquidSize, setLiquidSize] = useState(liquidPipeOptions[0].value);
  const [suctionSize, setSuctionSize] = useState(suctionPipeOptions[1].value);
  const [meters, setMeters] = useState(5);
  const [insulation, setInsulation] = useState(true);

  const calculation = useMemo(() => {
    const liquidOpt = liquidPipeOptions.find(o => o.value === liquidSize) || liquidPipeOptions[0];
    const suctionOpt = suctionPipeOptions.find(o => o.value === suctionSize) || suctionPipeOptions[0];

    const liquidCost = liquidOpt.priceMeter * meters;
    const suctionCost = suctionOpt.priceMeter * meters;
    const insulationCost = insulation ? (1.50 * meters * 2) : 0;
    
    const totalCost = liquidCost + suctionCost + insulationCost;

    return {
      liquidCost: parseFloat(liquidCost.toFixed(2)),
      suctionCost: parseFloat(suctionCost.toFixed(2)),
      insulationCost: parseFloat(insulationCost.toFixed(2)),
      total: parseFloat(totalCost.toFixed(2)),
      meters
    };
  }, [liquidSize, suctionSize, meters, insulation, liquidPipeOptions, suctionPipeOptions]);

  const handleRegister = () => {
    if (onChange) {
      const liquidOpt = liquidPipeOptions.find(o => o.value === liquidSize);
      const suctionOpt = suctionPipeOptions.find(o => o.value === suctionSize);
      onChange({
        liquidDiameter: liquidOpt?.label,
        suctionDiameter: suctionOpt?.label,
        meters,
        insulation,
        totalCost: calculation.total
      });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
        <Ruler size={16} className="text-[var(--color-primary)]" />
        <span>Kit de Tubería de Cobre & Montaje</span>
      </h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Configura los diámetros de tuberías y longitud necesarios para la interconexión de tus equipos.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">Diámetro Línea Líquido</label>
            <CustomSelect
              value={liquidSize}
              onChange={setLiquidSize}
              options={liquidPipeOptions}
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">Diámetro Línea Succión</label>
            <CustomSelect
              value={suctionSize}
              onChange={setSuctionSize}
              options={suctionPipeOptions}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center text-[10px] font-bold text-[var(--color-text-muted)] mb-1">
            <span>Metraje de Tubería Requerida</span>
            <span className="font-mono text-[var(--color-primary)]">{meters} Metros</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="2"
              max="25"
              value={meters}
              onChange={(e) => setMeters(parseInt(e.target.value))}
              className="flex-1 h-1.5 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)] outline-none"
            />
            <input
              type="number"
              value={meters}
              onChange={(e) => setMeters(Math.max(2, parseInt(e.target.value) || 2))}
              className="w-16 h-8 px-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-center font-mono text-xs text-[var(--color-text)] outline-none"
              min="2"
            />
          </div>
        </div>

        <div className="flex justify-between items-center p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface-2)]/10">
          <div>
            <span className="text-xs font-bold text-[var(--color-text)] block">Incluir Aislamiento Elastómero</span>
            <span className="text-[9px] text-[var(--color-text-muted)]">Protege los caños de condensaciones e incrementa la eficiencia.</span>
          </div>
          <button
            type="button"
            onClick={() => setInsulation(!insulation)}
            className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
              insulation ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
              insulation ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>

        <div className="p-4 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center text-[10px] text-[var(--color-text-muted)]">
            <span>Costo Línea de Cobre (Líquido + Succión):</span>
            <span className="font-mono">${(calculation.liquidCost + calculation.suctionCost).toFixed(2)} USD</span>
          </div>
          {insulation && (
            <div className="flex justify-between items-center text-[10px] text-[var(--color-text-muted)]">
              <span>Aislamiento Armaflex ({meters * 2} metros):</span>
              <span className="font-mono">${calculation.insulationCost.toFixed(2)} USD</span>
            </div>
          )}
          <div className="border-t border-[var(--color-border)] pt-2 flex justify-between items-center font-bold">
            <span className="text-[var(--color-text)]">Total Cotización Materiales:</span>
            <span className="text-[var(--color-primary)] text-sm font-mono">${calculation.total.toFixed(2)} USD</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRegister}
          className="w-full h-11 bg-[var(--color-primary)] hover:opacity-90 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <ShoppingBag size={14} />
          <span>Añadir Tubería a Cotización</span>
        </button>
      </div>
    </div>
  );
}

export default function SelectorTramosTuberiaSandbox() {
  const [selected, setSelected] = useState(null);

  return (
    <SandboxLayout
      title="Selector de Tramos de Tubería HVAC"
      description="Calulador interactivo de cobre y Armaflex con sincronización de slider e input numérico."
      controls={[]}
    >
      <div className="py-6 flex flex-col items-center justify-center w-full">
        <SelectorTramosTuberia
          onChange={setSelected}
        />
        {selected && (
          <div className="mt-4 p-3 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-xl text-xs">
            Añadido: <strong>{selected.meters} metros</strong> de tuberías con costo total de <strong>${selected.totalCost} USD</strong>.
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
