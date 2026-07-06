import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente Local para simulación autónoma en el sandbox
function LocalShimmerGradientOverlay({
  active = true,
  opacity = 'opacity-30',
  className = ''
}) {
  if (!active) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}>
      <div 
        className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent will-change-transform ${opacity}`}
        style={{
          animation: 'shimmerSweep 1.8s infinite ease-in-out',
          width: '200%',
          transform: 'skewX(-20deg) translateX(-100%)'
        }}
      />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmerSweep {
          0% { transform: skewX(-20deg) translateX(-100%); }
          100% { transform: skewX(-20deg) translateX(100%); }
        }
      `}} />
    </div>
  );
}

export default function ShimmerGradientOverlaySandbox() {
  const [active, setActive] = useState(true);
  const [opacityClass, setOpacityClass] = useState('opacity-30');

  const controls = [
    {
      type: 'toggle',
      label: 'Brillo Activo',
      value: active,
      onChange: setActive
    },
    {
      type: 'select',
      label: 'Opacidad del Brillo',
      value: opacityClass,
      options: [
        { value: 'opacity-15', label: 'Tenue (15%)' },
        { value: 'opacity-30', label: 'Estándar (30%)' },
        { value: 'opacity-50', label: 'Intenso (50%)' }
      ],
      onChange: setOpacityClass
    }
  ];

  return (
    <SandboxLayout title="ShimmerGradientOverlay" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <div className="p-8 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full flex flex-col items-center justify-center gap-6 min-h-[220px]">
          
          {/* Tarjeta de Producto con Imagen Ficticia y Shimmer */}
          <div className="relative w-full rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md group">
            {/* Imagen Ficticia (Fondo HSL de marca con logo) */}
            <div className="w-full aspect-video bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center relative">
              <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">🛍️</span>
              {/* Overlay de Shimmer */}
              <LocalShimmerGradientOverlay active={active} opacity={opacityClass} />
            </div>

            {/* Texto de la tarjeta */}
            <div className="p-4 flex flex-col gap-2">
              <div className="w-2/3 h-3 bg-[var(--color-surface-3)] rounded" />
              <div className="w-1/2 h-2.5 bg-[var(--color-surface-3)]/60 rounded" />
            </div>
          </div>

          <span className="text-xxs text-[var(--color-text-muted)] text-center">
            Pasa el brillo metálico oblicuo simulando carga premium.
          </span>
        </div>
      </div>
    </SandboxLayout>
  );
}
