import React, { useState, useEffect } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion, AnimatePresence } from 'framer-motion';

const createSparkle = () => ({
  id: Math.random(),
  createdAt: Date.now(),
  color: '#eab308',
  size: 12 + Math.random() * 12,
  style: {
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`
  }
});

// Componente Local para simulación autónoma en el sandbox
function LocalSparklesTextIndicator({
  children,
  className = '',
  enabled = true
}) {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    if (!enabled) {
      setSparkles([]);
      return;
    }

    const interval = setInterval(() => {
      setSparkles((prev) => {
        const now = Date.now();
        const clean = prev.filter((sp) => now - sp.createdAt < 700);
        return [...clean, createSparkle()];
      });
    }, 250);

    return () => clearInterval(interval);
  }, [enabled]);

  return (
    <span className={`relative inline-block overflow-visible px-4 py-1 select-none ${className}`}>
      <AnimatePresence>
        {sparkles.map((sp) => (
          <motion.svg
            key={sp.id}
            initial={{ scale: 0, rotate: 0, opacity: 0 }}
            animate={{ scale: 1, rotate: 90, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute pointer-events-none z-20 fill-yellow-400"
            style={{
              ...sp.style,
              width: sp.size,
              height: sp.size,
              marginLeft: -sp.size / 2,
              marginTop: -sp.size / 2
            }}
            viewBox="0 0 160 160"
          >
            <path d="M80 0C80 44.1828 115.817 80 160 80C115.817 80 80 115.817 80 160C80 115.817 44.1828 80 0 80C44.1828 80 80 44.1828 80 0Z" />
          </motion.svg>
        ))}
      </AnimatePresence>

      <span className="relative z-10 font-bold text-lg text-[var(--color-primary)]">{children}</span>
    </span>
  );
}

export default function SparklesTextIndicatorSandbox() {
  const [enabled, setEnabled] = useState(true);
  const [text, setText] = useState('Recomendado por IA ✨');

  const controls = [
    {
      type: 'toggle',
      label: 'Activar Destellos',
      value: enabled,
      onChange: setEnabled
    },
    {
      type: 'text',
      label: 'Texto del Indicador',
      value: text,
      onChange: setText
    }
  ];

  return (
    <SandboxLayout title="SparklesTextIndicator" controls={controls}>
      <div className="flex flex-col items-center justify-center p-16 space-y-6 w-full max-w-sm mx-auto overflow-visible relative">
        <div className="p-8 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full flex items-center justify-center overflow-visible">
          <LocalSparklesTextIndicator enabled={enabled}>
            {text}
          </LocalSparklesTextIndicator>
        </div>
      </div>
    </SandboxLayout>
  );
}
