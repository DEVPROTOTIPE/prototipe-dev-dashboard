import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';

const EMOJIS = [
  { value: 1, char: '😢', label: 'Malo' },
  { value: 2, char: '😕', label: 'Regular' },
  { value: 3, char: '😐', label: 'Aceptable' },
  { value: 4, char: '🙂', label: 'Bueno' },
  { value: 5, char: '😍', label: 'Excelente' }
];

// Componente Local para simulación autónoma en el sandbox
function LocalFeedbackEmojiPicker({
  value = 0,
  onChange,
  disabled = false
}) {
  const [hoveredVal, setHoveredVal] = useState(null);

  return (
    <div className={`flex gap-3 justify-center items-center py-4 select-none ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}>
      {EMOJIS.map((emoji) => {
        const isSelected = value === emoji.value;
        const isHovered = hoveredVal === emoji.value;

        return (
          <div key={emoji.value} className="flex flex-col items-center gap-1">
            <motion.button
              type="button"
              disabled={disabled}
              onMouseEnter={() => !disabled && setHoveredVal(emoji.value)}
              onMouseLeave={() => !disabled && setHoveredVal(null)}
              onClick={() => onChange && onChange(emoji.value)}
              whileHover={{ scale: 1.2, y: -4 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border transition-all duration-200 outline-none
                ${isSelected 
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-sm shadow-[var(--color-primary)]/10' 
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40'
                }
                ${isHovered ? 'shadow-md border-[var(--color-primary)]/50' : ''}
              `}
            >
              <span className={`transition-transform duration-200 ${isSelected ? 'scale-110' : 'opacity-85'}`}>
                {emoji.char}
              </span>
            </motion.button>
            <span className={`text-[10px] font-semibold transition-all duration-200
              ${isSelected ? 'text-[var(--color-primary)] font-bold opacity-100' : 'text-[var(--color-text-muted)] opacity-60'}
            `}>
              {emoji.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function FeedbackEmojiPickerSandbox() {
  const [disabled, setDisabled] = useState(false);
  const [val, setVal] = useState(0);

  const controls = [
    {
      type: 'toggle',
      label: 'Deshabilitar Control',
      value: disabled,
      onChange: setDisabled
    }
  ];

  return (
    <SandboxLayout title="FeedbackEmojiPicker" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <LocalFeedbackEmojiPicker
          value={val}
          onChange={setVal}
          disabled={disabled}
        />
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] w-full text-center">
          Valor de calificación: <span className="font-mono text-[var(--color-text)] font-bold">{val > 0 ? `${val} / 5 (${EMOJIS[val - 1].label})` : 'Sin puntaje'}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
