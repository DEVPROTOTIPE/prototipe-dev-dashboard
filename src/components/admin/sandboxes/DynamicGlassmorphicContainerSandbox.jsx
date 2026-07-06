import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import { motion } from 'framer-motion';

// --- COMPONENT DEFINITION ---
function DynamicGlassmorphicContainer({
  children,
  className = '',
  baseBlur = 12,
  hoverBlur = 18,
  glowColor = 'var(--color-primary)'
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{
        borderColor: 'rgba(255, 255, 255, 0.25)',
        boxShadow: `0 20px 40px -15px ${glowColor}20`,
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        backdropFilter: hovered ? `blur(${hoverBlur}px)` : `blur(${baseBlur}px)`,
        WebkitBackdropFilter: hovered ? `blur(${hoverBlur}px)` : `blur(${baseBlur}px)`,
      }}
      className={`relative rounded-2xl border border-white/10 bg-white/[0.05] dark:bg-black/[0.15] p-6 shadow-xl ${className}`}
    >
      <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

// --- SANDBOX EXPORT ---
export default function DynamicGlassmorphicContainerSandbox() {
  const [baseBlur, setBaseBlur] = useState(12);
  const [hoverBlur, setHoverBlur] = useState(18);
  const [glowColor, setGlowColor] = useState('#3b82f6'); // Blue default

  const controls = [
    {
      name: 'baseBlur',
      label: 'Desenfoque Base (px)',
      type: 'number',
      value: baseBlur,
      min: 4,
      max: 20,
      step: 1,
      onChange: (v) => setBaseBlur(v),
    },
    {
      name: 'hoverBlur',
      label: 'Desenfoque Hover (px)',
      type: 'number',
      value: hoverBlur,
      min: 8,
      max: 32,
      step: 1,
      onChange: (v) => setHoverBlur(v),
    },
    {
      name: 'glowColor',
      label: 'Color de Sombra (Hex)',
      type: 'text',
      value: glowColor,
      onChange: (v) => setGlowColor(v),
    }
  ];

  return (
    <SandboxLayout
      title="DynamicGlassmorphicContainer"
      description="Contenedor translúcido premium con ajuste dinámico de blur y brillo perimetral en hover"
      controls={controls}
    >
      {/* Fondo degradado colorido para apreciar el refracción acrílica */}
      <div className="py-12 px-6 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-xl min-h-[350px] overflow-hidden relative">
        {/* Elemento de color flotante en el fondo */}
        <div className="absolute w-36 h-36 rounded-full bg-pink-500 blur-2xl top-1/4 left-1/4 animate-pulse pointer-events-none" />
        <div className="absolute w-44 h-44 rounded-full bg-indigo-500 blur-2xl bottom-1/4 right-1/4 animate-bounce pointer-events-none" />
        
        <DynamicGlassmorphicContainer 
          baseBlur={baseBlur} 
          hoverBlur={hoverBlur} 
          glowColor={glowColor}
          className="w-full max-w-sm"
        >
          <div className="flex flex-col gap-4 text-left select-none text-white">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-300">
              Cotizador de Presupuesto
            </span>
            <h4 className="text-xl font-bold leading-tight">
              Diseño de Planos Estructurales
            </h4>
            <p className="text-sm text-white/70 leading-relaxed">
              Pasa el cursor por encima para percibir cómo el desenfoque se intensifica y aísla el contenido del fondo con ruido.
            </p>
            <div className="mt-2 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-sm text-white/50">Costo Estimado</span>
              <span className="text-lg font-black text-white">$ 1,800,000 COP</span>
            </div>
          </div>
        </DynamicGlassmorphicContainer>
      </div>
    </SandboxLayout>
  );
}
