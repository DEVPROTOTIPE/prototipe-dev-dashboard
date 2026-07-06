import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Hammer, CheckCircle } from 'lucide-react';

function SelectorAccesoriosMaquinaria() {
  const { alertConfirm } = useAlertConfirm();
  const [selectedAccs, setSelectedAccs] = useState({});

  const accesorios = [
    { id: 'acc1', name: 'Martillo Hidráulico', desc: 'Para demolición de concreto y roca.', tarifa: 120000, compatible: 'Excavadoras' },
    { id: 'acc2', name: 'Balde de Zanjeo de 30cm', desc: 'Cucharón estrecho para tuberías y ductos.', tarifa: 40000, compatible: 'Todas' },
    { id: 'acc3', name: 'Ahoyador / Broca Sin Fin', desc: 'Para colocación de postes y cercas.', tarifa: 85000, compatible: 'Minicargadores' },
    { id: 'acc4', name: 'Brazo Retroexcavador Corto', desc: 'Brazo de excavación extra para minicargador.', tarifa: 110000, compatible: 'Minicargadores' }
  ];

  const toggleAcc = (id) => {
    setSelectedAccs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalAdicional = accesorios
    .filter(a => selectedAccs[a.id])
    .reduce((sum, a) => sum + a.tarifa, 0);

  const handleConfirm = async () => {
    const selectedNames = accesorios.filter(a => selectedAccs[a.id]).map(a => a.name);
    if (selectedNames.length === 0) {
      alertConfirm({
        title: 'Ningún Accesorio',
        message: 'No has seleccionado accesorios adicionales.',
        variant: 'info'
      });
      return;
    }

    const confirm = await alertConfirm({
      title: 'Confirmar Accesorios',
      message: '¿Deseas añadir los accesorios seleccionados por un recargo de $' + totalAdicional.toLocaleString() + ' COP/día?',
      variant: 'warning'
    });

    if (confirm) {
      alertConfirm({
        title: 'Accesorios Añadidos',
        message: 'Se han acoplado los accesorios a la solicitud.',
        variant: 'success'
      });
    }
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Hammer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Aditamentos y Accesorios</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Selecciona acoples según compatibilidad de equipo</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {accesorios.map((acc) => {
            const active = !!selectedAccs[acc.id];
            return (
              <div
                key={acc.id}
                onClick={() => toggleAcc(acc.id)}
                className={'p-3.5 border rounded-xl flex justify-between items-start gap-4 transition-all cursor-pointer ' + (
                  active
                    ? 'bg-indigo-500/5 border-indigo-500 shadow-sm'
                    : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:border-indigo-500/20'
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-[var(--color-text)]">{acc.name}</span>
                  <span className="text-[9px] text-[var(--color-text-muted)]">{acc.desc}</span>
                  <span className="text-[8px] font-bold text-indigo-400 bg-indigo-500/10 w-fit px-1.5 py-0.5 rounded mt-1.5">
                    Compatibilidad: {acc.compatible}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[11px] font-bold text-[var(--color-text)]">${acc.tarifa.toLocaleString()} COP/día</span>
                  <div className={'w-4 h-4 rounded-md border flex items-center justify-center transition-colors ' + (
                    active ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-[var(--color-border)] bg-[var(--color-surface-2)]'
                  )}>
                    {active && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalAdicional > 0 && (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex justify-between items-center text-xs animate-scale-up">
            <span className="font-bold text-indigo-300">Recargo Diario por Accesorios</span>
            <span className="font-extrabold text-indigo-400">+${totalAdicional.toLocaleString()} COP</span>
          </div>
        )}

        <button
          onClick={handleConfirm}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
        >
          Confirmar Aditamentos
        </button>
      </div>
    </>
  );
}

export default function SelectorAccesoriosMaquinariaSandbox() {
  return (
    <SandboxLayout
      title="Selector de Accesorios de Maquinaria"
      description="Selección y acoplamiento de aditamentos y herramientas compatibles para renta."
    >
      <SelectorAccesoriosMaquinaria />
    </SandboxLayout>
  );
}
