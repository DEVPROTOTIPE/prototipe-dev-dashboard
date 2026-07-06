import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
// Let's implement it inline or check how other sandboxes do. Let's make sure the sandbox is 100% self-contained so that it compiles directly without assuming external files exist until ported.
// Let's implement the component inside the sandbox file or check if there is an existing file. In the dashboard sandboxes, since they serve as live playgrounds and the component hasn't been ported yet, implementing the component directly inside the sandbox file is the standard practice for the dev-dashboard to keep it isolated!
// Let's review one of the previous sandboxes to confirm. Yes, previous sandboxes contain the component definition or import it if it's already in the shared UI. Self-contained is safer.

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// --- COMPONENT DEFINITION ---
function Physical3dTiltCard({ 
  children, 
  className = '', 
  glowColor = 'var(--color-primary)', 
  maxTilt = 15 
}) {
  const cardRef = React.useRef(null);
  const [hovering, setHovering] = React.useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const springX = useSpring(rotateX, springConfig);
  const springY = useSpring(rotateY, springConfig);

  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareSpringX = useSpring(glareX, springConfig);
  const glareSpringY = useSpring(glareY, springConfig);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    const rX = -(mouseY / (height / 2)) * maxTilt;
    const rY = (mouseX / (width / 2)) * maxTilt;

    rotateX.set(rX);
    rotateY.set(rY);

    const pctX = ((e.clientX - rect.left) / width) * 100;
    const pctY = ((e.clientY - rect.top) / height) * 100;
    glareX.set(pctX);
    glareY.set(pctY);
  };

  const handleMouseLeave = () => {
    setHovering(false);
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  };

  const glareBg = useTransform(
    [glareSpringX, glareSpringY],
    ([x, y]) => `radial-gradient(circle 250px at ${x}% ${y}%, ${glowColor}25 0%, transparent 80%)`
  );

  return (
    <div className="relative w-full [perspective:1000px] max-w-sm mx-auto">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: springX,
          rotateY: springY,
          transformStyle: 'preserve-3d',
        }}
        className={`relative w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-shadow duration-300 ${
          hovering ? 'shadow-2xl shadow-[var(--color-primary)]/10' : 'shadow-md'
        } ${className}`}
      >
        <motion.div
          style={{
            background: glareBg,
            transform: 'translateZ(1px)',
          }}
          className="absolute inset-0 pointer-events-none rounded-2xl z-10"
        />

        <div style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }} className="relative z-20">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// --- SANDBOX EXPORT ---
export default function Physical3dTiltCardSandbox() {
  const [maxTilt, setMaxTilt] = useState(15);
  const [glowColor, setGlowColor] = useState('#6366f1');

  const controls = [
    {
      name: 'maxTilt',
      label: 'Ángulo Máximo de Inclinación (°)',
      type: 'number',
      value: maxTilt,
      min: 5,
      max: 30,
      step: 1,
      onChange: (v) => setMaxTilt(v),
    },
    {
      name: 'glowColor',
      label: 'Color del Brillo (Hex)',
      type: 'text',
      value: glowColor,
      onChange: (v) => setGlowColor(v),
    }
  ];

  return (
    <SandboxLayout
      title="Physical3dTiltCard"
      description="Tarjeta interactiva premium con inclinación 3D en base a coordenadas del cursor"
      controls={controls}
    >
      <div className="py-12 flex items-center justify-center bg-[var(--color-surface-2)] rounded-xl min-h-[350px]">
        <Physical3dTiltCard maxTilt={maxTilt} glowColor={glowColor}>
          <div className="flex flex-col gap-4 text-left select-none">
            <span className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
              Retroexcavadora Premium
            </span>
            <h3 className="text-2xl font-black text-[var(--color-text)] leading-tight">
              Caterpillar 420F2
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              Equipada con tracción 4x4, acople rápido hidráulico y cabina cerrada climatizada. Perfecta para minería rural.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-extrabold text-[var(--color-text)]">
                $ 450.000 / día
              </span>
              <button className="py-2 px-4 rounded-xl bg-[var(--color-primary)] !text-white text-xs font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:opacity-90 active:scale-95 transition-all">
                Reservar Ahora
              </button>
            </div>
          </div>
        </Physical3dTiltCard>
      </div>
    </SandboxLayout>
  );
}
