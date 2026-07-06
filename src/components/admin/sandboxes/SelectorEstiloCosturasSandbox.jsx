import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const ESTILOS = [
  { id: 'recta', label: 'Costura Recta', precio: 0, icono: '➖', desc: 'Clásica y limpia, sin decoración adicional.' },
  { id: 'zigzag', label: 'Costura Zigzag', precio: 35000, icono: '〰️', desc: 'Refuerzo y detalle decorativo en costuras.' },
  { id: 'capitone_diamante', label: 'Capitoné Diamante', precio: 120000, icono: '💎', desc: 'Acolchado clásico con botones en rombo.' },
  { id: 'capitone_cuadrado', label: 'Capitoné Cuadrado', precio: 100000, icono: '⬛', desc: 'Bloques cuadrados uniformes y modernos.' },
  { id: 'sin_costura', label: 'Sin costura decorativa', precio: 0, icono: '⬜', desc: 'Superficie limpia sin detalles de hilo.' },
  { id: 'ingles', label: 'Costura Inglesa', precio: 55000, icono: '🪡', desc: 'Doble pespunte visible en bordes y uniones.' },
];

function CosturaComponent() {
  const [selected, setSelected] = useState('recta');
  const est = ESTILOS.find(e => e.id === selected);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        {ESTILOS.map(e => (
          <button key={e.id} onClick={() => setSelected(e.id)}
            className={`flex flex-col gap-1.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${selected===e.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 scale-[1.02]' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40'}`}>
            <span className="text-xl">{e.icono}</span>
            <p className={`text-[10px] font-black leading-tight ${selected===e.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>{e.label}</p>
            <p className={`text-[10px] font-bold ${e.precio > 0 ? 'text-orange-400' : 'text-[var(--color-text-muted)]'}`}>
              {e.precio > 0 ? `+$${(e.precio/1000).toFixed(0)}k` : 'Sin costo extra'}
            </p>
          </button>
        ))}
      </div>

      {est && (
        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex gap-3 items-start">
          <span className="text-2xl shrink-0">{est.icono}</span>
          <div>
            <p className="text-xs font-black text-[var(--color-text)]">{est.label}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{est.desc}</p>
            <p className={`text-xs font-black mt-1 ${est.precio > 0 ? 'text-orange-400' : 'text-green-400'}`}>
              {est.precio > 0 ? `Costo adicional: $${est.precio.toLocaleString('es-CO')}` : '✓ Incluido en el servicio base'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SelectorEstiloCosturasSandbox() {
  return (
    <SandboxLayout
      title="Selector de Estilo de Costuras"
      description="Elige el tipo de costura decorativa del tapizado con su costo adicional"
    >
      <CosturaComponent />
    </SandboxLayout>
  );
}
