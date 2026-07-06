import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const FASES = [
  { id: 1, label: 'Recepción', icono: '📥', diasEst: 0, desc: 'El mueble ingresa al taller.' },
  { id: 2, label: 'Desmontaje', icono: '🔧', diasEst: 1, desc: 'Retiro de tela, espuma y accesorios.' },
  { id: 3, label: 'Estructura', icono: '🪚', diasEst: 2, desc: 'Reparación de madera y resortes.' },
  { id: 4, label: 'Tapizado', icono: '🧵', diasEst: 4, desc: 'Corte, ajuste y costura de tela nueva.' },
  { id: 5, label: 'Acabados', icono: '✨', diasEst: 6, desc: 'Patas, decoración y control de calidad.' },
  { id: 6, label: 'Entrega', icono: '🚚', diasEst: 7, desc: 'Despacho o recogida en taller.' },
];

function StepperComponent() {
  const [faseActual, setFaseActual] = useState(3);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        {FASES.map((f, idx) => {
          const estado = f.id < faseActual ? 'done' : f.id === faseActual ? 'active' : 'pending';
          return (
            <div key={f.id} className="flex gap-3 relative">
              {idx < FASES.length - 1 && (
                <div className="absolute left-[18px] top-9 bottom-0 w-0.5"
                  style={{ background: f.id < faseActual ? 'var(--color-primary)' : 'var(--color-border)', height: '100%', minHeight: '32px' }} />
              )}
              <div className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-full border-2 shrink-0 mt-1 transition-all ${
                estado === 'done' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' :
                estado === 'active' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)] animate-pulse' :
                'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]'
              }`}>
                {estado === 'done' ? '✓' : f.icono}
              </div>
              <div className={`pb-6 flex-1 ${idx === FASES.length - 1 ? 'pb-0' : ''}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-black ${estado === 'active' ? 'text-[var(--color-primary)]' : estado === 'done' ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>{f.label}</p>
                  <span className="text-[9px] text-[var(--color-text-muted)]">Día +{f.diasEst}</span>
                </div>
                <p className={`text-[10px] mt-0.5 ${estado === 'pending' ? 'text-[var(--color-text-muted)] opacity-50' : 'text-[var(--color-text-muted)]'}`}>{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-1.5 mt-1">
        <button onClick={() => setFaseActual(f => Math.max(1, f - 1))}
          disabled={faseActual === 1}
          className="flex-1 py-1.5 rounded-xl border border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] disabled:opacity-30 cursor-pointer hover:border-[var(--color-primary)]/50">
          ← Retroceder
        </button>
        <button onClick={() => setFaseActual(f => Math.min(FASES.length, f + 1))}
          disabled={faseActual === FASES.length}
          className="flex-1 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-[11px] font-black disabled:opacity-30 cursor-pointer hover:opacity-90">
          Avanzar →
        </button>
      </div>
    </div>
  );
}

export default function SeguimientoFasesRestauracionSandbox() {
  return (
    <SandboxLayout
      title="Seguimiento de Fases de Restauración"
      description="Stepper de 6 etapas del proceso de tapizado. Usa los botones para simular avance."
    >
      <StepperComponent />
    </SandboxLayout>
  );
}
