import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import { motion } from 'framer-motion';

// --- COMPONENT DEFINITION ---
function ParallaxZoomCard({
  children,
  className = '',
  imageSrc = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
  zoomScale = 1.08,
  textOffset = -10
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md transition-shadow duration-300 ${
        hovered ? 'shadow-xl shadow-[var(--color-primary)]/5' : ''
      } ${className}`}
    >
      <div className="relative w-full h-48 overflow-hidden">
        <motion.img
          animate={{ scale: hovered ? zoomScale : 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          src={imageSrc}
          alt="Visual del producto"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
      </div>

      <motion.div
        animate={{ y: hovered ? textOffset : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-10 p-5 bg-[var(--color-surface)] rounded-b-2xl"
      >
        {children}
      </motion.div>
    </div>
  );
}

// --- SANDBOX EXPORT ---
export default function ParallaxZoomCardSandbox() {
  const [zoomScale, setZoomScale] = useState(1.08);
  const [textOffset, setTextOffset] = useState(-10);

  const controls = [
    {
      name: 'zoomScale',
      label: 'Escala de Zoom',
      type: 'number',
      value: zoomScale,
      min: 1.02,
      max: 1.20,
      step: 0.02,
      onChange: (v) => setZoomScale(v),
    },
    {
      name: 'textOffset',
      label: 'Desplazamiento Vertical (px)',
      type: 'number',
      value: textOffset,
      min: -20,
      max: 0,
      step: 2,
      onChange: (v) => setTextOffset(v),
    }
  ];

  return (
    <SandboxLayout
      title="ParallaxZoomCard"
      description="Tarjeta interactiva con zoom en la imagen de fondo y desplazamiento invertido en textos"
      controls={controls}
    >
      <div className="py-12 flex items-center justify-center bg-[var(--color-surface-2)] rounded-xl min-h-[400px] p-6">
        <ParallaxZoomCard 
          zoomScale={zoomScale} 
          textOffset={textOffset}
          imageSrc="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80" // Pastel rústico
          className="w-full max-w-sm"
        >
          <div className="flex flex-col gap-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-[var(--color-primary)] uppercase">
                Pastelería Gourmet
              </span>
              <span className="text-xs font-black text-amber-500">★ 4.9</span>
            </div>
            <h4 className="text-lg font-bold text-[var(--color-text)]">
              Mousse de Frutos del Bosque
            </h4>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Base de galleta artesanal, mousse cremosa de mora silvestre y arándanos frescos con salsa de oporto.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-base font-extrabold text-[var(--color-text)]">$ 18.500</span>
              <span className="text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Listo en 20 mins
              </span>
            </div>
          </div>
        </ParallaxZoomCard>
      </div>
    </SandboxLayout>
  );
}
