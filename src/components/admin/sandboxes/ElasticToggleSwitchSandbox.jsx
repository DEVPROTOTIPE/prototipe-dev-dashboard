import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';

// Componente Local para simulación autónoma en el sandbox
function LocalElasticToggleSwitch({
  checked = false,
  onChange,
  disabled = false
}) {
  return (
    <div
      onClick={() => !disabled && onChange && onChange(!checked)}
      className={`relative w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 select-none
        ${checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-3)] border border-[var(--color-border)]'}
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
      `}
    >
      <motion.div
        animate={{
          x: checked ? 24 : 0,
          scaleX: [1, 1.35, 1],
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 20
        }}
        className="w-6 h-6 rounded-full bg-white shadow-md shadow-black/10 origin-center"
      />
    </div>
  );
}

export default function ElasticToggleSwitchSandbox() {
  const [checked, setChecked] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const controls = [
    {
      type: 'toggle',
      label: 'Deshabilitar Switch',
      value: disabled,
      onChange: setDisabled
    }
  ];

  return (
    <SandboxLayout title="ElasticToggleSwitch" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <LocalElasticToggleSwitch
          checked={checked}
          onChange={setChecked}
          disabled={disabled}
        />
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] w-full text-center">
          Estado actual: <span className="font-mono text-[var(--color-text)] font-bold">{checked ? 'ACTIVO' : 'INACTIVO'}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
