import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

// Componente Local para simulación autónoma en el sandbox
function LocalMagneticGlowInput({
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  disabled = false,
  required = false
}) {
  const [isFocused, setIsFocused] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`group relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-[1px] transition-all duration-300
        ${isFocused ? 'ring-2 ring-[var(--color-primary)]/30 border-transparent' : 'hover:border-[var(--color-primary)]/50'}
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
      `}
    >
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              120px circle at ${mouseX}px ${mouseY}px,
              var(--color-primary) 0%,
              transparent 80%
            )
          `
        }}
      />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="relative w-full rounded-[11px] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 outline-none transition-all z-10"
      />
    </div>
  );
}

export default function MagneticGlowInputSandbox() {
  const [text, setText] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [placeholder, setPlaceholder] = useState('Escribe o busca aquí...');

  const controls = [
    {
      type: 'toggle',
      label: 'Deshabilitar Input',
      value: disabled,
      onChange: setDisabled
    },
    {
      type: 'text',
      label: 'Texto Placeholder',
      value: placeholder,
      onChange: setPlaceholder
    }
  ];

  return (
    <SandboxLayout title="MagneticGlowInput" controls={controls}>
      <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full max-w-md mx-auto">
        <div className="w-full">
          <LocalMagneticGlowInput
            type="text"
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] w-full text-center">
          Valor del input: <span className="font-mono text-[var(--color-text)] font-bold">{text || 'Vacio'}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
