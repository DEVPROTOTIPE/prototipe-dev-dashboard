import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

export default function StepperPedidosSandbox() {
  const STEPS = [
    { id: 0, label: 'Recibido', icon: '📥', desc: 'Pedido registrado en el sistema.' },
    { id: 1, label: 'Alistamiento', icon: '📦', desc: 'Preparando los productos del pedido.' },
    { id: 2, label: 'En Ruta', icon: '🚚', desc: 'El pedido está en camino al cliente.' },
    { id: 3, label: 'Entregado', icon: '✅', desc: 'Entrega confirmada exitosamente.' },
  ];
  const [active, setActive] = useState(1);
  const [cancelled, setCancelled] = useState(false);

  return (
    <SandboxLayout
      title="Stepper de Seguimiento de Pedidos"
      description="Línea de tiempo reactiva de 4 hitos operativos. Soporta cancelaciones y microanimaciones."
      controls={[
        { label: 'Paso activo', type: 'select', value: String(active), options: ['0', '1', '2', '3'], onChange: v => { setActive(Number(v)); setCancelled(false); } },
        { label: 'Cancelado', type: 'toggle', value: cancelled, onChange: v => { setCancelled(v); if (v) setActive(0); }, labels: ['No', 'Sí'] },
      ]}
    >
      <div className="w-full space-y-4 text-left">
        {/* Timeline visual */}
        <div className="flex items-center w-full">
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base border-2 transition-all ${
                  cancelled && idx === 0 ? 'border-red-500 bg-red-500/10 text-red-400' :
                  idx < active ? 'border-indigo-500 bg-indigo-600 text-white' :
                  idx === active ? 'border-indigo-500 bg-indigo-600/20 text-indigo-400 ring-2 ring-indigo-500/30' :
                  'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                }`}>
                  {cancelled && idx === 0 ? '❌' : step.icon}
                </div>
                <span className={`text-[9px] font-bold text-center leading-tight ${
                  idx === active && !cancelled ? 'text-indigo-400' : 'text-[var(--color-text-muted)]'
                }`}>{cancelled && idx === 0 ? 'Cancelado' : step.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${
                  cancelled ? 'bg-red-500/20' :
                  idx < active ? 'bg-indigo-500' : 'bg-[var(--color-border)]'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        {/* Descripción del paso activo */}
        {!cancelled && (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
            <p className="text-[10px] font-semibold text-indigo-400">{STEPS[active]?.desc}</p>
          </div>
        )}
        {cancelled && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <p className="text-[10px] font-semibold text-red-400">Pedido cancelado por el administrador.</p>
          </div>
        )}
        {/* Navegación rápida */}
        <div className="flex gap-2 justify-center">
          <button onClick={() => { setActive(a => Math.max(0, a - 1)); setCancelled(false); }} disabled={active <= 0 || cancelled}
            className="px-3 py-1.5 text-[10px] font-bold bg-[var(--color-surface-2)] text-[var(--color-text-muted)] rounded-xl cursor-pointer disabled:opacity-30 hover:bg-[var(--color-surface-2)]/80 transition-all">
            ← Atrás
          </button>
          <button onClick={() => { setActive(a => Math.min(3, a + 1)); setCancelled(false); }} disabled={active >= 3 || cancelled}
            className="px-3 py-1.5 text-[10px] font-bold bg-indigo-600 text-white rounded-xl cursor-pointer disabled:opacity-30 hover:bg-indigo-500 transition-all">
            Siguiente →
          </button>
        </div>
      </div>
    </SandboxLayout>
  );
}
