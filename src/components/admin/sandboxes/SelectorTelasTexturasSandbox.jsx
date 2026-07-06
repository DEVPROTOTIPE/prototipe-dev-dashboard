import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const TELAS = [
  { id: 'cuero', label: 'Cuero Sintético', resistencia: 'Alta', precioM: 85000, color: '#78350f', desc: 'Fácil limpieza, resistente a líquidos.' },
  { id: 'terciopelo', label: 'Terciopelo', resistencia: 'Media', precioM: 65000, color: '#6d28d9', desc: 'Suave y lujoso, requiere mantenimiento.' },
  { id: 'lino', label: 'Lino Natural', resistencia: 'Media', precioM: 48000, color: '#d4a373', desc: 'Ecológico, transpirable, se arruga fácil.' },
  { id: 'microfibra', label: 'Microfibra', resistencia: 'Alta', precioM: 55000, color: '#64748b', desc: 'Anti-manchas, resistente al desgaste.' },
  { id: 'algodon', label: 'Algodón', resistencia: 'Baja', precioM: 38000, color: '#e2e8f0', desc: 'Natural y cómodo, menos duradero.' },
  { id: 'chenille', label: 'Chenille', resistencia: 'Media', precioM: 72000, color: '#15803d', desc: 'Textura aterciopelada, cálido y elegante.' },
];

const RESIST_COLOR = { Alta: 'text-green-400 bg-green-500/15', Media: 'text-yellow-400 bg-yellow-500/15', Baja: 'text-red-400 bg-red-500/15' };
const CATS = ['Todas', 'Alta', 'Media', 'Baja'];

function TelasComponent() {
  const [selected, setSelected] = useState(null);
  const [filtro, setFiltro] = useState('Todas');

  const filtradas = TELAS.filter(t => filtro === 'Todas' || t.resistencia === filtro);
  const tela = TELAS.find(t => t.id === selected);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {CATS.map(c => (
          <button key={c} onClick={() => setFiltro(c)}
            className={`shrink-0 px-3 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${filtro===c ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filtradas.map(t => (
          <button key={t.id} onClick={() => setSelected(t.id)}
            className={`flex flex-col gap-2 p-3 rounded-2xl border text-left transition-all cursor-pointer ${selected===t.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 scale-[1.02]' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40'}`}>
            <div className="w-full h-8 rounded-xl" style={{ backgroundColor: t.color }} />
            <p className="text-[11px] font-black text-[var(--color-text)]">{t.label}</p>
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${RESIST_COLOR[t.resistencia]}`}>{t.resistencia}</span>
              <span className="text-[10px] font-bold text-[var(--color-primary)]">${(t.precioM/1000).toFixed(0)}k/m</span>
            </div>
          </button>
        ))}
      </div>

      {tela && (
        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex gap-3">
          <div className="w-12 h-12 rounded-xl shrink-0" style={{ backgroundColor: tela.color }} />
          <div>
            <p className="text-xs font-black text-[var(--color-text)]">{tela.label}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{tela.desc}</p>
            <p className="text-[10px] font-bold text-[var(--color-primary)] mt-1">${tela.precioM.toLocaleString('es-CO')} / metro</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SelectorTelasTexturasSandbox() {
  return (
    <SandboxLayout
      title="Selector de Telas y Texturas"
      description="Muestrario de telas por resistencia con muestra de color y precio por metro"
    >
      <TelasComponent />
    </SandboxLayout>
  );
}
