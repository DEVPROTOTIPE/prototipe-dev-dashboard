import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente Local para simulación autónoma en el sandbox
function LocalCircularDashSpinner({
  size = 'w-10 h-10',
  strokeWidth = 3.5,
  color = 'stroke-[var(--color-primary)]',
  className = ''
}) {
  return (
    <div className={`relative flex items-center justify-center ${size} ${className}`}>
      <svg
        className="w-full h-full animate-rotateSpinner"
        viewBox="0 0 50 50"
      >
        <circle
          className="stroke-[var(--color-surface-3)]"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth={strokeWidth}
        />
        <circle
          className={`${color} stroke-round animate-dashSpinner`}
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes rotateSpinner {
          100% { transform: rotate(360deg); }
        }
        @keyframes dashSpinner {
          0% {
            stroke-dasharray: 1, 150;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -35;
          }
          100% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -124;
          }
        }
        .animate-rotateSpinner {
          animation: rotateSpinner 2s linear infinite;
        }
        .animate-dashSpinner {
          animation: dashSpinner 1.5s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}

export default function CircularDashSpinnerSandbox() {
  const [sizeClass, setSizeClass] = useState('w-10 h-10');
  const [strokeWidth, setStrokeWidth] = useState(3.5);
  const [colorOption, setColorOption] = useState('stroke-[var(--color-primary)]');

  const controls = [
    {
      type: 'select',
      label: 'Tamaño del Spinner',
      value: sizeClass,
      options: [
        { value: 'w-6 h-6', label: 'Pequeño (w-6)' },
        { value: 'w-10 h-10', label: 'Estándar (w-10)' },
        { value: 'w-16 h-16', label: 'Grande (w-16)' },
        { value: 'w-24 h-24', label: 'Gigante (w-24)' }
      ],
      onChange: setSizeClass
    },
    {
      type: 'select',
      label: 'Grosor de Línea',
      value: strokeWidth,
      options: [
        { value: 2, label: 'Fino (2px)' },
        { value: 3.5, label: 'Medio (3.5px)' },
        { value: 5, label: 'Grueso (5px)' },
        { value: 7, label: 'Extremo (7px)' }
      ],
      onChange: (val) => setStrokeWidth(Number(val))
    },
    {
      type: 'select',
      label: 'Color del Trazo',
      value: colorOption,
      options: [
        { value: 'stroke-[var(--color-primary)]', label: 'Marca (Primary)' },
        { value: 'stroke-emerald-500', label: 'Éxito (Emerald)' },
        { value: 'stroke-amber-500', label: 'Alerta (Amber)' },
        { value: 'stroke-rose-500', label: 'Error (Rose)' }
      ],
      onChange: setColorOption
    }
  ];

  return (
    <SandboxLayout title="CircularDashSpinner" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <div className="p-8 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full flex flex-col items-center justify-center gap-6 min-h-[200px]">
          <LocalCircularDashSpinner 
            size={sizeClass} 
            strokeWidth={strokeWidth} 
            color={colorOption} 
          />
          <span className="text-xs text-[var(--color-text-muted)] text-center">
            Simulando procesamiento asíncrono
          </span>
        </div>
      </div>
    </SandboxLayout>
  );
}
