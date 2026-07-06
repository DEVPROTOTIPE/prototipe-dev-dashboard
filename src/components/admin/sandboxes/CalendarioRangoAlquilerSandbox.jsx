import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import DatePickerPremium from '../../ui/DatePickerPremium';
import { Calendar, CheckCircle, Info } from 'lucide-react';

function CalendarioRangoAlquiler() {
  const { alertConfirm } = useAlertConfirm();
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [loading, setLoading] = useState(false);

  const blockedDates = ['2026-07-10', '2026-07-11', '2026-07-12', '2026-07-18'];

  const handleReserve = async () => {
    if (!dateRange.start || !dateRange.end) {
      alertConfirm({
        title: 'Error de Selección',
        message: 'Por favor selecciona un rango de fechas válido.',
        variant: 'error'
      });
      return;
    }

    const startStr = dateRange.start.toISOString().split('T')[0];
    const endStr = dateRange.end.toISOString().split('T')[0];

    const hasConflict = blockedDates.some(d => d >= startStr && d <= endStr);
    if (hasConflict) {
      alertConfirm({
        title: 'Conflicto de Fechas',
        message: 'El rango seleccionado incluye días que ya están reservados por otro cliente.',
        variant: 'error'
      });
      return;
    }

    const diffTime = Math.abs(dateRange.end - dateRange.start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const confirm = await alertConfirm({
      title: 'Confirmar Reserva',
      message: '¿Deseas reservar la maquinaria por ' + diffDays + ' días (del ' + startStr + ' al ' + endStr + ')?',
      variant: 'warning'
    });

    if (confirm) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        alertConfirm({
          title: 'Reserva Exitosa',
          message: 'Tu rango de alquiler ha sido bloqueado en el sistema.',
          variant: 'success'
        });
      }, 1000);
    }
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Reserva de Excavadora CAT 320</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Visualización de disponibilidad en tiempo real</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[var(--color-text-muted)]">Rango de Fechas Requerido</label>
          <DatePickerPremium
            mode="range"
            value={dateRange}
            onChange={setDateRange}
            placeholder="Selecciona fecha de entrega y devolución..."
            disabledPast
          />
        </div>

        <div className="p-4 bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-xl flex flex-col gap-2">
          <div className="flex items-start gap-2 text-xs">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">Fechas no disponibles:</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">10 al 12 de Julio, 18 de Julio.</span>
            </div>
          </div>
        </div>

        {dateRange.start && dateRange.end && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-xs animate-scale-up">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">Rango Válido Seleccionado</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Desde: {dateRange.start.toISOString().split('T')[0]} | Hasta: {dateRange.end.toISOString().split('T')[0]}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleReserve}
          disabled={loading || !dateRange.start || !dateRange.end}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-text-muted)]/20 disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
        >
          {loading ? 'Procesando...' : 'Reservar Maquinaria'}
        </button>
      </div>
    </>
  );
}

export default function CalendarioRangoAlquilerSandbox() {
  return (
    <SandboxLayout
      title="Calendario de Rango de Alquiler"
      description="Calendario HSL para selección de fechas de reserva de maquinaria pesada sin inputs nativos."
    >
      <CalendarioRangoAlquiler />
    </SandboxLayout>
  );
}
