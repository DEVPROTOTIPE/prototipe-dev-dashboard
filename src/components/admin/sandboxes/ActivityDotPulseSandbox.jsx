import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';

const CONTAINER_VARIANTS = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const DOT_VARIANTS = {
  initial: {
    y: '0%'
  },
  animate: {
    y: ['0%', '-60%', '0%'],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Componente Local para simulación autónoma en el sandbox
function LocalActivityDotPulse({
  className = '',
  dotColor = 'bg-[var(--color-primary)]'
}) {
  return (
    <motion.div
      variants={CONTAINER_VARIANTS}
      initial="initial"
      animate="animate"
      className={`flex items-center gap-1.5 px-3 py-2 rounded-full bg-[var(--color-surface-3)] border border-[var(--color-border)] w-fit select-none ${className}`}
    >
      <motion.span
        variants={DOT_VARIANTS}
        className={`w-2 h-2 rounded-full ${dotColor}`}
      />
      <motion.span
        variants={DOT_VARIANTS}
        className={`w-2 h-2 rounded-full ${dotColor}`}
      />
      <motion.span
        variants={DOT_VARIANTS}
        className={`w-2 h-2 rounded-full ${dotColor}`}
      />
    </motion.div>
  );
}

export default function ActivityDotPulseSandbox() {
  const [usePrimaryColor, setUsePrimaryColor] = useState(true);

  const controls = [
    {
      type: 'toggle',
      label: 'Usar Color Primario HSL',
      value: usePrimaryColor,
      onChange: setUsePrimaryColor
    }
  ];

  return (
    <SandboxLayout title="ActivityDotPulse" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <div className="p-6 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full flex flex-col gap-4">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-border)] flex items-center justify-center text-sm select-none shrink-0">
              👩‍💻
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[var(--color-text)]">Soporte Omnicanal</span>
              <LocalActivityDotPulse
                dotColor={usePrimaryColor ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-text-muted)]/60'}
              />
            </div>
          </div>
        </div>
      </div>
    </SandboxLayout>
  );
}
