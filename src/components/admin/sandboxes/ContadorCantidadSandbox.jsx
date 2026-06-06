import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

export default function ContadorCantidadSandbox() {
  const [qty, setQty] = useState(1);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(10);
  const [size, setSize] = useState('md');

  const sizes = { sm: 'p-1', md: 'p-2', lg: 'p-3' };
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  const increment = () => setQty(q => Math.min(q + 1, max));
  const decrement = () => setQty(q => Math.max(q - 1, min));

  return (
    <SandboxLayout
      title="Contador de Cantidad"
      description="Selector numérico con límites min/max, validación y 3 tamaños. Usado en carrito y pedidos."
      controls={[
        { label: 'Mínimo', type: 'number', value: min, onChange: v => { setMin(Number(v)); if (qty < Number(v)) setQty(Number(v)); } },
        { label: 'Máximo', type: 'number', value: max, onChange: v => { setMax(Number(v)); if (qty > Number(v)) setQty(Number(v)); } },
        { label: 'Tamaño', type: 'select', value: size, options: ['sm', 'md', 'lg'], onChange: setSize },
      ]}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={decrement}
            disabled={qty <= min}
            className={`${sizes[size]} px-3 hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-[var(--color-text)] flex items-center justify-center`}
          ><Minus size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} /></button>
          <span className={`${textSizes[size]} font-black text-[var(--color-text)] px-4 tabular-nums min-w-[3ch] text-center`}>{qty}</span>
          <button
            onClick={increment}
            disabled={qty >= max}
            className={`${sizes[size]} px-3 hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-[var(--color-text)] flex items-center justify-center`}
          ><Plus size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} /></button>
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-mono text-[var(--color-text-muted)]">qty: <span className="text-indigo-400 font-bold">{qty}</span></p>
          <div className="flex gap-1 justify-center">
            {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(n => (
              <div key={n} className={`w-1.5 h-1.5 rounded-full transition-all ${n <= qty ? 'bg-indigo-500' : 'bg-[var(--color-surface-2)]'}`} />
            ))}
          </div>
        </div>
      </div>
    </SandboxLayout>
  );
}
