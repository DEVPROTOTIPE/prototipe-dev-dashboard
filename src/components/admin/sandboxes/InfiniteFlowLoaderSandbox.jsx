import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente Local para simulación autónoma en el sandbox
function LocalInfiniteFlowLoader({
  height = 'h-1.5',
  glow = true,
  className = ''
}) {
  return (
    <div className={`relative w-full overflow-hidden bg-[var(--color-surface-3)] rounded-full ${height} ${className}`}>
      <div 
        className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent will-change-transform"
        style={{
          animation: `flowInfinite 1.6s infinite linear`
        }}
      />
      {glow && (
        <div 
          className="absolute inset-y-0 left-0 w-1/2 opacity-30 blur-sm bg-[var(--color-primary)]"
          style={{
            animation: `flowInfinite 1.6s infinite linear`
          }}
        />
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flowInfinite {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  );
}

export default function InfiniteFlowLoaderSandbox() {
  const [heightClass, setHeightClass] = useState('h-1.5');
  const [glow, setGlow] = useState(true);

  const controls = [
    {
      type: 'select',
      label: 'Grosor de la Barra',
      value: heightClass,
      options: [
        { value: 'h-1', label: 'Delgada (h-1)' },
        { value: 'h-1.5', label: 'Estándar (h-1.5)' },
        { value: 'h-3', label: 'Gruesa (h-3)' },
        { value: 'h-5', label: 'Extra Gruesa (h-5)' }
      ],
      onChange: setHeightClass
    },
    {
      type: 'toggle',
      label: 'Efecto Glow (Resplandor)',
      value: glow,
      onChange: setGlow
    }
  ];

  return (
    <SandboxLayout title="InfiniteFlowLoader" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <div className="p-8 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full flex flex-col justify-center gap-6">
          <div className="text-xs text-[var(--color-text-muted)] font-medium">
            Simulando petición asíncrona...
          </div>
          <LocalInfiniteFlowLoader height={heightClass} glow={glow} />
          <div className="text-xxs text-[var(--color-text-muted)]/75 italic">
            El gradiente de flujo se calcula por hardware (will-change-transform).
          </div>
        </div>
      </div>
    </SandboxLayout>
  );
}
