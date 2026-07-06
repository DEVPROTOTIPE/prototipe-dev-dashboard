import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import { motion } from 'framer-motion';

// --- COMPONENT DEFINITION ---
function LightBeamDivider({
  className = '',
  height = 1,
  duration = 3.5,
  glowColor = 'var(--color-primary)',
  beamWidth = 120
}) {
  return (
    <div
      style={{ height: `${height}px` }}
      className={`relative w-full bg-[var(--color-border)]/40 overflow-hidden ${className}`}
    >
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: duration,
          ease: 'easeInOut',
        }}
        style={{
          width: beamWidth,
          background: `linear-gradient(to right, transparent, ${glowColor}, transparent)`,
        }}
        className="absolute inset-y-0 left-0 h-full filter blur-[1px]"
      />
    </div>
  );
}

// --- SANDBOX EXPORT ---
export default function LightBeamDividerSandbox() {
  const [height, setHeight] = useState(1);
  const [duration, setDuration] = useState(3.5);
  const [beamWidth, setBeamWidth] = useState(120);
  const [glowColor, setGlowColor] = useState('#22c55e'); // Green default

  const controls = [
    {
      name: 'height',
      label: 'Altura del Divisor (px)',
      type: 'number',
      value: height,
      min: 1,
      max: 4,
      step: 1,
      onChange: (v) => setHeight(v),
    },
    {
      name: 'duration',
      label: 'Duración del Ciclo (s)',
      type: 'number',
      value: duration,
      min: 1.5,
      max: 8.0,
      step: 0.5,
      onChange: (v) => setDuration(v),
    },
    {
      name: 'beamWidth',
      label: 'Ancho del Haz de Luz (px)',
      type: 'number',
      value: beamWidth,
      min: 60,
      max: 300,
      step: 20,
      onChange: (v) => setBeamWidth(v),
    },
    {
      name: 'glowColor',
      label: 'Color del Haz (Hex)',
      type: 'text',
      value: glowColor,
      onChange: (v) => setGlowColor(v),
    }
  ];

  return (
    <SandboxLayout
      title="LightBeamDivider"
      description="Línea divisora de sección ultra-delgada con un haz de luz láser periódico infinito"
      controls={controls}
    >
      <div className="py-12 flex flex-col items-center justify-center bg-[var(--color-surface-2)] rounded-xl min-h-[350px] p-8 gap-8">
        <div className="w-full max-w-md bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] flex flex-col gap-6 text-left select-none">
          <div className="flex justify-between items-center text-xs font-semibold text-[var(--color-text-muted)]">
            <span>RESUMEN FINANCIERO</span>
            <span>DIARIO POS</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[var(--color-text-muted)]">Ingresos Brutos</span>
            <span className="text-sm font-extrabold text-[var(--color-text)]">$ 1,450,000</span>
          </div>

          {/* Divisor */}
          <LightBeamDivider 
            height={height} 
            duration={duration} 
            beamWidth={beamWidth} 
            glowColor={glowColor} 
          />

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[var(--color-text-muted)]">Gastos / Deducciones</span>
            <span className="text-sm font-extrabold text-rose-500">- $ 280,000</span>
          </div>

          <LightBeamDivider 
            height={height} 
            duration={duration} 
            beamWidth={beamWidth} 
            glowColor={glowColor} 
          />

          <div className="flex justify-between items-center pt-2">
            <span className="text-base font-bold text-[var(--color-text)]">Ganancia Neta</span>
            <span className="text-lg font-black text-emerald-500">$ 1,170,000</span>
          </div>
        </div>
      </div>
    </SandboxLayout>
  );
}
