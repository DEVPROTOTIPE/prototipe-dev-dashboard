import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion, AnimatePresence } from 'framer-motion';

// Componente Local para el Sandbox de pruebas
function LocalPlaceholderVanishInput({
  value = '',
  onChange,
  placeholder = 'Buscar producto...',
  disabled = false
}) {
  const [isFocused, setIsFocused] = useState(false);
  const showPlaceholder = !value && !isFocused;
  const placeholderLetters = placeholder.split('');

  return (
    <div className="relative w-full rounded-xl bg-[var(--color-surface)]">
      <AnimatePresence mode="popLayout">
        {showPlaceholder && (
          <div className="absolute left-4 top-3.5 flex pointer-events-none select-none overflow-hidden z-20">
            {placeholderLetters.map((char, index) => (
              <motion.span
                key={index}
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: 0, opacity: 0.5 }}
                exit={{
                  y: -15,
                  opacity: 0,
                  transition: {
                    duration: 0.25,
                    delay: index * 0.02,
                    ease: "easeOut"
                  }
                }}
                className="text-sm font-medium text-[var(--color-text-muted)]/50 whitespace-pre"
              >
                {char}
              </motion.span>
            ))}
          </div>
        )}
      </AnimatePresence>
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full rounded-xl border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 transition-all duration-200 z-10 relative"
      />
    </div>
  );
}

export default function PlaceholderVanishInputSandbox() {
  const [text, setText] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [placeholder, setPlaceholder] = useState('Buscar repuesto agrícola...');

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
    <SandboxLayout title="PlaceholderVanishInput" controls={controls}>
      <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full max-w-md mx-auto">
        <div className="w-full">
          <LocalPlaceholderVanishInput
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
