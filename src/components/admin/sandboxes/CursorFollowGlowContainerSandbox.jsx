import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// --- COMPONENT DEFINITION ---
function CursorFollowGlowContainer({
  children,
  className = '',
  glowSize = 200,
  glowColor = 'var(--color-primary)',
  glowOpacity = 0.15
}) {
  const containerRef = React.useRef(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 300, mass: 0.2 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const transformX = useTransform(springX, (x) => x - glowSize / 2);
  const transformY = useTransform(springY, (y) => y - glowSize / 2);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      className={`relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all duration-300 ${className}`}
    >
      <motion.div
        style={{
          x: transformX,
          y: transformY,
          width: glowSize,
          height: glowSize,
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          opacity: glowOpacity,
        }}
        className="absolute top-0 left-0 rounded-full blur-2xl pointer-events-none z-0"
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// --- SANDBOX EXPORT ---
export default function CursorFollowGlowContainerSandbox() {
  const [glowSize, setGlowSize] = useState(200);
  const [glowOpacity, setGlowOpacity] = useState(0.15);
  const [glowColor, setGlowColor] = useState('#ec4899'); // Pink default

  const controls = [
    {
      name: 'glowSize',
      label: 'Tamaño del Glow (px)',
      type: 'number',
      value: glowSize,
      min: 100,
      max: 400,
      step: 10,
      onChange: (v) => setGlowSize(v),
    },
    {
      name: 'glowOpacity',
      label: 'Opacidad del Glow',
      type: 'number',
      value: glowOpacity,
      min: 0.05,
      max: 0.5,
      step: 0.05,
      onChange: (v) => setGlowOpacity(v),
    },
    {
      name: 'glowColor',
      label: 'Color del Glow (Hex/CSS)',
      type: 'text',
      value: glowColor,
      onChange: (v) => setGlowColor(v),
    }
  ];

  return (
    <SandboxLayout
      title="CursorFollowGlowContainer"
      description="Contenedor interactivo que proyecta un halo luminoso de fondo siguiendo al puntero"
      controls={controls}
    >
      <div className="py-12 flex items-center justify-center bg-[var(--color-surface-2)] rounded-xl min-h-[350px] p-6">
        <CursorFollowGlowContainer 
          glowSize={glowSize} 
          glowOpacity={glowOpacity} 
          glowColor={glowColor}
          className="w-full max-w-sm"
        >
          <div className="flex flex-col gap-4 text-left select-none">
            <div className="flex justify-between items-center">
              <span className="text-2xl">💰</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                +18.4%
              </span>
            </div>
            <h4 className="text-sm font-medium text-[var(--color-text-muted)]">
              Ventas Totales Mensuales
            </h4>
            <div className="text-3xl font-black text-[var(--color-text)]">
              $ 14,820,500
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Mueve el mouse sobre esta tarjeta para ver el efecto de iluminación del cursor de fondo.
            </p>
          </div>
        </CursorFollowGlowContainer>
      </div>
    </SandboxLayout>
  );
}
