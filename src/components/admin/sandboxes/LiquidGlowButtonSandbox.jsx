import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';

// Componente Local para el Sandbox de pruebas
function LocalLiquidGlowButton({
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
      className={`relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-3)] px-6 py-3 text-sm font-bold text-[var(--color-text)] transition-colors duration-300 outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed isolate ${className}`}
      style={{ 
        transform: 'translateZ(0)',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)', // Hack definitivo para Webkit overflow-clip
        maskImage: 'radial-gradient(white, black)'
      }}
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.5 : 0,
          opacity: isHovered ? 1 : 0
        }}
        transition={{
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] pointer-events-none z-0 rounded-xl"
        style={{ 
          width: '100%', 
          height: '100%', 
          top: 0, 
          left: 0,
          transformOrigin: 'center'
        }}
      />
      <span className={`relative z-10 transition-colors duration-300 ${isHovered ? '!text-white' : ''}`}>
        {children}
      </span>
    </motion.button>
  );
}

export default function LiquidGlowButtonSandbox() {
  const [disabled, setDisabled] = useState(false);
  const [buttonText, setButtonText] = useState('Pagar Factura 💳');
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
    <SandboxLayout title="LiquidGlowButton" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <LocalLiquidGlowButton
          disabled={disabled}
          onClick={() => setClickCount(c => c + 1)}
        >
          {buttonText}
        </LocalLiquidGlowButton>
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] w-full text-center">
          Clicks registrados: <span className="font-mono text-[var(--color-text)] font-bold">{clickCount}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
