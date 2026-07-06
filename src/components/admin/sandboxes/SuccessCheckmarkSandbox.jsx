import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente Local para simulación autónoma en el sandbox
function LocalSuccessCheckmark({
  size = 'w-16 h-16',
  className = '',
  keyTrigger = 0
}) {
  return (
    <div key={keyTrigger} className={`relative flex items-center justify-center ${size} ${className}`}>
      <svg
        className="w-full h-full text-emerald-500 fill-none"
        viewBox="0 0 52 52"
      >
        <circle
          className="stroke-emerald-500 stroke-[3px] animate-circleDraw"
          cx="26"
          cy="26"
          r="24"
          fill="none"
        />
        <circle
          className="fill-emerald-500/10 animate-fillCircle"
          cx="26"
          cy="26"
          r="24"
        />
        <path
          className="stroke-emerald-500 stroke-[4px] animate-checkmarkDraw"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 27l8 8 16-16"
        />
      </svg>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes circleDraw {
          0% { stroke-dasharray: 0 150; }
          100% { stroke-dasharray: 150 150; }
        }
        @keyframes checkmarkDraw {
          0% { stroke-dasharray: 0 50; }
          50% { stroke-dasharray: 0 50; }
          100% { stroke-dasharray: 50 50; }
        }
        @keyframes fillCircle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .animate-circleDraw {
          stroke-dasharray: 150;
          stroke-dashoffset: 0;
          animation: circleDraw 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .animate-checkmarkDraw {
          stroke-dasharray: 50;
          stroke-dashoffset: 0;
          animation: checkmarkDraw 0.8s cubic-bezier(0.65, 0, 0.45, 1) forwards;
          transform-origin: 50% 50%;
        }
        .animate-fillCircle {
          transform-origin: 50% 50%;
          animation: fillCircle 0.4s ease-in-out 0.6s forwards;
        }
      `}} />
    </div>
  );
}

export default function SuccessCheckmarkSandbox() {
  const [sizeClass, setSizeClass] = useState('w-16 h-16');
  const [trigger, setTrigger] = useState(0);

  const controls = [
    {
      type: 'select',
      label: 'Tamaño del Checkmark',
      value: sizeClass,
      options: [
        { value: 'w-10 h-10', label: 'Compacto (w-10)' },
        { value: 'w-16 h-16', label: 'Estándar (w-16)' },
        { value: 'w-24 h-24', label: 'Llamativo (w-24)' },
        { value: 'w-32 h-32', label: 'Gigante (w-32)' }
      ],
      onChange: setSizeClass
    }
  ];

  return (
    <SandboxLayout title="SuccessCheckmark" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <div className="p-8 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full flex flex-col items-center justify-center gap-6 min-h-[220px]">
          <LocalSuccessCheckmark 
            size={sizeClass} 
            keyTrigger={trigger} 
          />
          <button
            type="button"
            onClick={() => setTrigger(prev => prev + 1)}
            className="py-2 px-4 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold shadow-md hover:bg-[var(--color-primary)]/90 active:scale-95 transition-all outline-none !text-white"
          >
            Disparar Animación
          </button>
        </div>
      </div>
    </SandboxLayout>
  );
}
