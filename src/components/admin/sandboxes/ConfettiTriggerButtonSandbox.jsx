import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion, AnimatePresence } from 'framer-motion';

const CONFETTI_COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ec4899', '#a855f7', '#f97316'];

// Componente Local para simulación autónoma en el sandbox
function LocalConfettiTriggerButton({
  children,
  onClick,
  disabled = false,
  className = ''
}) {
  const [particles, setParticles] = useState([]);

  const triggerConfetti = (e) => {
    if (disabled) return;

    const newParticles = Array.from({ length: 18 }).map((_, idx) => {
      const angle = (idx / 18) * 360 + (Math.random() - 0.5) * 15;
      const distance = 50 + Math.random() * 90;
      const radians = (angle * Math.PI) / 180;
      
      return {
        id: Date.now() + idx + Math.random(),
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        x: Math.cos(radians) * distance,
        y: Math.sin(radians) * distance - 25,
        size: 5 + Math.random() * 8,
        rotate: Math.random() * 360,
        shape: Math.random() > 0.5 ? 'circle' : 'square'
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);
    if (onClick) onClick(e);
  };

  const removeParticle = (id) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="relative inline-block overflow-visible">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
            animate={{
              x: p.x,
              y: p.y,
              scale: [1, 1.2, 0.4],
              rotate: p.rotate + 180,
              opacity: [1, 1, 0]
            }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => removeParticle(p.id)}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute pointer-events-none z-50 left-1/2 top-1/2"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '50%' : '2px',
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2
            }}
          />
        ))}
      </AnimatePresence>

      <motion.button
        onClick={triggerConfetti}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
        className={`relative rounded-xl bg-[var(--color-primary)] !text-white px-6 py-3 font-semibold shadow-md shadow-[var(--color-primary)]/20 outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed z-10 ${className}`}
      >
        {children}
      </motion.button>
    </div>
  );
}

export default function ConfettiTriggerButtonSandbox() {
  const [disabled, setDisabled] = useState(false);
  const [buttonText, setButtonText] = useState('Reclamar Cupón de Suerte 🎂');
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
    <SandboxLayout title="ConfettiTriggerButton" controls={controls}>
      {/* Contenedor con overflow-visible y paddings amplios de seguridad para el confeti */}
      <div className="flex flex-col items-center justify-center p-20 space-y-6 w-full max-w-sm mx-auto overflow-visible relative">
        <LocalConfettiTriggerButton
          disabled={disabled}
          onClick={() => setClickCount(c => c + 1)}
        >
          {buttonText}
        </LocalConfettiTriggerButton>
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] w-full text-center z-10 select-none">
          Cupones reclamados: <span className="font-mono text-[var(--color-text)] font-bold">{clickCount}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
