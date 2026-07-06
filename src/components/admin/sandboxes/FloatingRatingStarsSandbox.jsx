import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import { motion } from 'framer-motion';

// --- COMPONENT DEFINITION ---
function FloatingRatingStars({
  maxRating = 5,
  initialRating = 0,
  onChange,
  activeColor = '#eab308',
  inactiveColor = 'var(--color-surface-3)',
  size = 32
}) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSelect = (val) => {
    setRating(val);
    if (onChange) onChange(val);
  };

  return (
    <div className="flex gap-2 items-center justify-center select-none">
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= (hoverRating || rating);

        return (
          <motion.div
            key={index}
            onClick={() => handleSelect(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            whileHover={{ scale: 1.25, rotate: 12 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="cursor-pointer p-1"
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={isActive ? activeColor : 'none'}
              stroke={isActive ? activeColor : 'var(--color-text)'}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-colors duration-300"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
}

// --- SANDBOX EXPORT ---
export default function FloatingRatingStarsSandbox() {
  const [rating, setRating] = useState(3);
  const [activeColor, setActiveColor] = useState('#eab308'); // Amber default
  const [size, setSize] = useState(36);

  const controls = [
    {
      name: 'size',
      label: 'Tamaño de las Estrellas (px)',
      type: 'number',
      value: size,
      min: 24,
      max: 48,
      step: 4,
      onChange: (v) => setSize(v),
    },
    {
      name: 'activeColor',
      label: 'Color Activo (Hex)',
      type: 'text',
      value: activeColor,
      onChange: (v) => setActiveColor(v),
    }
  ];

  return (
    <SandboxLayout
      title="FloatingRatingStars"
      description="Calificación interactiva de estrellas con micro-escala y rotación elástica en hover"
      controls={controls}
    >
      <div className="py-12 flex flex-col items-center justify-center bg-[var(--color-surface-2)] rounded-xl min-h-[350px] p-6 gap-6">
        <div className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border)] shadow-md flex flex-col items-center gap-4 text-center max-w-xs">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
            ¿Cómo calificarías el servicio?
          </span>
          
          <FloatingRatingStars 
            initialRating={rating}
            activeColor={activeColor}
            size={size}
            onChange={(val) => setRating(val)}
          />

          <div className="text-sm font-semibold text-[var(--color-text)] mt-2">
            Calificación: <span className="text-amber-500 font-extrabold">{rating} / 5</span>
          </div>
        </div>
      </div>
    </SandboxLayout>
  );
}
