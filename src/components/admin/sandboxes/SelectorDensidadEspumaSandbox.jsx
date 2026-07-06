import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const DENSIDADES = [
  { id: 'D18', label: 'D18 — Blanda', desc: 'Ideal para respaldos y cojines decorativos.', firmeza: 1 },
  { id: 'D23', label: 'D23 — Media', desc: 'Equilibrio entre confort y durabilidad.', firmeza: 2 },
  { id: 'D28', label: 'D28 — Firme', desc: 'Alta durabilidad, para asientos principales.', firmeza: 3 },
  { id: 'D33', label: 'D33 — Extra firme', desc: 'Máxima resistencia para uso intensivo.', firmeza: 4 },
];

const RESORTES = [
  { id: 'sin', label: 'Sin resortes', icono: '🚫', desc: 'Solo espuma. Más económico.' },
  { id: 'elasticos', label: 'Cintas elásticas', icono: '🎗️', desc: 'Flexible y ligero. Vida útil 5 años.' },
  { id: 'espiral', label: 'Resorte espiral', icono: '🌀', desc: 'Clásico. Buen soporte, duradero.' },
  { id: 'zigzag', label: 'Resorte zigzag (no-sag)', icono: '〰️', desc: 'Moderno. Distribución uniforme.' },
];

function EspumaComponent() {
  const [densidad, setDensidad] = useState('D23');
  const [resorte, setResorte] = useState('sin');
  const den = DENSIDADES.find(d => d.id === densidad);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Densidad de espuma</label>
        <div className="flex flex-col gap-1.5">
          {DENSIDADES.map(d => (
            <button key={d.id} onClick={() => setDensidad(d.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all cursor-pointer text-left ${densidad===d.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40'}`}>
              <div>
                <p className={`text-[11px] font-black ${densidad===d.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>{d.label}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">{d.desc}</p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`w-2 h-4 rounded-sm ${i < d.firmeza ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Sistema de resortes</label>
        <div className="grid grid-cols-2 gap-1.5">
          {RESORTES.map(r => (
            <button key={r.id} onClick={() => setResorte(r.id)}
              className={`flex flex-col gap-1 p-2.5 rounded-xl border transition-all cursor-pointer text-left ${resorte===r.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40'}`}>
              <span className="text-base">{r.icono}</span>
              <p className={`text-[10px] font-black leading-tight ${resorte===r.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>{r.label}</p>
              <p className="text-[9px] text-[var(--color-text-muted)] leading-tight">{r.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SelectorDensidadEspumaSandbox() {
  return (
    <SandboxLayout
      title="Selector de Densidad de Espuma y Resortes"
      description="Elige la densidad de espuma y el sistema de soporte interior del mueble"
    >
      <EspumaComponent />
    </SandboxLayout>
  );
}
