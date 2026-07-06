import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const MATERIALES = [
  {
    id: 'cuero', label: 'Cuero / Cuero Sintético', icono: '🟤',
    pasos: ['Elimina el polvo con paño suave seco.','Aplica crema hidratante para cuero mensualmente.','Limpia manchas frescas con paño húmedo y jabón neutro.','Evita la exposición directa al sol para prevenir cuarteado.'],
    si: ['Crema hidratante para cuero','Paño de microfibra','Limpiador de cuero pH neutro'],
    no: ['Agua en exceso','Alcohol o acetona','Detergente con blanqueador'],
  },
  {
    id: 'tela', label: 'Tela / Lino / Algodón', icono: '🔵',
    pasos: ['Aspira la superficie semanalmente.','Para derrames: absorbe inmediatamente con paño limpio (no frotes).','Usa spray limpia-tapicería con movimientos circulares.','Deja secar completamente antes de usar.'],
    si: ['Limpiador en espuma para tapicería','Aspiradora con cabezal suave','Agua fría'],
    no: ['Agua caliente','Frotar con fuerza','Lejía o cloro'],
  },
  {
    id: 'microfibra', label: 'Microfibra / Terciopelo', icono: '🟣',
    pasos: ['Cepilla en una sola dirección para mantener el pelo.','Limpia manchas con paño húmedo, sin restregar.','Usa limpiador en seco para manchas difíciles.','Evita planchado o calor directo.'],
    si: ['Limpiador en seco','Cepillo suave de cerdas naturales','Paño de algodón ligeramente húmedo'],
    no: ['Vapor o calor directo','Detergentes líquidos','Fregar en múltiples direcciones'],
  },
];

function ManualComponent() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="flex flex-col gap-2">
      {MATERIALES.map(m => {
        const open = expanded === m.id;
        return (
          <div key={m.id} className={`border rounded-2xl overflow-hidden transition-all ${open ? 'border-[var(--color-primary)]/50' : 'border-[var(--color-border)]'}`}>
            <button onClick={() => setExpanded(open ? null : m.id)}
              className="w-full flex items-center justify-between p-3.5 bg-[var(--color-surface)] cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-lg">{m.icono}</span>
                <span className="text-xs font-black text-[var(--color-text)]">{m.label}</span>
              </div>
              <span className={`text-[var(--color-text-muted)] text-sm transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {open && (
              <div className="p-4 flex flex-col gap-4 bg-[var(--color-surface-2)] border-t border-[var(--color-border)]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Pasos de limpieza</p>
                  {m.pasos.map((p, i) => (
                    <div key={i} className="flex gap-2 mb-1.5">
                      <span className="text-[10px] font-black text-[var(--color-primary)] shrink-0 w-4">{i+1}.</span>
                      <span className="text-[10px] text-[var(--color-text)] leading-relaxed">{p}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-black text-green-400 mb-1">✓ Usar</p>
                    {m.si.map(s => <p key={s} className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">· {s}</p>)}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-red-400 mb-1">✗ Evitar</p>
                    {m.no.map(n => <p key={n} className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">· {n}</p>)}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ManualCuidadoTapiceriaSandbox() {
  return (
    <SandboxLayout
      title="Manual de Cuidado de Tapicería"
      description="Accordion por tipo de material con pasos de limpieza y advertencias"
    >
      <ManualComponent />
    </SandboxLayout>
  );
}
