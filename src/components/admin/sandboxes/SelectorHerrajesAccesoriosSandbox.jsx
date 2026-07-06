import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { ToggleLeft, CheckCircle } from 'lucide-react';

function SelectorHerrajesAccesorios() {
  const { alertConfirm } = useAlertConfirm();
  const [selected, setSelected] = useState({});

  const herrajes = [
    { id: 'h1', name: 'Bisagras de Cierre Lento', desc: 'Bisagra clip con amortiguador hidráulico de acero.', precio: 15000 },
    { id: 'h2', name: 'Correderas Telescópicas Pesadas', desc: 'Rieles de extensión completa de 45kg de carga.', precio: 38000 },
    { id: 'h3', name: 'Manijas Minimalistas Negro Mate', desc: 'Jaladera metálica de 128mm de entre-centros.', precio: 12000 },
    { id: 'h4', name: 'Organizador Giratorio Esquinero', desc: 'Bandejas giratorias cromadas para mueble bajo.', precio: 320000 }
  ];

  const toggleSelect = (id) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalHerrajes = herrajes
    .filter(h => selected[h.id])
    .reduce((sum, h) => sum + h.precio, 0);

  const handleConfirm = () => {
    alertConfirm({
      title: 'Herrajes Guardados',
      message: 'Se añadieron los accesorios de ensamble seleccionados.',
      variant: 'success'
    });
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <ToggleLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Catálogo de Herrajes</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Elige la calidad y funcionalidad de los herrajes</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {herrajes.map((h) => {
            const active = !!selected[h.id];
            return (
              <div
                key={h.id}
                onClick={() => toggleSelect(h.id)}
                className={'p-3 border rounded-xl flex justify-between items-start gap-4 cursor-pointer transition-all ' + (
                  active
                    ? 'bg-indigo-500/5 border-indigo-500'
                    : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:border-indigo-500/20'
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-[var(--color-text)]">{h.name}</span>
                  <span className="text-[9px] text-[var(--color-text-muted)]">{h.desc}</span>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[11px] font-bold text-[var(--color-text)]">${h.precio.toLocaleString()} COP</span>
                  <div className={'w-4 h-4 rounded border flex items-center justify-center transition-colors ' + (
                    active ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-[var(--color-border)] bg-[var(--color-surface-2)]'
                  )}>
                    {active && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalHerrajes > 0 && (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex justify-between items-center text-xs animate-scale-up">
            <span className="font-bold text-indigo-300">Total Herrajes Seleccionados</span>
            <span className="font-extrabold text-indigo-400">+${totalHerrajes.toLocaleString()} COP</span>
          </div>
        )}

        <button
          onClick={handleConfirm}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
        >
          Confirmar Configuración de Herrajes
        </button>
      </div>
    </>
  );
}

export default function SelectorHerrajesAccesoriosSandbox() {
  return (
    <SandboxLayout
      title="Selector de Herrajes y Accesorios"
      description="Selección y cálculo de costo adicional de herrajes técnicos para muebles."
    >
      <SelectorHerrajesAccesorios />
    </SandboxLayout>
  );
}
