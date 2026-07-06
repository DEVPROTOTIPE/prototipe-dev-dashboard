import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// --- COMPONENT DEFINITION ---
function MagneticBorderContainer({
  children,
  className = '',
  borderWidth = 1.5,
  glowColor = 'var(--color-primary)',
  borderColor = 'var(--color-border)'
}) {
  const containerRef = React.useRef(null);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 250, mass: 0.3 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const bgGradient = useTransform(
    [springX, springY],
    ([x, y]) => `radial-gradient(circle 120px at ${x}px ${y}px, ${glowColor} 100%, ${borderColor} 0%)`
  );

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: `${borderWidth}px`,
        background: hovered ? bgGradient : borderColor,
      }}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${className}`}
    >
      <div className="relative w-full h-full bg-[var(--color-surface)] rounded-[14px] p-6 z-10">
        {children}
      </div>
    </motion.div>
  );
}

// --- SANDBOX EXPORT ---
export default function MagneticBorderContainerSandbox() {
  const [borderWidth, setBorderWidth] = useState(1.5);
  const [glowColor, setGlowColor] = useState('#8b5cf6'); // Purple default
  const [borderColor, setBorderColor] = useState('var(--color-border)');

  const controls = [
    {
      name: 'borderWidth',
      label: 'Grosor de Borde (px)',
      type: 'number',
      value: borderWidth,
      min: 1,
      max: 4,
      step: 0.5,
      onChange: (v) => setBorderWidth(v),
    },
    {
      name: 'glowColor',
      label: 'Color de Atracción (Hex)',
      type: 'text',
      value: glowColor,
      onChange: (v) => setGlowColor(v),
    }
  ];

  return (
    <SandboxLayout
      title="MagneticBorderContainer"
      description="Contenedor con contorno fino que proyecta iluminación perimetral interactiva siguiendo al cursor"
      controls={controls}
    >
      <div className="py-12 flex items-center justify-center bg-[var(--color-surface-2)] rounded-xl min-h-[350px] p-6">
        <MagneticBorderContainer 
          borderWidth={borderWidth} 
          glowColor={glowColor}
          borderColor={borderColor}
          className="w-full max-w-sm"
        >
          <div className="flex flex-col gap-4 text-left select-none">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-500">
              Módulo de Suscripción
            </span>
            <h4 className="text-xl font-bold text-[var(--color-text)]">
              Plan Premium Ecosistema
            </h4>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              Pasa el cursor cerca de las esquinas o bordes de esta tarjeta para observar cómo el filete de contorno se ilumina y atrae la luz dinámicamente.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                Acceso Ilimitado
              </span>
              <button className="py-2 px-4 rounded-xl bg-[var(--color-primary)] !text-white text-xs font-bold hover:opacity-90 transition-all">
                Activar Plan
              </button>
            </div>
          </div>
        </MagneticBorderContainer>
      </div>
    </SandboxLayout>
  );
}
