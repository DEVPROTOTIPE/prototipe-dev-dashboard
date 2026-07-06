import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

export default function TarjetaPedidoAdminSandbox() {
  const [status, setStatus] = useState('pendiente');
  const [expanded, setExpanded] = useState(false);

  const statuses = {
    pendiente: { label: 'Pendiente', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    en_preparacion: { label: 'En Preparación', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    en_ruta: { label: 'En Ruta', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
    entregado: { label: 'Entregado', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    cancelado: { label: 'Cancelado', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
  };
  const st = statuses[status];

  return (
    <SandboxLayout
      title="Tarjeta de Pedido Admin"
      description="Tarjeta colapsable para gestión de pedidos en panel admin. Incluye chip de estado y acciones rápidas."
      controls={[
        { label: 'Estado', type: 'select', value: status, options: Object.keys(statuses), onChange: setStatus },
        { label: 'Expandida', type: 'toggle', value: expanded, onChange: setExpanded, labels: ['No', 'Sí'] },
      ]}
    >
      <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden text-left">
        {/* Header colapsable */}
        <button onClick={() => setExpanded(!expanded)} className="w-full p-3 flex items-center justify-between gap-2 hover:bg-[var(--color-surface-2)]/40 transition-colors cursor-pointer border-none bg-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600/20 rounded-xl flex items-center justify-center text-sm font-black text-indigo-400">#</div>
            <div className="text-left">
              <p className="text-xs font-bold text-[var(--color-text)]">Pedido #A1B2C</p>
              <p className="text-[9px] text-[var(--color-text-muted)]">Carlos Gómez · 3 items</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${st.color}`}>{st.label}</span>
            <ChevronDown size={12} className={`text-[var(--color-text-muted)] transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </button>
        {/* Panel expandido */}
        {expanded && (
          <div className="border-t border-[var(--color-border)] p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><p className="text-[var(--color-text-muted)] font-medium">Total</p><p className="font-bold text-[var(--color-text)]">$125.000</p></div>
              <div><p className="text-[var(--color-text-muted)] font-medium">Dirección</p><p className="font-bold text-[var(--color-text)]">Cra 15 #45-23</p></div>
            </div>
            <div className="flex gap-1.5">
              <button className="flex-1 py-1.5 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold rounded-xl cursor-pointer hover:bg-emerald-600/20 transition-all">✓ Completar</button>
              <button className="flex-1 py-1.5 bg-red-600/10 border border-red-500/30 text-red-400 text-[9px] font-bold rounded-xl cursor-pointer hover:bg-red-600/20 transition-all">✕ Cancelar</button>
              <button className="px-2.5 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-[9px] font-bold rounded-xl cursor-pointer hover:bg-[var(--color-surface-2)]/80 transition-all">📱 WA</button>
            </div>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
