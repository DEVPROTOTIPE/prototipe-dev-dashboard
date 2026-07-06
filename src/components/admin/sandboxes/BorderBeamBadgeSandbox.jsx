import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';

// Componente Local para simulación autónoma en el sandbox
function LocalBorderBeamBadge({
  children,
  className = '',
  beamColor = 'var(--color-primary)'
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-3)] overflow-hidden select-none ${className}`}
      style={{
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        maskImage: 'radial-gradient(white, black)'
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute w-[180%] h-[180%] pointer-events-none z-0 top-1/2 left-1/2"
        style={{
          x: '-50%',
          y: '-50%',
          transformOrigin: 'center center',
          background: `conic-gradient(from 0deg, transparent 50%, ${beamColor} 100%)`
        }}
      />

      <div className="absolute inset-[1px] bg-[var(--color-surface-3)] rounded-full z-1 pointer-events-none" />

      <span className="relative z-10 text-[10px] font-extrabold text-[var(--color-text)] tracking-wider uppercase leading-none">
        {children}
      </span>
    </div>
  );
}

export default function BorderBeamBadgeSandbox() {
  const [labelText, setLabelText] = useState('Edición Especial ⚡');
  const [useSecondaryColor, setUseSecondaryColor] = useState(false);

  const controls = [
    {
      type: 'text',
      label: 'Texto del Badge',
      value: labelText,
      onChange: setLabelText
    },
    {
      type: 'toggle',
      label: 'Usar Color Secundario HSL',
      value: useSecondaryColor,
      onChange: setUseSecondaryColor
    }
  ];

  return (
    <SandboxLayout title="BorderBeamBadge" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <div className="p-8 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full flex items-center justify-center">
          <LocalBorderBeamBadge
            beamColor={useSecondaryColor ? 'var(--color-secondary)' : 'var(--color-primary)'}
          >
            {labelText}
          </LocalBorderBeamBadge>
        </div>
      </div>
    </SandboxLayout>
  );
}
