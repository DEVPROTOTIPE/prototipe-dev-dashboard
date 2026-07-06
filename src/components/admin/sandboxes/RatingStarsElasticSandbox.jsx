import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';

// Componente Local para simulación autónoma en el sandbox
function LocalRatingStarsElastic({
  value = 0,
  onChange,
  disabled = false,
  className = ''
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleSelect = (idx) => {
    if (disabled) return;
    if (onChange) onChange(idx + 1);
  };

  return (
    <div className={`flex gap-1.5 justify-center items-center py-2 select-none ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''} ${className}`}>
      {Array.from({ length: 5 }).map((_, idx) => {
        const starNum = idx + 1;
        const isFilled = hoveredIndex !== null 
          ? starNum <= hoveredIndex 
          : starNum <= value;

        return (
          <motion.button
            key={idx}
            type="button"
            disabled={disabled}
            onMouseEnter={() => !disabled && setHoveredIndex(starNum)}
            onMouseLeave={() => !disabled && setHoveredIndex(null)}
            onClick={() => handleSelect(idx)}
            whileHover={{ scale: 1.25, rotate: 10 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            className="w-8 h-8 flex items-center justify-center outline-none"
          >
            <svg
              className={`w-7 h-7 stroke-2 transition-all duration-200
                ${isFilled 
                  ? 'fill-yellow-400 stroke-yellow-500 text-yellow-500 filter drop-shadow-[0_2px_4px_rgba(234,179,8,0.25)]' 
                  : 'fill-transparent stroke-[var(--color-text-muted)] opacity-40'
                }
              `}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.195-.49.846-.49 1.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.53.043.74.693.35 1.013l-3.97 3.828a.563.563 0 00-.162.498l.939 5.497c.09.529-.465.932-.938.682l-4.935-2.596a.563.563 0 00-.522 0l-4.935 2.596c-.473.249-1.027-.154-.938-.682l.939-5.497a.563.563 0 00-.162-.498l-3.97-3.828c-.39-.376-.18-1.03.35-1.013l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </motion.button>
        );
      })}
    </div>
  );
}

export default function RatingStarsElasticSandbox() {
  const [disabled, setDisabled] = useState(false);
  const [val, setVal] = useState(4);

  const controls = [
    {
      type: 'toggle',
      label: 'Deshabilitar Valoración',
      value: disabled,
      onChange: setDisabled
    }
  ];

  return (
    <SandboxLayout title="RatingStarsElastic" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <div className="p-8 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full flex flex-col items-center justify-center gap-4">
          <LocalRatingStarsElastic
            value={val}
            onChange={setVal}
            disabled={disabled}
          />
          <span className="text-xs text-[var(--color-text-muted)] text-center">
            {val === 5 ? '🤩 ¡Servicio Excelente!' : 'Califica tu experiencia'}
          </span>
        </div>
      </div>
    </SandboxLayout>
  );
}
