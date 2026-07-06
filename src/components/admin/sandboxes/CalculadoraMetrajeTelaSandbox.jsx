import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const MUEBLES = [
  { id: 'sofa2', label: 'Sofá 2 puestos', metros: 8 },
  { id: 'sofa3', label: 'Sofá 3 puestos', metros: 11 },
  { id: 'sofa4', label: 'Sofá 4 puestos (L)', metros: 14 },
  { id: 'silla', label: 'Silla de comedor', metros: 2.5 },
  { id: 'poltrona', label: 'Poltrona / Bergère', metros: 6 },
  { id: 'cabecero', label: 'Cabecero de cama', metros: 4 },
  { id: 'puff', label: 'Puff / Otomana', metros: 1.8 },
];

const PRECIO_METRO = 55000;
const MARGEN = 0.10;
function fmt(n) { return '$' + Math.round(n).toLocaleString('es-CO'); }

function MetrajeComponent() {
  const [muebleId, setMuebleId] = useState('sofa3');
  const mueble = MUEBLES.find(m => m.id === muebleId);
  const metrosBase = mueble.metros;
  const metrosConMargen = metrosBase * (1 + MARGEN);
  const costoEstimado = metrosConMargen * PRECIO_METRO;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Tipo de mueble</label>
        <div className="flex flex-col gap-1.5">
          {MUEBLES.map(m => (
            <button key={m.id} onClick={() => setMuebleId(m.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${muebleId===m.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40'}`}>
              <span className={`text-[11px] font-bold ${muebleId===m.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>{m.label}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">{m.metros} m²</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Desglose de metraje</p>
        <div className="flex justify-between text-[11px]">
          <span className="text-[var(--color-text-muted)]">Metros base</span>
          <span className="font-bold text-[var(--color-text)]">{metrosBase} m²</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-[var(--color-text-muted)]">Margen de seguridad (+10%)</span>
          <span className="font-bold text-[var(--color-text)]">+{(metrosBase * MARGEN).toFixed(1)} m²</span>
        </div>
        <div className="w-full h-px bg-[var(--color-border)]" />
        <div className="flex justify-between">
          <span className="text-xs font-black text-[var(--color-text)]">Total recomendado</span>
          <span className="text-sm font-black text-[var(--color-primary)]">{metrosConMargen.toFixed(1)} m²</span>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-2xl">
        <div>
          <p className="text-[10px] text-[var(--color-text-muted)]">{fmt(PRECIO_METRO)}/m² promedio</p>
          <p className="text-xs font-black text-[var(--color-text)]">Costo estimado de tela</p>
        </div>
        <span className="text-xl font-black text-[var(--color-primary)]">{fmt(costoEstimado)}</span>
      </div>
    </div>
  );
}

export default function CalculadoraMetrajeTelaSandbox() {
  return (
    <SandboxLayout
      title="Calculadora de Metraje de Tela"
      description="Selecciona el tipo de mueble para obtener los metros necesarios con margen incluido"
    >
      <MetrajeComponent />
    </SandboxLayout>
  );
}
