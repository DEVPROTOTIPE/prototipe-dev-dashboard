import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente Local para simulación autónoma en el sandbox
function LocalBouncingDotsLoader({
  size = 'w-2 h-2',
  gap = 'gap-1',
  color = 'bg-[var(--color-primary)]',
  className = ''
}) {
  return (
    <div className={`flex items-center justify-center py-2 ${gap} ${className}`}>
      <div 
        className={`rounded-full animate-bounceDot ${size} ${color}`}
        style={{ animationDelay: '0s' }}
      />
      <div 
        className={`rounded-full animate-bounceDot ${size} ${color}`}
        style={{ animationDelay: '0.15s' }}
      />
      <div 
        className={`rounded-full animate-bounceDot ${size} ${color}`}
        style={{ animationDelay: '0.3s' }}
      />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounceDot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounceDot {
          animation: bounceDot 0.6s infinite ease-in-out;
        }
      `}} />
    </div>
  );
}

export default function BouncingDotsLoaderSandbox() {
  const [sizeClass, setSizeClass] = useState('w-2.5 h-2.5');
  const [gapClass, setGapClass] = useState('gap-1.5');
  const [colorOption, setColorOption] = useState('bg-[var(--color-primary)]');

  const controls = [
    {
      type: 'select',
      label: 'Tamaño de los Puntos',
      value: sizeClass,
      options: [
        { value: 'w-1.5 h-1.5', label: 'Mini (w-1.5)' },
        { value: 'w-2.5 h-2.5', label: 'Estándar (w-2.5)' },
        { value: 'w-4 h-4', label: 'Grande (w-4)' }
      ],
      onChange: setSizeClass
    },
    {
      type: 'select',
      label: 'Espaciado (Gap)',
      value: gapClass,
      options: [
        { value: 'gap-1', label: 'Estrecho (gap-1)' },
        { value: 'gap-1.5', label: 'Medio (gap-1.5)' },
        { value: 'gap-3', label: 'Separado (gap-3)' }
      ],
      onChange: setGapClass
    },
    {
      type: 'select',
      label: 'Color de los Puntos',
      value: colorOption,
      options: [
        { value: 'bg-[var(--color-primary)]', label: 'Marca (Primary)' },
        { value: 'bg-emerald-500', label: 'Éxito (Emerald)' },
        { value: 'bg-rose-500', label: 'Error (Rose)' },
        { value: 'bg-[var(--color-text)]', label: 'Texto (Contrast)' }
      ],
      onChange: setColorOption
    }
  ];

  return (
    <SandboxLayout title="BouncingDotsLoader" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <div className="p-8 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full flex flex-col items-center justify-center gap-4 min-h-[160px]">
          <div className="flex items-center gap-3 py-2 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <span className="text-xs text-[var(--color-text-muted)]">Guardando cambios</span>
            <LocalBouncingDotsLoader 
              size={sizeClass} 
              gap={gapClass} 
              color={colorOption} 
            />
          </div>
        </div>
      </div>
    </SandboxLayout>
  );
}
