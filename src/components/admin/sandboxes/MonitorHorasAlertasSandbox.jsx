import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Activity, ShieldAlert, CheckCircle } from 'lucide-react';

function MonitorHorasAlertas() {
  const { alertConfirm } = useAlertConfirm();
  const [horas, setHoras] = useState(240);

  const LIMITE_MANTENIMIENTO = 250;

  const status = React.useMemo(() => {
    const restante = LIMITE_MANTENIMIENTO - horas;
    let variant = 'normal';
    let text = 'Equipo en Óptimo Estado';

    if (restante <= 0) {
      variant = 'danger';
      text = 'MANTENIMIENTO URGENTE REQUERIDO';
    } else if (restante <= 20) {
      variant = 'warn';
      text = 'Próximo a Mantenimiento Preventivo';
    }

    return {
      restante,
      variant,
      text,
      pct: Math.min(100, Math.round((horas / LIMITE_MANTENIMIENTO) * 100))
    };
  }, [horas]);

  const handleRequestService = async () => {
    const confirm = await alertConfirm({
      title: 'Solicitar Mantenimiento',
      message: '¿Deseas enviar la orden de servicio técnico preventivo para esta máquina?',
      variant: 'warning'
    });

    if (confirm) {
      alertConfirm({
        title: 'Mantenimiento Solicitado',
        message: 'Orden de servicio enviada a taller. Un técnico se desplazará a la obra.',
        variant: 'success'
      });
    }
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Horómetro y Telemetría</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Control de desgaste y ciclos de servicio</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-4 bg-[var(--color-surface-2)]/30 rounded-2xl border border-[var(--color-border)]">
          <span className="text-3xl font-extrabold text-[var(--color-text)]">{horas} h</span>
          <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mt-1">Horómetro Acumulado</span>
          
          <div className="w-4/5 flex flex-col gap-1 mt-4">
            <div className="w-full bg-[var(--color-bg)] h-2 rounded-full overflow-hidden">
              <div
                className={'h-full transition-all duration-300 ' + (
                  status.variant === 'danger' ? 'bg-red-500 animate-pulse' : status.variant === 'warn' ? 'bg-amber-500' : 'bg-indigo-500'
                )}
                style={{ width: status.pct + '%' }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-[var(--color-text-muted)] font-bold">
              <span>0h</span>
              <span>Límite Mantenimiento: {LIMITE_MANTENIMIENTO}h</span>
            </div>
          </div>
        </div>

        {status.variant === 'danger' ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs animate-scale-up">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">{status.text}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Excedido por {-status.restante} horas del ciclo de 250h. Riesgo de daño en motor.
              </span>
            </div>
          </div>
        ) : status.variant === 'warn' ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-amber-400 text-xs animate-scale-up">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">{status.text}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Solo quedan {status.restante} horas para el mantenimiento preventivo recomendado.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-400 text-xs animate-scale-up">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">{status.text}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Quedan {status.restante} horas de uso antes de requerir inspección técnica.
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5 border-t border-[var(--color-border)] pt-4">
          <div className="flex justify-between text-[10px] font-bold text-[var(--color-text-muted)]">
            <span>Simular Horas de Operación</span>
            <span>{horas} h</span>
          </div>
          <input
            type="range"
            min="100"
            max="300"
            value={horas}
            onChange={(e) => setHoras(parseInt(e.target.value))}
            className="w-full h-1 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <button
          onClick={handleRequestService}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
        >
          Agendar Servicio Técnico
        </button>
      </div>
    </>
  );
}

export default function MonitorHorasAlertasSandbox() {
  return (
    <SandboxLayout
      title="Monitor de Horas y Alertas"
      description="Seguimiento de horas de uso y alertas preventivas de mantenimiento."
    >
      <MonitorHorasAlertas />
    </SandboxLayout>
  );
}
