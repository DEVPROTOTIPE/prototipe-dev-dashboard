import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';

// Componente Local para simulación autónoma en el sandbox
function LocalProgressCircleRing({
  value = 0,
  size = 72,
  strokeWidth = 6,
  className = ''
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-[var(--color-border)] fill-transparent"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-[var(--color-primary)] fill-transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-extrabold text-[var(--color-text)] tracking-tight">
        {Math.round(normalizedValue)}%
      </span>
    </div>
  );
}

export default function ProgressCircleRingSandbox() {
  const [val, setVal] = useState(65);
  const [size, setSize] = useState(80);

  const controls = [
    {
      type: 'number',
      label: 'Porcentaje Progreso (%)',
      value: val,
      onChange: setVal,
      min: 0,
      max: 100
    },
    {
      type: 'number',
      label: 'Tamaño del Anillo (px)',
      value: size,
      onChange: setSize,
      min: 40,
      max: 150
    }
  ];

  return (
    <SandboxLayout title="ProgressCircleRing" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <div className="p-8 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full flex flex-col items-center justify-center gap-4">
          <LocalProgressCircleRing
            value={val}
            size={size}
            strokeWidth={size > 100 ? 10 : 6}
          />
          <span className="text-xs text-[var(--color-text-muted)] text-center">
            {val >= 100 ? '✓ ¡Proceso Completado!' : 'Cargando datos del POS...'}
          </span>
        </div>
      </div>
    </SandboxLayout>
  );
}
