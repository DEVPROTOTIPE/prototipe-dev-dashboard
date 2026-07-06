import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente Local para simulación autónoma en el sandbox
function LocalExpandingGridSkeleton({
  cols = 3,
  itemsCount = 6,
  className = '',
  keyTrigger = 0
}) {
  const gridColsClass = cols === 4 
    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
    : cols === 2 
    ? 'grid-cols-1 sm:grid-cols-2' 
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';

  return (
    <div key={keyTrigger} className={`grid gap-4 w-full ${gridColsClass} ${className}`}>
      {Array.from({ length: itemsCount }).map((_, idx) => (
        <div
          key={idx}
          className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-3 overflow-hidden relative animate-skeletonFadeIn"
          style={{
            animationDelay: `${idx * 0.1}s`,
            animationFillMode: 'both'
          }}
        >
          <div className="w-full aspect-[4/3] rounded-xl bg-[var(--color-surface-2)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-text-muted)]/5 to-transparent animate-shimmer" />
          </div>
          <div className="w-3/4 h-3.5 rounded bg-[var(--color-surface-2)] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-text-muted)]/5 to-transparent animate-shimmer" />
          </div>
          <div className="w-1/2 h-3 rounded bg-[var(--color-surface-3)] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-text-muted)]/5 to-transparent animate-shimmer" />
          </div>
        </div>
      ))}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes skeletonFadeIn {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(150%); }
        }
        .animate-skeletonFadeIn {
          animation: skeletonFadeIn 0.5s ease-out forwards;
        }
        .animate-shimmer {
          animation: shimmer 1.8s infinite ease-in-out;
        }
      `}} />
    </div>
  );
}

export default function ExpandingGridSkeletonSandbox() {
  const [cols, setCols] = useState(3);
  const [count, setCount] = useState(6);
  const [trigger, setTrigger] = useState(0);

  const controls = [
    {
      type: 'select',
      label: 'Columnas en Escritorio',
      value: cols,
      options: [
        { value: 2, label: '2 Columnas' },
        { value: 3, label: '3 Columnas' },
        { value: 4, label: '4 Columnas' }
      ],
      onChange: (val) => setCols(Number(val))
    },
    {
      type: 'select',
      label: 'Cantidad de Tarjetas',
      value: count,
      options: [
        { value: 4, label: '4 Tarjetas' },
        { value: 6, label: '6 Tarjetas' },
        { value: 8, label: '8 Tarjetas' }
      ],
      onChange: (val) => setCount(Number(val))
    }
  ];

  return (
    <SandboxLayout title="ExpandingGridSkeleton" controls={controls}>
      <div className="flex flex-col items-center justify-center p-8 space-y-6 w-full max-w-4xl mx-auto">
        <div className="p-6 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
            <span className="text-xs font-semibold text-[var(--color-text)]">Vista Previa de Cuadrícula</span>
            <button
              type="button"
              onClick={() => setTrigger(prev => prev + 1)}
              className="py-1 px-3 rounded-lg bg-[var(--color-primary)] text-white text-xs font-medium shadow-sm hover:bg-[var(--color-primary)]/90 active:scale-95 transition-all outline-none !text-white"
            >
              Recargar Stagger
            </button>
          </div>
          <LocalExpandingGridSkeleton 
            cols={cols} 
            itemsCount={count} 
            keyTrigger={trigger} 
          />
        </div>
      </div>
    </SandboxLayout>
  );
}
