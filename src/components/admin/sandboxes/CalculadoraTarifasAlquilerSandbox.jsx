import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Truck, Calculator, BadgePercent } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

function CalculadoraTarifasAlquiler() {
  const { alertConfirm } = useAlertConfirm();
  const [dias, setDias] = useState(5);
  const [operator, setOperator] = useState('no');
  const [insurance, setInsurance] = useState('standard');
  const [delivery, setDelivery] = useState(false);

  const TARIFA_BASE_DIA = 450000;

  const calculated = React.useMemo(() => {
    let subtotal = TARIFA_BASE_DIA * dias;
    let descPct = 0;

    if (dias >= 30) {
      descPct = 20;
    } else if (dias >= 7) {
      descPct = 10;
    }

    const descuento = subtotal * (descPct / 100);
    let maquinariaTotal = subtotal - descuento;

    const costoOperador = operator === 'yes' ? 150000 * dias : 0;
    
    let costoSeguroDia = 30000;
    if (insurance === 'premium') costoSeguroDia = 60000;
    if (insurance === 'none') costoSeguroDia = 0;
    const costoSeguro = costoSeguroDia * dias;

    const costoDelivery = delivery ? 120000 : 0;

    const total = maquinariaTotal + costoOperador + costoSeguro + costoDelivery;

    return {
      subtotal,
      descPct,
      descuento,
      maquinariaTotal,
      costoOperador,
      costoSeguro,
      costoDelivery,
      total
    };
  }, [dias, operator, insurance, delivery]);

  const handleConfirmQuote = async () => {
    const confirm = await alertConfirm({
      title: 'Aceptar Cotización',
      message: '¿Deseas confirmar la cotización de alquiler por un total de $' + calculated.total.toLocaleString() + ' COP?',
      variant: 'warning'
    });

    if (confirm) {
      alertConfirm({
        title: 'Cotización Enviada',
        message: 'Se ha registrado la cotización y un asesor se comunicará contigo.',
        variant: 'success'
      });
    }
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
        <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Cotizador de Renta</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Tarifas escalables con descuentos progresivos</p>
          </div>
          <Calculator className="w-5 h-5 text-indigo-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Días de Alquiler</label>
            <input
              type="number"
              min="1"
              max="365"
              value={dias}
              onChange={(e) => setDias(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-1.5 bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl text-xs focus:border-indigo-500/40 focus:outline-none text-[var(--color-text)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Operador Certificado</label>
            <CustomSelect
              value={operator}
              onChange={setOperator}
              options={[
                { value: 'no', label: 'Sin Operador (Solo Máquina)' },
                { value: 'yes', label: 'Con Operador (+$150k/día)' }
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Seguro de Daños</label>
            <CustomSelect
              value={insurance}
              onChange={setInsurance}
              options={[
                { value: 'none', label: 'Sin Cobertura (Responsabilidad Total)' },
                { value: 'standard', label: 'Seguro Estándar (+$30k/día)' },
                { value: 'premium', label: 'Seguro Premium Cero Deducible (+$60k/día)' }
              ]}
            />
          </div>

          <div className="flex items-center gap-3 pt-5 px-1">
            <input
              type="checkbox"
              id="delivery"
              checked={delivery}
              onChange={(e) => setDelivery(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-500 bg-[var(--color-surface-2)] border-[var(--color-border)] focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="delivery" className="text-xs font-bold text-[var(--color-text)] cursor-pointer flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-indigo-400" />
              Solicitar Envío a Obra
            </label>
          </div>
        </div>

        <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-2.5 text-xs text-[var(--color-text)]">
          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-muted)]">Renta Base ({dias} días)</span>
            <span className="font-semibold">${calculated.subtotal.toLocaleString()} COP</span>
          </div>

          {calculated.descPct > 0 && (
            <div className="flex justify-between items-center text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
              <span className="flex items-center gap-1">
                <BadgePercent className="w-3.5 h-3.5" />
                Descuento por Volumen ({calculated.descPct}%)
              </span>
              <span>-${calculated.descuento.toLocaleString()} COP</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-muted)]">Servicio de Operador</span>
            <span className="font-semibold">${calculated.costoOperador.toLocaleString()} COP</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-muted)]">Seguro y Coberturas</span>
            <span className="font-semibold">${calculated.costoSeguro.toLocaleString()} COP</span>
          </div>

          {delivery && (
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-muted)]">Flete / Movilización</span>
              <span className="font-semibold">${calculated.costoDelivery.toLocaleString()} COP</span>
            </div>
          )}

          <div className="border-t border-[var(--color-border)] pt-2.5 mt-1 flex justify-between items-center text-sm font-bold">
            <span>Total Cotizado</span>
            <span className="text-indigo-400 text-base">${calculated.total.toLocaleString()} COP</span>
          </div>
        </div>

        <button
          onClick={handleConfirmQuote}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
        >
          Confirmar y Solicitar Renta
        </button>
      </div>
    </>
  );
}

export default function CalculadoraTarifasAlquilerSandbox() {
  return (
    <SandboxLayout
      title="Calculadora de Tarifas de Alquiler"
      description="Herramienta interactiva para calcular tarifas de renta de maquinaria pesada con descuentos por escala."
    >
      <CalculadoraTarifasAlquiler />
    </SandboxLayout>
  );
}
