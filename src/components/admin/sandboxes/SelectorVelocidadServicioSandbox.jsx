import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const OPCIONES = [
  { id: 'normal', label: 'Normal', desc: '3 a 5 días hábiles', recargo: 0, icono: '📦', color: 'text-slate-400 border-slate-500/40 bg-slate-500/10' },
  { id: 'mismo_dia', label: 'Mismo día', desc: 'Entrega antes de las 8 PM', recargo: 50, icono: '🚀', color: 'text-orange-400 border-orange-500/40 bg-orange-500/10' },
  { id: 'express', label: 'Express', desc: 'Entrega en 4 horas', recargo: 100, icono: '⚡', color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10' },
];

const BASE = 15000;
function fmt(n) { return '$' + n.toLocaleString('es-CO'); }

function VelocidadComponent() {
  const [selected, setSelected] = useState('normal');
  const opcion = OPCIONES.find(o => o.id === selected);
  const total = BASE + BASE * opcion.recargo / 100;

  return (
    <div className="flex flex-col gap-4">
      {OPCIONES.map(o => (
        <button key={o.id} onClick={() => setSelected(o.id)}
          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${selected===o.id ? o.color + ' border-opacity-100' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/30'}`}>
          <span className="text-2xl">{o.icono}</span>
          <div className="flex-1">
            <p className={`text-sm font-black ${selected===o.id ? '' : 'text-[var(--color-text)]'}`}>{o.label}</p>
            <p className={`text-[11px] ${selected===o.id ? 'opacity-70' : 'text-[var(--color-text-muted)]'}`}>{o.desc}</p>
          </div>
          <div className="flex flex-col items-end">
            {o.recargo > 0
              ? <span className="text-[11px] font-black">+{o.recargo}%</span>
              : <span className="text-[11px] font-bold text-green-400">Sin recargo</span>
            }
          </div>
        </button>
      ))}

      <div className="flex items-center justify-between p-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-2xl">
        <div>
          <p className="text-[10px] text-[var(--color-text-muted)]">Base {fmt(BASE)} {opcion.recargo > 0 && `+ ${opcion.recargo}% recargo`}</p>
          <p className="text-xs font-black text-[var(--color-text)]">Total con servicio {opcion.label}</p>
        </div>
        <span className="text-xl font-black text-[var(--color-primary)]">{fmt(total)}</span>
      </div>
    </div>
  );
}

export default function SelectorVelocidadServicioSandbox() {
  return (
    <SandboxLayout
      title="Selector de Velocidad de Servicio"
      description="Elige entre Normal, Mismo día o Express. El precio se actualiza en tiempo real."
    >
      <VelocidadComponent />
    </SandboxLayout>
  );
}
