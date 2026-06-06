import React, { useState } from 'react';
import { Zap, Loader } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

export default function BotonPremiumSandbox() {
  const [variant, setVariant] = useState('primary');
  const [size, setSize] = useState('md');
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [label, setLabel] = useState('Guardar Cambios');
  const [hasIcon, setHasIcon] = useState(true);

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30',
    secondary: 'bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-2)]/80 text-[var(--color-text)] border border-[var(--color-border)]',
    danger: 'bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30',
    ghost: 'bg-transparent hover:bg-[var(--color-surface-2)]/40 text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
    gradient: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-[10px] rounded-lg gap-1',
    md: 'px-4 py-2.5 text-xs rounded-xl gap-1.5',
    lg: 'px-6 py-3.5 text-sm rounded-2xl gap-2',
  };

  return (
    <SandboxLayout
      title="Botón Premium"
      description="Átomo de botón con 5 variantes, 3 tamaños, estado loading/disabled e ícono opcional."
      controls={[
        { label: 'Variante', type: 'select', value: variant, options: Object.keys(variants), onChange: setVariant },
        { label: 'Tamaño', type: 'select', value: size, options: ['sm', 'md', 'lg'], onChange: setSize },
        { label: 'Con Ícono', type: 'toggle', value: hasIcon, onChange: setHasIcon, labels: ['No', 'Sí'] },
        { label: 'Loading', type: 'toggle', value: loading, onChange: setLoading, labels: ['Off', 'On'] },
        { label: 'Disabled', type: 'toggle', value: disabled, onChange: setDisabled, labels: ['Off', 'On'] },
        { label: 'Texto', type: 'text', value: label, onChange: setLabel },
      ]}
    >
      <div className="flex flex-col items-center gap-8">
        <button
          disabled={disabled || loading}
          className={`flex items-center justify-center font-bold transition-all duration-200 active:scale-95 cursor-pointer ${sizes[size]} ${variants[variant]} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
        >
          {loading
            ? <Loader size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} className="animate-spin" />
            : hasIcon && <Zap size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} />
          }
          {label}
        </button>
        <div className="flex gap-2 flex-wrap justify-center">
          {Object.keys(variants).map(v => (
            <button
              key={v}
              onClick={() => setVariant(v)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                variant === v ? 'bg-indigo-600 text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
              }`}
            >{v}</button>
          ))}
        </div>
      </div>
    </SandboxLayout>
  );
}
