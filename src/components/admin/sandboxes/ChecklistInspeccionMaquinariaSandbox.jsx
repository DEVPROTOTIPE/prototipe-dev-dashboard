import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { FileText, ShieldAlert, CheckCircle } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

function ChecklistInspeccionMaquinaria() {
  const { alertConfirm } = useAlertConfirm();
  const [fluidos, setFluidos] = useState('yes');
  const [frenos, setFrenos] = useState('yes');
  const [horometro, setHorometro] = useState('');
  const [danos, setDanos] = useState({ front: false, rear: false, left: false, right: false });
  const [inspectOk, setInspectOk] = useState(false);

  const toggleDano = (side) => {
    setDanos(prev => ({ ...prev, [side]: !prev[side] }));
  };

  const handleInspection = async () => {
    if (!horometro.trim()) {
      alertConfirm({
        title: 'Horómetro Requerido',
        message: 'Por favor ingresa la lectura actual del horómetro para el registro.',
        variant: 'error'
      });
      return;
    }

    if (fluidos === 'no' || frenos === 'no') {
      alertConfirm({
        title: 'Falla Crítica Detectada',
        message: 'La máquina presenta fallas críticas que impiden su entrega segura. Inspección rechazada.',
        variant: 'error'
      });
      return;
    }

    const hasDanos = Object.values(danos).some(v => v);
    const confirm = await alertConfirm({
      title: 'Confirmar Inspección',
      message: hasDanos
        ? 'La máquina se entregará con los detalles estéticos indicados. ¿Confirmar inspección?'
        : '¿Confirmar que la maquinaria se encuentra en óptimo estado?',
      variant: 'warning'
    });

    if (confirm) {
      setInspectOk(true);
      alertConfirm({
        title: 'Inspección Guardada',
        message: 'Se ha registrado el acta de inspección correctamente.',
        variant: 'success'
      });
    }
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Acta de Inspección Física</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Pre-entrega o recepción de equipos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Fluidos y Motor</label>
            <CustomSelect
              value={fluidos}
              onChange={setFluidos}
              options={[
                { value: 'yes', label: 'Niveles de Aceite/Agua Correctos' },
                { value: 'no', label: 'Fuga o Nivel Crítico Detectado' }
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Sistema de Frenos/Mandos</label>
            <CustomSelect
              value={frenos}
              onChange={setFrenos}
              options={[
                { value: 'yes', label: 'Operativo 100%' },
                { value: 'no', label: 'Presión baja / Falla en Mandos' }
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--color-text-muted)]">Horómetro del Motor (Horas)</label>
          <input
            type="number"
            placeholder="Ej: 1420.5"
            value={horometro}
            onChange={(e) => setHorometro(e.target.value)}
            className="w-full px-3 py-1.5 bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl text-xs focus:border-indigo-500/40 focus:outline-none text-[var(--color-text)]"
          />
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-[var(--color-border)]">
          <label className="text-xs font-semibold text-[var(--color-text-muted)]">Registro de Daños Estéticos/Golpes</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['front', 'rear', 'left', 'right'].map((side) => {
              const active = danos[side];
              return (
                <button
                  key={side}
                  onClick={() => toggleDano(side)}
                  className={'py-2 px-3 rounded-xl border text-xs font-bold transition-all capitalize cursor-pointer select-none text-center ' + (
                    active
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-[var(--color-surface-2)]/50 border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-amber-500/20'
                  )}
                >
                  {side === 'front' ? 'Frente' : side === 'rear' ? 'Atrás' : side === 'left' ? 'Izquierda' : 'Derecha'}
                </button>
              );
            })}
          </div>
        </div>

        {inspectOk ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-400 text-xs">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">Inspección Aprobada</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Horómetro: {horometro}h | Daños registrados: {Object.keys(danos).filter(k => danos[k]).join(', ') || 'Ninguno'}
              </span>
            </div>
          </div>
        ) : (fluidos === 'no' || frenos === 'no') && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">Entrega Bloqueada</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Fuga o fallo en sistema de frenos requiere revisión por taller antes de entrega.
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleInspection}
          disabled={inspectOk}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-text-muted)]/20 disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
        >
          {inspectOk ? 'Declaración Registrada' : 'Enviar Inspección'}
        </button>
      </div>
    </>
  );
}

export default function ChecklistInspeccionMaquinariaSandbox() {
  return (
    <SandboxLayout
      title="Checklist de Inspección de Maquinaria"
      description="Inspección de pre-entrega interactiva para operarios de maquinaria de alquiler."
    >
      <ChecklistInspeccionMaquinaria />
    </SandboxLayout>
  );
}
