import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Truck, Calculator } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

function CalculadorTarifaInstalacion() {
  const { alertConfirm } = useAlertConfirm();
  const [piso, setPiso] = useState(1);
  const [ascensor, setAscensor] = useState('yes');
  const [tipoMueble, setTipoMueble] = useState('closet');

  const calculated = React.useMemo(() => {
    let tarifaBase = 120000;
    if (tipoMueble === 'cocina') tarifaBase = 280000;
    if (tipoMueble === 'centro_entretenimiento') tarifaBase = 180000;

    let recargoAcarreo = 0;
    if (piso > 1 && ascensor === 'no') {
      recargoAcarreo = (piso - 1) * 20000;
    }

    const total = tarifaBase + recargoAcarreo;

    return {
      tarifaBase,
      recargoAcarreo,
      total
    };
  }, [piso, ascensor, tipoMueble]);

  const handleConfirm = async () => {
    const confirm = await alertConfirm({
      title: 'Confirmar Tarifa de Instalación',
      message: '¿Añadir costo de instalación por $' + calculated.total.toLocaleString() + ' COP al presupuesto?',
      variant: 'warning'
    });

    if (confirm) {
      alertConfirm({
        title: 'Instalación Añadida',
        message: 'Se agendó el personal de ensamble.',
        variant: 'success'
      });
    }
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
        <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Cálculo de Instalación</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Cotizador de entrega y armado de muebles</p>
          </div>
          <Calculator className="w-5 h-5 text-indigo-400" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--color-text-muted)]">Tipo de Mueble a Instalar</label>
          <CustomSelect
            value={tipoMueble}
            onChange={setTipoMueble}
            options={[
              { value: 'closet', label: 'Módulo de Closet Ropero' },
              { value: 'cocina', label: 'Cocina Integral Completa' },
              { value: 'centro_entretenimiento', label: 'Centro de Entretenimiento de Pared' }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Piso de Entrega</label>
            <input
              type="number"
              min="1"
              max="30"
              value={piso}
              onChange={(e) => setPiso(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-1.5 bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl text-xs focus:border-indigo-500/40 focus:outline-none text-[var(--color-text)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">¿Cuenta con Ascensor?</label>
            <CustomSelect
              value={ascensor}
              onChange={setAscensor}
              options={[
                { value: 'yes', label: 'Sí, ascensor operativo' },
                { value: 'no', label: 'No, subir por escaleras (recargo)' }
              ]}
            />
          </div>
        </div>

        {/* Desglose */}
        <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-2.5 text-xs text-[var(--color-text)]">
          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-muted)]">Armado e Instalación Base</span>
            <span className="font-semibold">${calculated.tarifaBase.toLocaleString()} COP</span>
          </div>

          {calculated.recargoAcarreo > 0 && (
            <div className="flex justify-between items-center text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded-lg">
              <span className="flex items-center gap-1">Recargo por Piso ({piso - 1} pisos por escalera)</span>
              <span>+${calculated.recargoAcarreo.toLocaleString()} COP</span>
            </div>
          )}

          <div className="border-t border-[var(--color-border)] pt-2.5 mt-1 flex justify-between items-center text-sm font-bold">
            <span>Costo Total de Instalación</span>
            <span className="text-indigo-400 text-base">${calculated.total.toLocaleString()} COP</span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
        >
          Aceptar y Programar Ensamble
        </button>
      </div>
    </>
  );
}

export default function CalculadorTarifaInstalacionSandbox() {
  return (
    <SandboxLayout
      title="Calculador de Tarifa de Instalación"
      description="Estima el flete de entrega y el servicio técnico de instalación en domicilio."
    >
      <CalculadorTarifaInstalacion />
    </SandboxLayout>
  );
}
