import React, { useState } from 'react';
import { User, Mail, Lock, Search, X } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

export default function InputPremiumSandbox() {
  const [value, setValue] = useState('');
  const [type, setType] = useState('text');
  const [hasLabel, setHasLabel] = useState(true);
  const [hasIcon, setHasIcon] = useState(true);
  const [error, setError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [placeholder, setPlaceholder] = useState('Escribe algo aquí...');

  const icons = { text: <User size={14} />, email: <Mail size={14} />, password: <Lock size={14} />, search: <Search size={14} /> };

  return (
    <SandboxLayout
      title="Input Premium"
      description="Campo de entrada con validación visual, ícono contextual y soporte para múltiples tipos."
      controls={[
        { label: 'Tipo', type: 'select', value: type, options: ['text', 'email', 'password', 'search'], onChange: setType },
        { label: 'Con Label', type: 'toggle', value: hasLabel, onChange: setHasLabel, labels: ['No', 'Sí'] },
        { label: 'Con Ícono', type: 'toggle', value: hasIcon, onChange: setHasIcon, labels: ['No', 'Sí'] },
        { label: 'Error', type: 'toggle', value: error, onChange: setError, labels: ['Off', 'On'] },
        { label: 'Disabled', type: 'toggle', value: disabled, onChange: setDisabled, labels: ['Off', 'On'] },
      ]}
    >
      <div className="w-full space-y-2 text-left">
        {hasLabel && <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Campo de entrada</label>}
        <div className={`flex items-center gap-2.5 bg-[var(--color-surface)] border rounded-xl px-3.5 py-2.5 transition-all ${
          error ? 'border-red-500/60 focus-within:ring-1 focus-within:ring-red-500/40' :
          disabled ? 'border-[var(--color-border)] opacity-50' :
          'border-[var(--color-border)] focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/20'
        }`}>
          {hasIcon && <span className="text-[var(--color-text-muted)] shrink-0">{icons[type]}</span>}
          <input
            type={type}
            value={value}
            onChange={e => setValue(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className="bg-transparent outline-none text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] w-full disabled:cursor-not-allowed"
          />
          {value && !disabled && (
            <button onClick={() => setValue('')} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer flex items-center justify-center"><X size={12} /></button>
          )}
        </div>
        {error && <p className="text-[10px] text-red-400 font-semibold">Este campo es requerido.</p>}
        <p className="text-[10px] text-[var(--color-text-muted)] font-mono">value: "{value}"</p>
      </div>
    </SandboxLayout>
  );
}
