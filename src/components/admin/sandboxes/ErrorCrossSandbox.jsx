import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente Local para simulación autónoma en el sandbox
function LocalErrorCross({
  size = 'w-16 h-16',
  className = '',
  keyTrigger = 0
}) {
  return (
    <div key={keyTrigger} className={`relative flex items-center justify-center animate-shakeError ${size} ${className}`}>
      <svg
        className="w-full h-full text-rose-500 fill-none"
        viewBox="0 0 52 52"
      >
        <circle
          className="stroke-rose-500 stroke-[3px] animate-circleDraw"
          cx="26"
          cy="26"
          r="24"
          fill="none"
        />
        <circle
          className="fill-rose-500/10 animate-fillCircle"
          cx="26"
          cy="26"
          r="24"
        />
        <path
          className="stroke-rose-500 stroke-[4px] animate-lineDraw"
          strokeLinecap="round"
          d="M16 16l20 20"
        />
        <path
          className="stroke-rose-500 stroke-[4px] animate-lineDraw2"
          strokeLinecap="round"
          d="M36 16L16 36"
        />
      </svg>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes circleDraw {
          0% { stroke-dasharray: 0 150; }
          100% { stroke-dasharray: 150 150; }
        }
        @keyframes lineDraw {
          0% { stroke-dasharray: 0 30; }
          100% { stroke-dasharray: 30 30; }
        }
        @keyframes shakeError {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-4px); }
          30%, 60%, 90% { transform: translateX(4px); }
        }
        .animate-circleDraw {
          stroke-dasharray: 150;
          stroke-dashoffset: 0;
          animation: circleDraw 0.5s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .animate-lineDraw {
          stroke-dasharray: 30;
          stroke-dashoffset: 0;
          animation: lineDraw 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.5s forwards;
        }
        .animate-lineDraw2 {
          stroke-dasharray: 30;
          stroke-dashoffset: 0;
          animation: lineDraw 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.7s forwards;
        }
        .animate-shakeError {
          animation: shakeError 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}} />
    </div>
  );
}

export default function ErrorCrossSandbox() {
  const [sizeClass, setSizeClass] = useState('w-16 h-16');
  const [trigger, setTrigger] = useState(0);

  const controls = [
    {
      type: 'select',
      label: 'Tamaño de Alerta',
      value: sizeClass,
      options: [
        { value: 'w-10 h-10', label: 'Compacto (w-10)' },
        { value: 'w-16 h-16', label: 'Estándar (w-16)' },
        { value: 'w-24 h-24', label: 'Grande (w-24)' },
        { value: 'w-32 h-32', label: 'Extremo (w-32)' }
      ],
      onChange: setSizeClass
    }
  ];

  return (
    <SandboxLayout title="ErrorCross" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <div className="p-8 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full flex flex-col items-center justify-center gap-6 min-h-[220px]">
          <LocalErrorCross 
            size={sizeClass} 
            keyTrigger={trigger} 
          />
          <button
            type="button"
            onClick={() => setTrigger(prev => prev + 1)}
            className="py-2 px-4 rounded-xl bg-rose-500 text-white text-xs font-semibold shadow-md hover:bg-rose-600 active:scale-95 transition-all outline-none !text-white"
          >
            Disparar Error
          </button>
        </div>
      </div>
    </SandboxLayout>
  );
}
