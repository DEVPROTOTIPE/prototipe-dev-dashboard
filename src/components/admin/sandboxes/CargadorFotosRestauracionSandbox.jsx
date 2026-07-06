import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const ZONAS = [
  { id: 'frontal', label: '📷 Vista Frontal', placeholder: 'Describe el daño frontal…' },
  { id: 'lateral', label: '📐 Vista Lateral', placeholder: 'Describe el estado lateral…' },
  { id: 'detalle', label: '🔍 Detalle del Daño', placeholder: 'Describe el tipo de desgaste…' },
  { id: 'extra', label: '📝 Notas Adicionales', placeholder: 'Cualquier detalle extra…' },
];

function FotosComponent() {
  const [zonas, setZonas] = useState({});
  const set = (k, v) => setZonas(z => ({ ...z, [k]: v }));

  const completadas = ZONAS.filter(z => zonas[z.id]?.trim()).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Registro de estado del mueble</p>
        <span className="text-[10px] font-bold text-[var(--color-primary)]">{completadas}/{ZONAS.length} zonas</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ZONAS.map(z => (
          <div key={z.id} className={`flex flex-col gap-2 p-3 rounded-2xl border transition-all ${zonas[z.id]?.trim() ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`}>
            <div className="w-full h-16 rounded-xl bg-[var(--color-surface-2)] border border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[var(--color-primary)]/50 transition-colors">
              <span className="text-lg">{zonas[z.id]?.trim() ? '✅' : '📎'}</span>
              <span className="text-[9px] text-[var(--color-text-muted)]">{zonas[z.id]?.trim() ? 'Registrado' : 'Foto simulada'}</span>
            </div>
            <p className="text-[10px] font-bold text-[var(--color-text)]">{z.label}</p>
            <textarea
              value={zonas[z.id] || ''}
              onChange={e => set(z.id, e.target.value)}
              placeholder={z.placeholder}
              rows={2}
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-2 py-1.5 text-[10px] text-[var(--color-text)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/50"
            />
          </div>
        ))}
      </div>

      <div className="w-full h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--color-primary)] rounded-full transition-all" style={{ width: `${(completadas / ZONAS.length) * 100}%` }} />
      </div>

      {completadas === ZONAS.length && (
        <p className="text-[11px] text-center text-green-400 font-black">✓ Formulario de diagnóstico completo</p>
      )}
    </div>
  );
}

export default function CargadorFotosRestauracionSandbox() {
  return (
    <SandboxLayout
      title="Cargador de Fotos de Restauración"
      description="Registra el estado del mueble por zona con descripción de cada ángulo"
    >
      <FotosComponent />
    </SandboxLayout>
  );
}
