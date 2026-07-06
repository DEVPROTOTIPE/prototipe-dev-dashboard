import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import DatePickerPremium from '../../ui/DatePickerPremium';
import { Calendar, CheckCircle } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

function AgendamientoTomaMedidas() {
  const { alertConfirm } = useAlertConfirm();
  const [fecha, setFecha] = useState(null);
  const [horario, setHorario] = useState('morning');
  const [address, setAddress] = useState('');

  const handleSchedule = async () => {
    if (!fecha) {
      alertConfirm({
        title: 'Fecha Requerida',
        message: 'Por favor selecciona la fecha de la visita.',
        variant: 'error'
      });
      return;
    }

    if (!address.trim()) {
      alertConfirm({
        title: 'Dirección Requerida',
        message: 'Por favor ingresa la dirección del domicilio para la toma de medidas.',
        variant: 'error'
      });
      return;
    }

    const confirm = await alertConfirm({
      title: 'Confirmar Visita Técnica',
      message: '¿Agendar visita de medición para el ' + fecha.toISOString().split('T')[0] + ' en horario ' + (horario === 'morning' ? 'Mañana' : 'Tarde') + '?',
      variant: 'warning'
    });

    if (confirm) {
      alertConfirm({
        title: 'Visita Agendada',
        message: 'El técnico medidor asistirá en la fecha coordinada. Dirección: ' + address,
        variant: 'success'
      });
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
            <h3 className="text-sm font-bold text-[var(--color-text)]">Visita de Rectificación</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Coordinación de visita técnica de medidas</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[var(--color-text-muted)]">Selecciona la Fecha de la Visita</label>
          <DatePickerPremium
            mode="single"
            value={fecha}
            onChange={setFecha}
            placeholder="Elige un día en el calendario..."
            disabledPast
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Jornada Horaria</label>
            <CustomSelect
              value={horario}
              onChange={setHorario}
              options={[
                { value: 'morning', label: 'Mañana (8:00 AM - 12:00 PM)' },
                { value: 'afternoon', label: 'Tarde (1:30 PM - 5:30 PM)' }
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Dirección del Domicilio</label>
            <input
              type="text"
              placeholder="Ej: Av. El Dorado #68-90, Apto 502"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-1.5 bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl text-xs focus:border-indigo-500/40 focus:outline-none text-[var(--color-text)]"
            />
          </div>
        </div>

        {fecha && address.trim() && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-xs animate-scale-up">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">Datos de Visita Listos</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Día: {fecha.toISOString().split('T')[0]} | Jornada: {horario === 'morning' ? 'Mañana' : 'Tarde'}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleSchedule}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
        >
          Confirmar y Agendar Visita
        </button>
      </div>
    </>
  );
}

export default function AgendamientoTomaMedidasSandbox() {
  return (
    <SandboxLayout
      title="Agendamiento de Toma de Medidas"
      description="Agendamiento digital premium para visitas de diseño y medición a domicilio."
    >
      <AgendamientoTomaMedidas />
    </SandboxLayout>
  );
}
