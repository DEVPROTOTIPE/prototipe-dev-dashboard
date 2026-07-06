import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const TONOS = [
  { id: 'roble', label: 'Roble Natural', hex: '#c49a6c' },
  { id: 'nogal', label: 'Nogal Oscuro', hex: '#5c3d1e' },
  { id: 'wengue', label: 'Wengué', hex: '#3b2314' },
  { id: 'caoba', label: 'Caoba', hex: '#8b3a3a' },
  { id: 'blanco', label: 'Blanco Crema', hex: '#f5f0e8' },
  { id: 'negro', label: 'Negro Mate', hex: '#1a1a1a' },
  { id: 'gris', label: 'Gris Plata', hex: '#9ca3af' },
  { id: 'cedro', label: 'Cedro Rojo', hex: '#7c2d12' },
];

function AcabadoComponent() {
  const [tono, setTono] = useState('roble');
  const [acabado, setAcabado] = useState('mate');
  const tonoObj = TONOS.find(t => t.id === tono);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Tono de tinte</label>
        <div className="grid grid-cols-4 gap-2">
          {TONOS.map(t => (
            <button key={t.id} onClick={() => setTono(t.id)}
              title={t.label}
              className={`flex flex-col items-center gap-1.5 cursor-pointer group`}>
              <div className={`w-10 h-10 rounded-full border-4 transition-all ${tono===t.id ? 'border-[var(--color-primary)] scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: t.hex }} />
              <span className={`text-[9px] font-semibold text-center leading-tight transition-colors ${tono===t.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Tipo de acabado</label>
        <div className="flex gap-2">
          {['mate','brillante','satinado'].map(a => (
            <button key={a} onClick={() => setAcabado(a)}
              className={`flex-1 py-2 rounded-xl border text-[11px] font-bold capitalize transition-all cursor-pointer ${acabado===a ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
        <div className="w-14 h-14 rounded-2xl border-2 border-[var(--color-border)] shrink-0"
          style={{ backgroundColor: tonoObj.hex, boxShadow: acabado==='brillante' ? `0 0 20px ${tonoObj.hex}60, inset 0 1px 0 rgba(255,255,255,0.3)` : 'none' }} />
        <div>
          <p className="text-xs font-black text-[var(--color-text)]">{tonoObj.label}</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">Acabado: <b className="text-[var(--color-text)] capitalize">{acabado}</b></p>
          <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">{acabado === 'brillante' ? 'Refleja la luz, resalta vetas' : acabado === 'satinado' ? 'Suave, brillo parcial' : 'Sin brillo, aspecto natural'}</p>
        </div>
      </div>
    </div>
  );
}

export default function SelectorAcabadoPatasSandbox() {
  return (
    <SandboxLayout
      title="Selector de Acabado de Patas"
      description="Elige el tono de tinte y el tipo de barniz para las patas del mueble"
    >
      <AcabadoComponent />
    </SandboxLayout>
  );
}
