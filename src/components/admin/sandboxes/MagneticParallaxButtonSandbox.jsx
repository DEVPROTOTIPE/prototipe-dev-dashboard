import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Componente Local para el Sandbox de pruebas
function LocalMagneticParallaxButton({
  children,
  onClick,
  disabled = false,
  className = ''
}) {
  const ref = React.useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const textX = useMotionValue(0);
  const textY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.6 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const springTextX = useSpring(textX, springConfig);
  const springTextY = useSpring(textY, springConfig);

  const handleMouseMove = (e) => {
    if (disabled || !ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    x.set(distanceX * 0.35);
    y.set(distanceY * 0.35);
    textX.set(distanceX * 0.15);
    textY.set(distanceY * 0.15);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
    textX.set(0);
    textY.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.94 }}
      className={`relative flex items-center justify-center rounded-full bg-[var(--color-primary)] !text-white px-8 py-3.5 font-bold shadow-lg shadow-[var(--color-primary)]/20 transition-shadow select-none outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <motion.span
        style={{ x: springTextX, y: springTextY }}
        className="relative block pointer-events-none"
      >
        {children}
      </motion.span>
    </motion.button>
  );
}

export default function MagneticParallaxButtonSandbox() {
  const [disabled, setDisabled] = useState(false);
  const [buttonText, setButtonText] = useState('Agendar Turno 💆');
  const [clickCount, setClickCount] = useState(0);

  const controls = [
    {
      type: 'toggle',
      label: 'Deshabilitar Botón',
      value: disabled,
      onChange: setDisabled
    },
    {
      type: 'text',
      label: 'Texto del Botón',
      value: buttonText,
      onChange: setButtonText
    }
  ];

  return (
    <SandboxLayout title="MagneticParallaxButton" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <LocalParallaxContainer>
          <LocalMagneticParallaxButton
            disabled={disabled}
            onClick={() => setClickCount(c => c + 1)}
          >
            {buttonText}
          </LocalMagneticParallaxButton>
        </LocalParallaxContainer>
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] w-full text-center">
          Clicks registrados: <span className="font-mono text-[var(--color-text)] font-bold">{clickCount}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}

// Wrapper de centrado con padding de seguridad para evitar recorte
function LocalParallaxContainer({ children }) {
  return (
    <div className="relative py-8 px-12 flex justify-center items-center overflow-visible">
      {children}
    </div>
  );
}
