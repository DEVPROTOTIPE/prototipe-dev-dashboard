import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Navigation, Check } from 'lucide-react';

function SelectorAperturaPuertas() {
  const { alertConfirm } = useAlertConfirm();
  const [apertura, setApertura] = useState('batiente_der');

  const opciones = [
    {
      id: 'batiente_der',
      name: 'Batiente Bisagra Derecha',
      desc: 'Apertura tradicional girando hacia la derecha.',
      espacioRequerido: 'Requiere 60cm de holgura frontal.'
    },
    {
      id: 'batiente_izq',
      name: 'Batiente Bisagra Izquierda',
      desc: 'Apertura tradicional girando hacia la izquierda.',
      espacioRequerido: 'Requiere 60cm de holgura frontal.'
    },
    {
      id: 'abatible_aventos',
      name: 'Abatible Elevable (Aventos)',
      desc: 'La puerta sube verticalmente paralela al mueble.',
      espacioRequerido: 'Especial para cocinas. Sin obstrucción de paso.'
    },
    {
      id: 'corrediza',
      name: 'Hojas Corredizas',
      desc: 'Las hojas se deslizan de forma paralela en rieles.',
      espacioRequerido: 'Ideal para pasillos estrechos o closets.'
    }
  ];

  const activeOp = opciones.find(o => o.id === apertura) || opciones[0];

  const handleConfirm = () => {
    alertConfirm({
      title: 'Apertura Definida',
      message: 'Sentido seleccionado: ' + activeOp.name,
      variant: 'success'
    });
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Navigation className="w-5 h-5 rotate-90" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Sentido de Apertura</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Define cómo se abrirán las puertas en base al espacio disponible</p>
          </div>
        </div>

        {/* List */}
        <div className="flex flex-col gap-2.5">
          {opciones.map((op) => {
            const active = apertura === op.id;
            return (
              <div
                key={op.id}
                onClick={() => setApertura(op.id)}
                className={'p-3.5 border rounded-xl flex justify-between items-center gap-4 cursor-pointer transition-all ' + (
                  active
                    ? 'bg-indigo-500/5 border-indigo-500 shadow-sm'
                    : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:border-indigo-500/20'
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                    {op.name}
                    {active && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </span>
                  <span className="text-[9px] text-[var(--color-text-muted)] leading-tight">{op.desc}</span>
                  <span className="text-[8px] font-bold text-amber-400 bg-amber-500/10 w-fit px-1.5 py-0.5 rounded mt-1.5">
                    Espacio: {op.espacioRequerido}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleConfirm}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
        >
          Confirmar Configuración de Apertura
        </button>
      </div>
    </>
  );
}

export default function SelectorAperturaPuertasSandbox() {
  return (
    <SandboxLayout
      title="Selector de Apertura de Puertas"
      description="Configuración interactiva de sentido y tipo de apertura para puertas de muebles."
    >
      <SelectorAperturaPuertas />
    </SandboxLayout>
  );
}
