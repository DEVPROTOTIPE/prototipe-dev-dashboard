import React, { useState, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Settings, Calculator, Cpu, ShieldAlert, Check } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

// Recreación inline del componente
function CalculadoraCotizacionMecanizado({
  onCalculate = null,
  materialOptions = [
    { value: 'steel_1045', label: 'Acero SAE 1045 ($5.50/kg)', density: 7.85, baseCost: 5.50 },
    { value: 'steel_ss304', label: 'Acero Inoxidable 304 ($12.00/kg)', density: 7.93, baseCost: 12.00 },
    { value: 'aluminum_6061', label: 'Aluminio 6061-T6 ($9.80/kg)', density: 2.70, baseCost: 9.80 },
    { value: 'brass', label: 'Bronce / Latón ($18.50/kg)', density: 8.50, baseCost: 18.50 },
    { value: 'acetal', label: 'Acetal / Delrin ($15.00/kg)', density: 1.41, baseCost: 15.00 }
  ],
  toleranceOptions = [
    { value: 'standard', label: 'Estándar (±0.1 mm) [x1.0]', multiplier: 1.0 },
    { value: 'medium', label: 'Media (±0.02 mm) [x1.35]', multiplier: 1.35 },
    { value: 'high', label: 'Alta Precisión (±0.005 mm) [x1.8]', multiplier: 1.8 }
  ]
}) {
  const [material, setMaterial] = useState(materialOptions[0].value);
  const [geometry, setGeometry] = useState('cylinder'); // 'cylinder', 'block'
  const [dim1, setDim1] = useState(50); // Diámetro o Ancho (mm)
  const [dim2, setDim2] = useState(100); // Largo o Alto (mm)
  const [dim3, setDim3] = useState(50); // Solo para Bloque: Espesor (mm)
  const [tolerance, setTolerance] = useState(toleranceOptions[0].value);
  const [quantity, setQuantity] = useState(1);

  const activeMaterial = useMemo(() => {
    return materialOptions.find(m => m.value === material) || materialOptions[0];
  }, [material, materialOptions]);

  const activeTolerance = useMemo(() => {
    return toleranceOptions.find(t => t.value === tolerance) || toleranceOptions[0];
  }, [tolerance, toleranceOptions]);

  const costCalculation = useMemo(() => {
    // 1. Calcular volumen en cm³
    let volumeCm3 = 0;
    if (geometry === 'cylinder') {
      const radiusCm = dim1 / 20; // de mm a cm
      const lengthCm = dim2 / 10;
      volumeCm3 = Math.PI * Math.pow(radiusCm, 2) * lengthCm;
    } else {
      const widthCm = dim1 / 10;
      const heightCm = dim2 / 10;
      const thicknessCm = dim3 / 10;
      volumeCm3 = widthCm * heightCm * thicknessCm;
    }

    // 2. Calcular peso en Kg
    const weightKg = (volumeCm3 * activeMaterial.density) / 1000;
    const materialCost = weightKg * activeMaterial.baseCost;

    // 3. Estimar tiempo de máquina base (horas)
    const volumeIndex = volumeCm3 / 100; // factor de escala
    const machineHours = (geometry === 'cylinder' ? 0.5 : 0.8) + volumeIndex * 0.2;
    const hourlyRate = 45; // $45/hora de taller
    const baseLaborCost = machineHours * hourlyRate;

    // 4. Aplicar multiplicador de precisión/tolerancia
    const adjustedLabor = baseLaborCost * activeTolerance.multiplier;

    // 5. Calcular totales
    const unitPrice = (materialCost + adjustedLabor);
    
    // Descuento por volumen
    let volumeDiscount = 0;
    if (quantity >= 50) volumeDiscount = 0.20; // 20%
    else if (quantity >= 10) volumeDiscount = 0.10; // 10%
    else if (quantity >= 5) volumeDiscount = 0.05; // 5%

    const totalBeforeDiscount = unitPrice * quantity;
    const discountAmount = totalBeforeDiscount * volumeDiscount;
    const totalCost = totalBeforeDiscount - discountAmount;

    return {
      weightKg: weightKg.toFixed(3),
      materialCost: materialCost.toFixed(2),
      laborCost: adjustedLabor.toFixed(2),
      unitPrice: unitPrice.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      totalCost: totalCost.toFixed(2)
    };
  }, [geometry, dim1, dim2, dim3, activeMaterial, activeTolerance, quantity]);

  const handleCalculate = () => {
    if (onCalculate) {
      onCalculate(parseFloat(costCalculation.totalCost));
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
        <Calculator size={16} className="text-[var(--color-primary)]" />
        <span>Cotizador de Mecanizado</span>
      </h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Ingresa las especificaciones físicas para obtener una estimación aproximada de fabricación.
      </p>

      <div className="space-y-4">
        {/* Fila de Material */}
        <div>
          <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">Material de la Pieza</label>
          <CustomSelect
            value={material}
            onChange={setMaterial}
            options={materialOptions}
          />
        </div>

        {/* Selector de Geometría */}
        <div>
          <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">Geometría Base</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGeometry('cylinder')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                geometry === 'cylinder'
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-2)]/30 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]/50'
              }`}
            >
              Cilindro (Barra)
            </button>
            <button
              type="button"
              onClick={() => setGeometry('block')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                geometry === 'block'
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-2)]/30 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]/50'
              }`}
            >
              Bloque (Placa)
            </button>
          </div>
        </div>

        {/* Dimensiones */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">
              {geometry === 'cylinder' ? 'Diámetro (mm)' : 'Ancho (mm)'}
            </label>
            <input
              type="number"
              value={dim1}
              onChange={(e) => setDim1(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full h-9 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">Largo (mm)</label>
            <input
              type="number"
              value={dim2}
              onChange={(e) => setDim2(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full h-9 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
            />
          </div>
          {geometry === 'block' ? (
            <div>
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">Espesor (mm)</label>
              <input
                type="number"
                value={dim3}
                onChange={(e) => setDim3(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full h-9 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
              />
            </div>
          ) : (
            <div className="opacity-40 select-none">
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">Espesor (mm)</label>
              <div className="w-full h-9 bg-[var(--color-surface-2)]/10 border border-[var(--color-border)] rounded-xl flex items-center justify-center text-[10px] text-[var(--color-text-muted)] font-mono">
                N/A
              </div>
            </div>
          )}
        </div>

        {/* Tolerancia y Cantidad */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">Tolerancia Requerida</label>
            <CustomSelect
              value={tolerance}
              onChange={setTolerance}
              options={toleranceOptions}
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Piezas</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full h-9 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
            />
          </div>
        </div>

        {/* Desglose de Precios */}
        <div className="mt-4 p-3 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[var(--color-text-muted)]">Peso Material Estimado:</span>
            <span className="font-mono text-[var(--color-text)] font-bold">{costCalculation.weightKg} kg</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[var(--color-text-muted)]">Costo Material:</span>
            <span className="font-mono text-[var(--color-text)]">${costCalculation.materialCost}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[var(--color-text-muted)]">Costo Máquina (Tiempo):</span>
            <span className="font-mono text-[var(--color-text)]">${costCalculation.laborCost}</span>
          </div>
          {parseFloat(costCalculation.discountAmount) > 0 && (
            <div className="flex justify-between items-center text-[11px] text-green-500">
              <span>Descuento aplicado:</span>
              <span className="font-mono font-bold">-${costCalculation.discountAmount}</span>
            </div>
          )}
          <div className="border-t border-[var(--color-border)] pt-2 flex justify-between items-center text-xs font-bold">
            <span className="text-[var(--color-text)]">Total Estimado:</span>
            <span className="font-mono text-[var(--color-primary)] text-sm">${costCalculation.totalCost}</span>
          </div>
        </div>

        {/* Botón de envío */}
        <button
          type="button"
          onClick={handleCalculate}
          className="w-full h-11 bg-[var(--color-primary)] hover:opacity-90 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Calculator size={14} />
          <span>Solicitar Presupuesto Firme</span>
        </button>
      </div>
    </div>
  );
}

export default function CalculadoraCotizacionMecanizadoSandbox() {
  const [totalCost, setTotalCost] = useState(0);

  return (
    <SandboxLayout
      title="Calculadora de Cotización"
      description="Calulador en caliente para cotizar piezas mecanizadas ingresando material, tipo de corte, dimensiones y tolerancias."
      controls={[]}
    >
      <div className="py-6 flex flex-col items-center justify-center w-full">
        <CalculadoraCotizacionMecanizado
          onCalculate={setTotalCost}
        />
        {totalCost > 0 && (
          <div className="mt-4 p-3 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-xl text-xs flex items-center gap-2">
            <Check size={14} />
            <span>Presupuesto estimado generado: ${totalCost.toFixed(2)} USD</span>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
