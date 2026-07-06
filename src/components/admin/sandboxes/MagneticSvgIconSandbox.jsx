import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// --- COMPONENT DEFINITION ---
function MagneticSvgIcon({
  className = '',
  size = 28,
  maxOffset = 6,
  glowColor = 'var(--color-primary)'
}) {
  const [hovered, setHovered] = useState(false);
  const iconRef = React.useRef(null);

  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 250, mass: 0.5 };
  const springX = useSpring(offsetX, springConfig);
  const springY = useSpring(offsetY, springConfig);

  const handleMouseMove = (e) => {
    if (!iconRef.current) return;
    const rect = iconRef.current.getBoundingClientRect();
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    const length = Math.hypot(dx, dy);
    const scale = length > 0 ? Math.min(maxOffset, length * 0.15) / length : 0;

    offsetX.set(dx * scale);
    offsetY.set(dy * scale);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    offsetX.set(0);
    offsetY.set(0);
  };

  return (
    <motion.div
      ref={iconRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
      }}
      className={`relative flex items-center justify-center cursor-pointer p-4 rounded-full transition-colors ${
        hovered ? 'bg-[var(--color-surface-3)]' : 'bg-transparent'
      } ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={hovered ? glowColor : 'none'}
        stroke={hovered ? glowColor : 'var(--color-text)'}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300 transform scale-100 hover:scale-110"
      >
        <motion.path
          animate={hovered ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.4 }}
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        />
      </svg>
    </motion.div>
  );
}

// --- SANDBOX EXPORT ---
export default function MagneticSvgIconSandbox() {
  const [maxOffset, setMaxOffset] = useState(6);
  const [glowColor, setGlowColor] = useState('#ef4444'); // Red default (heart)

  const controls = [
    {
      name: 'maxOffset',
      label: 'Radio Magnético Máximo (px)',
      type: 'number',
      value: maxOffset,
      min: 2,
      max: 12,
      step: 1,
      onChange: (v) => setMaxOffset(v),
    },
    {
      name: 'glowColor',
      label: 'Color de Hover Relleno (Hex)',
      type: 'text',
      value: glowColor,
      onChange: (v) => setGlowColor(v),
    }
  ];

  return (
    <SandboxLayout
      title="MagneticSvgIcon"
      description="Icono SVG premium con micro-atracción magnética de cursor y rebote spring al hacer hover"
      controls={controls}
    >
      <div className="py-12 flex flex-col items-center justify-center bg-[var(--color-surface-2)] rounded-xl min-h-[350px] p-6 gap-6">
        <h5 className="text-xs font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
          Acerca el mouse al corazón de abajo
        </h5>
        
        <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-md flex items-center justify-center w-28 h-28">
          <MagneticSvgIcon maxOffset={maxOffset} glowColor={glowColor} size={32} />
        </div>
      </div>
    </SandboxLayout>
  );
}
