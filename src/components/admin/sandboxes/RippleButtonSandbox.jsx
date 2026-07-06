import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion, AnimatePresence } from 'framer-motion';

// Componente Local para simulación autónoma en el sandbox
function LocalRippleButton({
  children,
  onClick,
  disabled = false,
  className = ''
}) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled) return;

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const x = clientX - left;
    const y = clientY - top;
    const size = Math.max(width, height) * 2;

    const newRipple = {
      id: Date.now() + Math.random(),
      x,
      y,
      size
    };

    setRipples((prev) => [...prev, newRipple]);

    if (onClick) onClick(e);
  };

  const cleanRipple = (id) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-hidden rounded-xl bg-[var(--color-primary)] !text-white px-6 py-3 font-semibold shadow-md shadow-[var(--color-primary)]/15 outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => cleanRipple(ripple.id)}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute rounded-full bg-white/25 pointer-events-none z-0"
            style={{
              top: ripple.y - ripple.size / 2,
              left: ripple.x - ripple.size / 2,
              width: ripple.size,
              height: ripple.size
            }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}

export default function RippleButtonSandbox() {
  const [disabled, setDisabled] = useState(false);
  const [buttonText, setButtonText] = useState('Pagar Caja 💸');
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
    <SandboxLayout title="RippleButton" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <LocalRippleButton
          disabled={disabled}
          onClick={() => setClickCount(c => c + 1)}
        >
          {buttonText}
        </LocalRippleButton>
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] w-full text-center">
          Ondas emitidas (Clicks): <span className="font-mono text-[var(--color-text)] font-bold">{clickCount}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
