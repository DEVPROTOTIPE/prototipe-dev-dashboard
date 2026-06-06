import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

function QuantitySelector({ 
  value, 
  onChange, 
  min = 1, 
  max = 10, 
  size = 'md',
  className = '' 
}) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const isSm = size === 'sm';
  const containerHeight = isSm ? 'h-11' : 'h-14';
  const btnSize = isSm ? 'w-8 h-8' : 'w-11 h-11';
  const fontSize = isSm ? 'text-sm' : 'text-base';
  const iconSize = isSm ? 13 : 16;

  return (
    <div className={`flex items-center bg-[var(--color-surface-2)] rounded-full p-1 border border-[var(--color-border)] shrink-0 ${containerHeight} ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className={`${btnSize} rounded-full flex items-center justify-center text-[var(--color-text)] bg-[var(--color-surface)] shadow-sm hover:bg-[var(--color-surface-2)] transition-transform active:scale-90 disabled:opacity-40`}
        aria-label="Disminuir cantidad"
      >
        <Minus size={iconSize} />
      </button>
      
      <span className={`w-8 text-center font-bold text-[var(--color-text)] select-none ${fontSize}`}>
        {value}
      </span>
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className={`${btnSize} rounded-full flex items-center justify-center text-[var(--color-text)] bg-[var(--color-surface)] shadow-sm hover:bg-[var(--color-surface-2)] transition-transform active:scale-90 disabled:opacity-40`}
        aria-label="Aumentar cantidad"
      >
        <Plus size={iconSize} />
      </button>
    </div>
  );
}

export default function QuantitySelectorSandbox() {
  const [value, setValue] = useState(2);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(8);
  const [size, setSize] = useState('md');

  return (
    <SandboxLayout
      title="Quantity Selector"
      description="Control atómico en píldora con micro-interacciones de escala y limitador rígido de bordes."
      controls={[
        { label: 'Tamaño', type: 'select', value: size, options: ['sm', 'md'], onChange: setSize },
        { label: 'Mínimo', type: 'number', value: min, onChange: (val) => setMin(Number(val)) },
        { label: 'Máximo', type: 'number', value: max, onChange: (val) => setMax(Number(val)) },
      ]}
    >
      <div className="flex flex-col items-center gap-4 text-left">
        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] self-start">Selección de Artículos</label>
        
        <QuantitySelector
          value={value}
          onChange={setValue}
          min={min}
          max={max}
          size={size}
        />

        <div className="w-full flex justify-between items-center bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl p-3 text-[10px]">
          <span className="font-semibold text-[var(--color-text-muted)]">Cantidad (Padre):</span>
          <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {value} (Mín: {min}, Máx: {max})
          </span>
        </div>
      </div>
    </SandboxLayout>
  );
}
