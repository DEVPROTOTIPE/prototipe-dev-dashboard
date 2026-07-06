import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';

// Componente Local para el Sandbox de pruebas
function LocalBorderBeamButton({
  children,
  onClick,
  disabled = false,
  className = ''
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.96 }}
      className={`relative overflow-hidden rounded-xl bg-[var(--color-border)] p-[1px] transition-all duration-300 outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <motion.div
        animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
        transition={isHovered ? {
          repeat: Infinity,
          duration: 2,
          ease: "linear"
        } : { duration: 0.5 }}
        className="absolute w-[300%] h-[300%] top-1/2 left-1/2 pointer-events-none z-0"
        style={{
          background: `conic-gradient(from 0deg, transparent 60%, var(--color-primary) 85%, var(--color-secondary) 95%, transparent 100%)`,
          x: '-50%',
          y: '-50%',
          transformOrigin: 'center center'
        }}
      />
      <div className="relative rounded-[11px] bg-[var(--color-surface)] px-5 py-2.5 z-10 transition-colors duration-300 group-hover:bg-[var(--color-surface-2)]">
        <span className="text-sm font-semibold text-[var(--color-text)]">
          {children}
        </span>
      </div>
    </motion.button>
  );
}

export default function BorderBeamButtonSandbox() {
  const [disabled, setDisabled] = useState(false);
  const [buttonText, setButtonText] = useState('Ver Planos Técnicos 🛠️');
  const [clickCount, setClickCount] = useState(0);

  const controls = [
    {
      type: 'toggle',
      label: 'Deshabilitar Botón',
      value: disabled,
      onChange: setDisabled
    },
    {
      type: 'text',
      label: 'Texto del Botón',
      value: buttonText,
      onChange: setButtonText
    }
  ];

  return (
    <SandboxLayout title="BorderBeamButton" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <LocalBorderBeamButton
          disabled={disabled}
          onClick={() => setClickCount(c => c + 1)}
        >
          {buttonText}
        </LocalBorderBeamButton>
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] w-full text-center">
          Clicks registrados: <span className="font-mono text-[var(--color-text)] font-bold">{clickCount}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
