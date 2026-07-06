import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const META = 10; // lavadas para lavada gratis

function PuntosComponent() {
  const [lavadas, setLavadas] = useState(7);
  const puntos = lavadas * 150;
  const progreso = (lavadas % META) / META;
  const cupones = [
    { id: 1, desc: '10% OFF próximo servicio', vence: '2026-07-31', activo: true },
    { id: 2, desc: 'Planchado gratis', vence: '2026-08-15', activo: lavadas >= 5 },
  ];

  const dash = 2 * Math.PI * 44;
  const dashOffset = dash * (1 - progreso);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/30 rounded-2xl">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-primary)" strokeWidth="8"
              strokeDasharray={dash} strokeDashoffset={dashOffset}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-[var(--color-primary)]">{lavadas % META}</span>
            <span className="text-[9px] text-[var(--color-text-muted)]">/{META}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-black text-[var(--color-text)]">Lavadas acumuladas</p>
          <p className="text-2xl font-black text-[var(--color-primary)]">{lavadas}</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">{META - (lavadas % META)} lavadas para la próxima <b>gratis</b></p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 flex flex-col items-center gap-1 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
          <span className="text-lg">⭐</span>
          <span className="text-sm font-black text-[var(--color-text)]">{puntos.toLocaleString()}</span>
          <span className="text-[10px] text-[var(--color-text-muted)]">Puntos</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
          <span className="text-lg">🎟️</span>
          <span className="text-sm font-black text-[var(--color-text)]">{cupones.filter(c => c.activo).length}</span>
          <span className="text-[10px] text-[var(--color-text-muted)]">Cupones</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Cupones activos</p>
        {cupones.map(c => (
          <div key={c.id} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${c.activo ? 'border-green-500/40 bg-green-500/10' : 'border-[var(--color-border)] opacity-40'}`}>
            <div>
              <p className="text-[11px] font-bold text-[var(--color-text)]">{c.desc}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Vence: {c.vence}</p>
            </div>
            {c.activo && <span className="text-[10px] font-black text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">Activo</span>}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-1">
        <button onClick={() => setLavadas(l => Math.max(0, l - 1))}
          className="flex-1 py-1.5 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] cursor-pointer hover:border-[var(--color-primary)]/50">
          − Lavada
        </button>
        <button onClick={() => setLavadas(l => l + 1)}
          className="flex-1 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-black cursor-pointer hover:opacity-90">
          + Lavada
        </button>
      </div>
    </div>
  );
}

export default function SaldoPuntosFidelizacionSandbox() {
  return (
    <SandboxLayout
      title="Saldo de Puntos y Fidelización"
      description="Visualiza lavadas acumuladas, puntos y cupones activos. Usa los botones para simular."
    >
      <PuntosComponent />
    </SandboxLayout>
  );
}
