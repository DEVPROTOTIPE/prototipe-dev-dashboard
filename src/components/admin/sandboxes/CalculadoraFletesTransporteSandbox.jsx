import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Truck, Navigation } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

function CalculadoraFletesTransporte() {
  const { alertConfirm } = useAlertConfirm();
  const [distancia, setDistancia] = useState(30);
  const [remolque, setRemolque] = useState('cama_baja_standard');
  const [peso, setPeso] = useState('10_ton');

  const REMOLQUES = {
    cama_baja_standard: { label: 'Cama Baja Estándar (Hasta 15 Tons)', cargoFijo: 180000, costoKm: 7000 },
    cama_baja_reforzada: { label: 'Cama Baja Reforzada (Hasta 30 Tons)', cargoFijo: 320000, costoKm: 12000 },
    rampa_hidraulica: { label: 'Camión con Rampa Hidráulica', cargoFijo: 150000, costoKm: 5500 }
  };

  const calculated = React.useMemo(() => {
    const config = REMOLQUES[remolque];
    let recargoPeso = 1;
    if (peso === '20_ton') recargoPeso = 1.25;
    if (peso === '30_ton') recargoPeso = 1.5;

    const fleteFijo = config.cargoFijo;
    const fleteKm = config.costoKm * distancia * recargoPeso;
    const total = fleteFijo + fleteKm;

    return {
      fleteFijo,
      fleteKm,
      total
    };
  }, [distancia, remolque, peso]);

  const handleConfirmQuote = async () => {
    const confirm = await alertConfirm({
      title: 'Confirmar Cotización de Flete',
      message: '¿Confirmar costo de movilización por un total de $' + calculated.total.toLocaleString() + ' COP?',
      variant: 'warning'
    });

    if (confirm) {
      alertConfirm({
        title: 'Flete Agendado',
        message: 'Se ha agendado la logística de despacho del equipo.',
        variant: 'success'
      });
    }
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
        <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Cálculo de Fletes</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Logística de transporte de equipos</p>
          </div>
          <Truck className="w-5 h-5 text-indigo-400" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--color-text-muted)]">Tipo de Remolque / Camión</label>
          <CustomSelect
            value={remolque}
            onChange={setRemolque}
            options={[
              { value: 'rampa_hidraulica', label: 'Camión con Rampa Hidráulica' },
              { value: 'cama_baja_standard', label: 'Cama Baja Estándar (Hasta 15 Tons)' },
              { value: 'cama_baja_reforzada', label: 'Cama Baja Reforzada (Hasta 30 Tons)' }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Peso de la Máquina</label>
            <CustomSelect
              value={peso}
              onChange={setPeso}
              options={[
                { value: '10_ton', label: 'Menos de 10 Toneladas' },
                { value: '20_ton', label: '10 a 20 Toneladas (+25% recargo)' },
                { value: '30_ton', label: '20 a 30 Toneladas (+50% recargo)' }
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Distancia de Traslado (KM)</label>
            <input
              type="number"
              min="1"
              max="500"
              value={distancia}
              onChange={(e) => setDistancia(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-1.5 bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl text-xs focus:border-indigo-500/40 focus:outline-none text-[var(--color-text)]"
            />
          </div>
        </div>

        <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-2.5 text-xs text-[var(--color-text)]">
          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-muted)]">Cargo Fijo por Cargue/Descargue</span>
            <span className="font-semibold">${calculated.fleteFijo.toLocaleString()} COP</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-muted)]">Costo por Trayecto Recorrido ({distancia} km)</span>
            <span className="font-semibold">${calculated.fleteKm.toLocaleString()} COP</span>
          </div>

          <div className="border-t border-[var(--color-border)] pt-2.5 mt-1 flex justify-between items-center text-sm font-bold">
            <span>Costo Estimado de Transporte</span>
            <span className="text-indigo-400 text-base">${calculated.total.toLocaleString()} COP</span>
          </div>
        </div>

        <button
          onClick={handleConfirmQuote}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
        >
          Aceptar y Agendar Despacho
        </button>
      </div>
    </>
  );
}

export default function CalculadoraFletesTransporteSandbox() {
  return (
    <SandboxLayout
      title="Calculadora de Fletes y Transporte"
      description="Calcula el flete de despacho y recogida de maquinaria pesada a obra."
    >
      <CalculadoraFletesTransporte />
    </SandboxLayout>
  );
}
