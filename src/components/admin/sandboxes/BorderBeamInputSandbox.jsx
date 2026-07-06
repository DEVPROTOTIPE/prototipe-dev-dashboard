import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';

// Componente Local para el Sandbox de pruebas
function LocalBorderBeamInput({
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  disabled = false,
  error = false
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-[var(--color-border)] p-[1px] transition-all duration-300
      ${isFocused ? 'ring-2 ring-[var(--color-primary)]/30' : ''}
      ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
    `}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: isFocused ? 2 : 4,
          ease: "linear"
        }}
        className="absolute w-[300%] h-[300%] top-1/2 left-1/2 pointer-events-none z-0"
        style={{
          background: `conic-gradient(from 0deg, transparent 60%, ${error ? '#ef4444' : 'var(--color-primary)'} 85%, ${error ? '#f87171' : 'var(--color-secondary)'} 95%, transparent 100%)`,
          x: '-50%',
          y: '-50%',
          transformOrigin: 'center center'
        }}
      />
      <div className="relative w-full rounded-[11px] bg-[var(--color-surface)] z-10">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 outline-none transition-colors"
        />
      </div>
    </div>
  );
}

export default function BorderBeamInputSandbox() {
  const [text, setText] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState(false);
  const [placeholder, setPlaceholder] = useState('Ingresa código de descuento...');

  const controls = [
    {
      type: 'toggle',
      label: 'Deshabilitar Input',
      value: disabled,
      onChange: setDisabled
    },
    {
      type: 'toggle',
      label: 'Mostrar Error',
      value: error,
      onChange: setError
    },
    {
      type: 'text',
      label: 'Texto Placeholder',
      value: placeholder,
      onChange: setPlaceholder
    }
  ];

  return (
    <SandboxLayout title="BorderBeamInput" controls={controls}>
      <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full max-w-md mx-auto">
        <div className="w-full">
          <LocalBorderBeamInput
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
            error={error}
          />
        </div>
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] w-full text-center">
          Valor ingresado: <span className="font-mono text-[var(--color-text)] font-bold">{text || 'Ninguno'}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
