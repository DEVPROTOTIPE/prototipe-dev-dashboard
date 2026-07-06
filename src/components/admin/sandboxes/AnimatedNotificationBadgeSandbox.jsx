import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion, AnimatePresence } from 'framer-motion';

// Componente Local para simulación autónoma en el sandbox
function LocalAnimatedNotificationBadge({
  count = 0,
  showZero = false,
  className = ''
}) {
  const displayCount = count > 99 ? '99+' : count;
  const isVisible = showZero || count > 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        {isVisible && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 15
            }}
            className={`min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold bg-[var(--color-primary)] !text-white border-2 border-[var(--color-surface)] shadow-md select-none pointer-events-none ${className}`}
          >
            {displayCount}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AnimatedNotificationBadgeSandbox() {
  const [count, setCount] = useState(3);
  const [showZero, setShowZero] = useState(false);

  const controls = [
    {
      type: 'toggle',
      label: 'Mostrar en Cero (showZero)',
      value: showZero,
      onChange: setShowZero
    }
  ];

  return (
    <SandboxLayout title="AnimatedNotificationBadge" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <div className="relative p-6 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center">
          {/* Icono de Carrito simulado */}
          <span className="text-3xl select-none">🛒</span>
          
          <div className="absolute top-4 right-4">
            <LocalAnimatedNotificationBadge count={count} showZero={showZero} />
          </div>
        </div>

        <div className="flex gap-2 w-full">
          <button
            onClick={() => setCount(c => Math.max(0, c - 1))}
            className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-all outline-none"
          >
            Restar -1
          </button>
          <button
            onClick={() => setCount(c => c + 1)}
            className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold bg-[var(--color-primary)] !text-white hover:bg-[var(--color-primary)]/90 transition-all outline-none"
          >
            Sumar +1
          </button>
        </div>

        <div className="text-sm text-[var(--color-text-muted)] w-full text-center select-none">
          Valor del contador: <span className="font-mono text-[var(--color-text)] font-bold">{count}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
