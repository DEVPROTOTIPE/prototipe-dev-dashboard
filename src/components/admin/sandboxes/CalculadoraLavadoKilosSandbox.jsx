import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const RANGOS = [
  { min: 1, max: 5, precio: 8000 },
  { min: 6, max: 10, precio: 14000 },
  { min: 11, max: 15, precio: 20000 },
  { min: 16, max: 20, precio: 26000 },
  { min: 21, max: 30, precio: 35000 },
];

function fmt(n) { return '$' + n.toLocaleString('es-CO'); }

function CalculadoraComponent() {
  const [kg, setKg] = useState(5);
  const rango = RANGOS.find(r => kg >= r.min && kg <= r.max) || RANGOS[RANGOS.length - 1];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-[var(--color-text-muted)]">Peso de la ropa</span>
          <span className="text-lg font-black text-[var(--color-primary)]">{kg} kg</span>
        </div>
        <input
          type="range" min={1} max={30} value={kg}
          onChange={e => setKg(Number(e.target.value))}
          className="w-full accent-[var(--color-primary)] h-2 rounded-full cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[var(--color-text-muted)]">
          <span>1 kg</span><span>30 kg</span>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Desglose del cobro</p>
        {RANGOS.map(r => (
          <div key={r.min} className={`flex justify-between items-center p-2.5 rounded-xl border transition-all ${
            rango === r
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)]'
          }`}>
            <span className="text-[11px] font-semibold">{r.min}–{r.max} kg</span>
            <span className="text-[11px] font-bold">{fmt(r.precio)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-2xl p-4">
        <span className="text-xs font-black text-[var(--color-text)]">Total estimado</span>
        <span className="text-xl font-black text-[var(--color-primary)]">{fmt(rango.precio)}</span>
      </div>
    </div>
  );
}

export default function CalculadoraLavadoKilosSandbox() {
  return (
    <SandboxLayout
      title="Calculadora de Lavado por Kilos"
      description="Arrastra el slider para estimar el costo según el peso de la ropa"
    >
      <CalculadoraComponent />
    </SandboxLayout>
  );
}
