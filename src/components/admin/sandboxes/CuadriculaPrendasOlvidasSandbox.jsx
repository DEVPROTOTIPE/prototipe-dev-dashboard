import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const PRENDAS_PERDIDAS = [
  { id: 1, desc: 'Camisa azul manga larga', talla: 'M', fecha: '2026-06-28', color: 'Azul', tipo: 'Camisa' },
  { id: 2, desc: 'Pantalón negro tipo sastre', talla: '32', fecha: '2026-06-25', color: 'Negro', tipo: 'Pantalón' },
  { id: 3, desc: 'Vestido floral rosado', talla: 'S', fecha: '2026-06-20', color: 'Rosado', tipo: 'Vestido' },
  { id: 4, desc: 'Chaqueta gris con capucha', talla: 'L', fecha: '2026-06-18', color: 'Gris', tipo: 'Chaqueta' },
  { id: 5, desc: 'Calcetines deportivos blancos (par)', talla: 'Único', fecha: '2026-07-01', color: 'Blanco', tipo: 'Calcetines' },
  { id: 6, desc: 'Blusa beige con botones dorados', talla: 'M', fecha: '2026-07-01', color: 'Beige', tipo: 'Blusa' },
];

const ICONOS = { Camisa: '👕', Pantalón: '👖', Vestido: '👗', Chaqueta: '🧥', Calcetines: '🧦', Blusa: '👚', default: '🧺' };

function OlvidasComponent() {
  const [q, setQ] = useState('');
  const filtradas = PRENDAS_PERDIDAS.filter(p =>
    !q || p.desc.toLowerCase().includes(q.toLowerCase()) ||
    p.color.toLowerCase().includes(q.toLowerCase()) ||
    p.tipo.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <input value={q} onChange={e => setQ(e.target.value)}
        placeholder="Buscar por color, tipo o descripción…"
        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/50"
      />
      <p className="text-[10px] text-[var(--color-text-muted)]">{filtradas.length} prenda{filtradas.length !== 1 ? 's' : ''} encontrada{filtradas.length !== 1 ? 's' : ''}</p>

      <div className="flex flex-col gap-2">
        {filtradas.length === 0 && (
          <div className="text-center py-8 text-[var(--color-text-muted)]">
            <p className="text-2xl">🔍</p>
            <p className="text-xs mt-1">Sin resultados para "{q}"</p>
          </div>
        )}
        {filtradas.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl hover:border-[var(--color-primary)]/40 transition-colors">
            <span className="text-2xl">{ICONOS[p.tipo] || ICONOS.default}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-[var(--color-text)] truncate">{p.desc}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">{p.color}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">Talla {p.talla}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] text-[var(--color-text-muted)]">Encontrada</p>
              <p className="text-[9px] font-semibold text-[var(--color-text)]">{p.fecha}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CuadriculaPrendasOlvidasSandbox() {
  return (
    <SandboxLayout
      title="Cuadrícula de Prendas Olvidadas"
      description="Buscador de prendas sin etiqueta por color, tipo o descripción"
    >
      <OlvidasComponent />
    </SandboxLayout>
  );
}
