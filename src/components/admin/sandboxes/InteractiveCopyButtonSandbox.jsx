import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion, AnimatePresence } from 'framer-motion';

// Componente Local para simulación autónoma en el sandbox
function LocalInteractiveCopyButton({
  textToCopy = '',
  label = 'Copiar',
  successLabel = 'Copiado',
  disabled = false,
  className = ''
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (disabled || !textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallo al copiar:', err);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      disabled={disabled || !textToCopy}
      whileTap={{ scale: 0.96 }}
      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold select-none outline-none transition-all duration-300
        ${copied 
          ? 'bg-green-500/15 border-green-500 text-green-500 ring-2 ring-green-500/10' 
          : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]/60'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? 'success' : 'passive'}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -5, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
              <span>{successLabel}</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 fill-current opacity-70" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
              </svg>
              <span>{label}</span>
            </>
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export default function InteractiveCopyButtonSandbox() {
  const [disabled, setDisabled] = useState(false);
  const [textToCopy, setTextToCopy] = useState('DESCUENTO-ATOMIC-2026');
  const [label, setLabel] = useState('Copiar Cupón');

  const controls = [
    {
      type: 'toggle',
      label: 'Deshabilitar Botón',
      value: disabled,
      onChange: setDisabled
    },
    {
      type: 'text',
      label: 'Texto a Copiar',
      value: textToCopy,
      onChange: setTextToCopy
    },
    {
      type: 'text',
      label: 'Texto del Botón',
      value: label,
      onChange: setLabel
    }
  ];

  return (
    <SandboxLayout title="InteractiveCopyButton" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <LocalInteractiveCopyButton
          textToCopy={textToCopy}
          label={label}
          disabled={disabled}
        />
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] w-full text-center">
          Valor configurado en disco: <span className="font-mono text-[var(--color-text)] font-bold">{textToCopy || 'Vacio'}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
