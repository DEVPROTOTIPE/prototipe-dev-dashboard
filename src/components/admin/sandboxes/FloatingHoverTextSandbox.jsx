import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import { motion } from 'framer-motion';

// --- COMPONENT DEFINITION ---
function FloatingHoverText({
  text = 'PROTOTIPE',
  className = '',
  bounceHeight = -8,
  stiffness = 300,
  damping = 10,
  letterSpacing = '0.04em'
}) {
  const characters = text.split('');

  const containerVariants = {
    initial: {},
    hover: {}
  };

  const letterVariants = {
    initial: { y: 0 },
    hover: (i) => ({
      y: [0, bounceHeight, 0],
      transition: {
        type: 'spring',
        stiffness: stiffness,
        damping: damping,
        delay: i * 0.035,
      }
    })
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="initial"
      whileHover="hover"
      style={{ letterSpacing }}
      className={`inline-flex items-center cursor-default select-none ${className}`}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          custom={index}
          variants={letterVariants}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// --- SANDBOX EXPORT ---
export default function FloatingHoverTextSandbox() {
  const [text, setText] = useState('EXPLORAR CATALOGO');
  const [bounceHeight, setBounceHeight] = useState(-8);
  const [damping, setDamping] = useState(10);

  const controls = [
    {
      name: 'text',
      label: 'Texto del Componente',
      type: 'text',
      value: text,
      onChange: (v) => setText(v),
    },
    {
      name: 'bounceHeight',
      label: 'Altura del Rebote (px)',
      type: 'number',
      value: bounceHeight,
      min: -20,
      max: -2,
      step: 1,
      onChange: (v) => setBounceHeight(v),
    },
    {
      name: 'damping',
      label: 'Amortiguación Física (Damping)',
      type: 'number',
      value: damping,
      min: 4,
      max: 20,
      step: 1,
      onChange: (v) => setDamping(v),
    }
  ];

  return (
    <SandboxLayout
      title="FloatingHoverText"
      description="Texto premium cuyas letras rebotan elásticamente en ola staggered al hacer hover"
      controls={controls}
    >
      <div className="py-12 flex items-center justify-center bg-[var(--color-surface-2)] rounded-xl min-h-[350px] p-6">
        <div className="text-center flex flex-col gap-6">
          <h5 className="text-xs font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
            Pasa el cursor por encima del texto de abajo
          </h5>
          <FloatingHoverText 
            text={text} 
            bounceHeight={bounceHeight}
            damping={damping}
            className="text-3xl font-black text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors duration-300"
          />
        </div>
      </div>
    </SandboxLayout>
  );
}
