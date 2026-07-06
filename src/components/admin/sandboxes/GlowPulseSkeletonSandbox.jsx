import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente Local para simulación autónoma en el sandbox
function LocalGlowPulseSkeleton({
  variant = 'card', // 'card', 'circle', 'text'
  className = ''
}) {
  return (
    <div className={`relative overflow-hidden bg-[var(--color-surface-3)] ${className}`}>
      {/* Brillo de barrido diagonal */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-text-muted)]/10 to-transparent will-change-transform"
        style={{
          animation: 'shimmerDiagonal 1.8s infinite ease-in-out',
          backgroundSize: '200% 100%'
        }}
      />

      {/* Estructuras visuales según variante */}
      {variant === 'card' && (
        <div className="flex flex-col gap-3 p-4 opacity-0 pointer-events-none">
          <div className="w-full h-32 bg-transparent" />
          <div className="w-2/3 h-4 bg-transparent" />
          <div className="w-1/2 h-3 bg-transparent" />
        </div>
      )}

      {variant === 'circle' && (
        <div className="w-16 h-16 rounded-full opacity-0 pointer-events-none" />
      )}

      {variant === 'text' && (
        <div className="w-full h-4 opacity-0 pointer-events-none" />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmerDiagonal {
          0% { transform: translateX(-150%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(150%); }
        }
      `}} />
    </div>
  );
}

export default function GlowPulseSkeletonSandbox() {
  const [variant, setVariant] = useState('card');

  const controls = [
    {
      type: 'select',
      label: 'Variante de Esqueleto',
      value: variant,
      options: [
        { value: 'card', label: 'Tarjeta de Producto (Card)' },
        { value: 'circle', label: 'Avatar / Círculo (Circle)' },
        { value: 'text', label: 'Línea de Texto (Text)' }
      ],
      onChange: setVariant
    }
  ];

  return (
    <SandboxLayout title="GlowPulseSkeleton" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <div className="p-8 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full flex flex-col items-center justify-center min-h-[220px]">
          {variant === 'card' && (
            <div className="w-full border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-surface)]">
              <LocalGlowPulseSkeleton variant="card" className="w-full" />
              <div className="p-4 border-t border-[var(--color-border)] flex justify-between items-center">
                <div className="w-16 h-3 rounded bg-[var(--color-surface-3)]" />
                <div className="w-10 h-6 rounded bg-[var(--color-primary)]/20" />
              </div>
            </div>
          )}

          {variant === 'circle' && (
            <div className="flex items-center gap-4 w-full p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              <LocalGlowPulseSkeleton variant="circle" className="rounded-full shrink-0" />
              <div className="flex flex-col gap-2 w-full">
                <div className="w-3/4 h-3 rounded bg-[var(--color-surface-3)]" />
                <div className="w-1/2 h-2.5 rounded bg-[var(--color-surface-3)]/60" />
              </div>
            </div>
          )}

          {variant === 'text' && (
            <div className="flex flex-col gap-3 w-full p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              <LocalGlowPulseSkeleton variant="text" className="rounded w-full" />
              <LocalGlowPulseSkeleton variant="text" className="rounded w-11/12" />
              <LocalGlowPulseSkeleton variant="text" className="rounded w-3/4" />
            </div>
          )}
        </div>
      </div>
    </SandboxLayout>
  );
}
