import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';

// Componente Local para simulación autónoma en el sandbox
function LocalInteractiveSegmentedControl({
  options = [],
  selectedValue,
  onChange,
  disabled = false
}) {
  return (
    <div className={`relative flex items-center p-1 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] select-none w-full
      ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
    `}>
      {options.map((opt) => {
        const isActive = opt.value === selectedValue;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange && onChange(opt.value)}
            className="relative flex-1 py-1.5 px-3 text-xs font-semibold text-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors outline-none"
          >
            {isActive && (
              <motion.div
                layoutId="activeSegmentBubble"
                className="absolute inset-0 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm z-0"
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
              />
            )}
            <span className={`relative z-10 transition-colors duration-250 ${isActive ? '!text-[var(--color-primary)] font-bold' : ''}`}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function InteractiveSegmentedControlSandbox() {
  const [disabled, setDisabled] = useState(false);
  const [activeTab, setActiveTab] = useState('diario');

  const options = [
    { value: 'diario', label: 'Diario 📅' },
    { value: 'semanal', label: 'Semanal 📊' },
    { value: 'mensual', label: 'Mensual 📈' }
  ];

  const controls = [
    {
      type: 'toggle',
      label: 'Deshabilitar Control',
      value: disabled,
      onChange: setDisabled
    }
  ];

  return (
    <SandboxLayout title="InteractiveSegmentedControl" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <LocalInteractiveSegmentedControl
          options={options}
          selectedValue={activeTab}
          onChange={setActiveTab}
          disabled={disabled}
        />
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] w-full text-center">
          Vista seleccionada: <span className="font-mono text-[var(--color-text)] font-bold">{activeTab.toUpperCase()}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
