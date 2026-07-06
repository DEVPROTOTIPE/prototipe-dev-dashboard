import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const FRAGANCIAS = [
  { id: 'lavanda', label: 'Lavanda', color: '#a78bfa', emoji: '💜' },
  { id: 'floral', label: 'Floral', color: '#f472b6', emoji: '🌸' },
  { id: 'citrico', label: 'Cítrico', color: '#fb923c', emoji: '🍋' },
  { id: 'marino', label: 'Marino', color: '#38bdf8', emoji: '🌊' },
  { id: 'neutro', label: 'Sin fragancia', color: '#94a3b8', emoji: '⚪' },
  { id: 'bebe', label: 'Bebé (suave)', color: '#86efac', emoji: '🍼' },
];

function FraganciaComponent() {
  const [selected, setSelected] = useState(null);
  const [hipoalergenico, setHipoalergenico] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-2.5">
        {FRAGANCIAS.map(f => (
          <button key={f.id} onClick={() => setSelected(f.id)}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${selected===f.id ? 'scale-105 shadow-lg' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:scale-[1.02]'}`}
            style={selected===f.id ? { borderColor: f.color, backgroundColor: f.color+'18', boxShadow: `0 0 16px ${f.color}30` } : {}}>
            <span className="text-2xl">{f.emoji}</span>
            <span className="text-[10px] font-bold text-[var(--color-text)] text-center leading-tight">{f.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
        <div className="flex flex-col">
          <span className="text-xs font-black text-[var(--color-text)]">Detergente hipoalergénico</span>
          <span className="text-[10px] text-[var(--color-text-muted)]">Apto para pieles sensibles y bebés</span>
        </div>
        <button onClick={() => setHipoalergenico(h => !h)}
          className={`relative w-11 h-6 rounded-full transition-all cursor-pointer border-2 ${hipoalergenico ? 'bg-green-500 border-green-400' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'}`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${hipoalergenico ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      </div>

      {(selected || hipoalergenico) && (
        <div className="p-3 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-2xl text-[11px] text-[var(--color-text)] font-semibold">
          {selected && <span>Fragancia: <b>{FRAGANCIAS.find(f=>f.id===selected)?.label}</b></span>}
          {selected && hipoalergenico && <span className="mx-2">·</span>}
          {hipoalergenico && <span className="text-green-400 font-black">✓ Hipoalergénico activado</span>}
        </div>
      )}
    </div>
  );
}

export default function SelectorFraganciaSuavizanteSandbox() {
  return (
    <SandboxLayout
      title="Selector de Fragancia y Suavizante"
      description="Elige el aroma e indica si requiere detergente hipoalergénico"
    >
      <FraganciaComponent />
    </SandboxLayout>
  );
}
