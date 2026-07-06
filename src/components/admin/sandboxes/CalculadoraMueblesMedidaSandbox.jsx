import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Sliders, Calculator } from 'lucide-react';

function CalculadoraMueblesMedida() {
  const { alertConfirm } = useAlertConfirm();
  const [ancho, setAncho] = useState(1200); // mm
  const [alto, setAlto] = useState(1800); // mm
  const [profundo, setProfundo] = useState(600); // mm

  const calculated = React.useMemo(() => {
    const areaFrente = (ancho / 1000) * (alto / 1000);
    const areaLaterales = 2 * ((profundo / 1000) * (alto / 1000));
    const areaPlacas = areaFrente + areaLaterales;

    const metrosTapacanto = 2 * (ancho / 1000) + 4 * (alto / 1000);

    const costoPlacaM2 = 80000;
    const costoTapacantoMetro = 5000;
    const baseArmado = 250000;

    const subtotalPlacas = areaPlacas * costoCostoPorM2(areaPlacas);
    const subtotalTapacantos = metrosTapacanto * costoTapacantoMetro;
    const total = Math.round(subtotalPlacas + subtotalTapacantos + baseArmado);

    return {
      areaPlacas,
      metrosTapacanto,
      total
    };
  }, [ancho, alto, profundo]);

  function costoCostoPorM2(m2) {
    return 75000;
  }

  const handleConfirm = async () => {
    const confirm = await alertConfirm({
      title: 'Agregar a Cotización',
      message: '¿Añadir mueble a la lista por un valor estimado de $' + calculated.total.toLocaleString() + ' COP?',
      variant: 'warning'
    });

    if (confirm) {
      alertConfirm({
        title: 'Mueble Guardado',
        message: 'Las especificaciones de despiece han sido registradas en la orden.',
        variant: 'success'
      });
    }
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
        <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Cálculo de Estructura</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Ajuste de dimensiones físicas en milímetros</p>
          </div>
          <Calculator className="w-5 h-5 text-indigo-400" />
        </div>

        {/* Sliders */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-bold text-[var(--color-text)]">
              <span>Ancho del Mueble</span>
              <span className="text-indigo-400">{ancho} mm</span>
            </div>
            <input
              type="range"
              min="400"
              max="2400"
              step="50"
              value={ancho}
              onChange={(e) => setAncho(parseInt(e.target.value))}
              className="w-full h-1 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-bold text-[var(--color-text)]">
              <span>Alto del Mueble</span>
              <span className="text-indigo-400">{alto} mm</span>
            </div>
            <input
              type="range"
              min="600"
              max="2600"
              step="50"
              value={alto}
              onChange={(e) => setAlto(parseInt(e.target.value))}
              className="w-full h-1 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-bold text-[var(--color-text)]">
              <span>Profundidad del Mueble</span>
              <span className="text-indigo-400">{profundo} mm</span>
            </div>
            <input
              type="range"
              min="300"
              max="800"
              step="50"
              value={profundo}
              onChange={(e) => setProfundo(parseInt(e.target.value))}
              className="w-full h-1 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Desglose */}
        <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-2.5 text-xs text-[var(--color-text)]">
          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-muted)]">Consumo de Madera Estimado</span>
            <span className="font-semibold">{calculated.areaPlacas.toFixed(2)} m²</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-muted)]">Canto de PVC Requerido</span>
            <span className="font-semibold">{calculated.metrosTapacanto.toFixed(1)} m</span>
          </div>

          <div className="border-t border-[var(--color-border)] pt-2.5 mt-1 flex justify-between items-center text-sm font-bold">
            <span>Costo de Fabricación Estimado</span>
            <span className="text-indigo-400 text-base">${calculated.total.toLocaleString()} COP</span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
        >
          Agregar al Presupuesto de Obra
        </button>
      </div>
    </>
  );
}

export default function CalculadoraMueblesMedidaSandbox() {
  return (
    <SandboxLayout
      title="Calculadora de Muebles a Medida"
      description="Herramienta interactiva para cotizar closets y alacenas paramétricamente."
    >
      <CalculadoraMueblesMedida />
    </SandboxLayout>
  );
}
