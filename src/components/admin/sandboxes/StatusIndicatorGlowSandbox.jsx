import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';
import CustomSelect from '../../ui/CustomSelect';

const STATUS_CONFIGS = {
  online: { color: 'bg-green-500', glowColor: 'bg-green-500/30', label: 'Disponible' },
  offline: { color: 'bg-[var(--color-text-muted)]/60', glowColor: 'hidden', label: 'Desconectado' },
  busy: { color: 'bg-red-500', glowColor: 'bg-red-500/30', label: 'Ocupado' },
  away: { color: 'bg-amber-500', glowColor: 'bg-amber-500/30', label: 'Ausente' }
};

// Componente Local para simulación autónoma en el sandbox
function LocalStatusIndicatorGlow({
  status = 'online',
  showLabel = false,
  className = ''
}) {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.online;

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <div className="relative flex h-3 w-3 items-center justify-center">
        {status !== 'offline' && (
          <motion.span
            animate={{
              scale: [1, 2.2, 1],
              opacity: [0.6, 0, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`absolute inline-flex h-full w-full rounded-full ${config.glowColor}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.color}`} />
      </div>

      {showLabel && (
        <span className="text-xs font-semibold text-[var(--color-text-muted)] leading-none">
          {config.label}
        </span>
      )}
    </div>
  );
}

export default function StatusIndicatorGlowSandbox() {
  const [status, setStatus] = useState('online');
  const [showLabel, setShowLabel] = useState(true);

  const controls = [
    {
      type: 'custom',
      label: 'Estado de Conexión',
      render: () => (
        <CustomSelect
          options={[
            { value: 'online', label: 'Disponible (online)' },
            { value: 'offline', label: 'Desconectado (offline)' },
            { value: 'busy', label: 'Ocupado (busy)' },
            { value: 'away', label: 'Ausente (away)' }
          ]}
          value={status}
          onChange={setStatus}
        />
      )
    },
    {
      type: 'toggle',
      label: 'Mostrar Etiqueta de Texto',
      value: showLabel,
      onChange: setShowLabel
    }
  ];

  return (
    <SandboxLayout title="StatusIndicatorGlow" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <div className="p-6 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full flex items-center justify-center gap-3">
          {/* Avatar del repartidor/usuario simulado */}
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-border)] flex items-center justify-center text-lg select-none">
            👤
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[var(--color-text)] leading-tight">Sergio Alexander</span>
            <LocalStatusIndicatorGlow status={status} showLabel={showLabel} />
          </div>
        </div>
      </div>
    </SandboxLayout>
  );
}
