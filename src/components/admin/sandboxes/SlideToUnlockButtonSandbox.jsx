import React, { useState, useRef, useEffect } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion, useMotionValue, useTransform } from 'framer-motion';

// Componente Local para simulación autónoma en el sandbox con cálculo de ancho responsivo
function LocalSlideToUnlockButton({
  onUnlock,
  text = 'Desliza para confirmar',
  successText = 'Confirmado exitosamente',
  disabled = false,
  resetTrigger = 0
}) {
  const containerRef = useRef(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const dragX = useMotionValue(0);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 200 });

  useEffect(() => {
    setIsUnlocked(false);
    dragX.set(0);
  }, [resetTrigger, dragX]);

  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setDragConstraints({ left: 0, right: width - 58 }); // 48px tirador + 10px padding/márgenes
    }
  }, [resetTrigger]);

  const textOpacity = useTransform(dragX, [0, 150], [1, 0]);

  const handleDragEnd = () => {
    if (disabled || !containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const handleWidth = 48;
    const limit = containerWidth - handleWidth - 12;

    if (dragX.get() >= limit) {
      setIsUnlocked(true);
      if (onUnlock) onUnlock();
    } else {
      dragX.set(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-14 rounded-full flex items-center p-1 border select-none transition-colors duration-300
        ${isUnlocked 
          ? 'bg-green-500 border-green-600' 
          : 'bg-[var(--color-surface-3)] border-[var(--color-border)]'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
      `}
    >
      {/* Texto guía de fondo confinado al área libre de deslizamiento para evitar solapamientos */}
      <motion.div
        style={{ opacity: isUnlocked ? 0 : textOpacity }}
        className="absolute left-14 right-4 inset-y-0 flex items-center justify-center text-xs font-semibold text-[var(--color-text-muted)]/60 pointer-events-none select-none"
      >
        {text} ➔
      </motion.div>

      {isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white pointer-events-none">
          ✓ {successText}
        </div>
      )}

      {!isUnlocked && (
        <motion.div
          drag="x"
          dragConstraints={dragConstraints}
          dragElastic={0.05}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{ x: dragX }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white cursor-grab active:cursor-grabbing shadow-md z-10"
        >
          ➔
        </motion.div>
      )}
    </div>
  );
}

export default function SlideToUnlockButtonSandbox() {
  const [disabled, setDisabled] = useState(false);
  const [text, setText] = useState('Deslizar para Cerrar Caja');
  const [unlocked, setUnlocked] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const controls = [
    {
      type: 'toggle',
      label: 'Deshabilitar Deslizador',
      value: disabled,
      onChange: setDisabled
    },
    {
      type: 'text',
      label: 'Texto Guía',
      value: text,
      onChange: setText
    }
  ];

  return (
    <SandboxLayout title="SlideToUnlockButton" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <LocalSlideToUnlockButton
          key={resetKey}
          text={text}
          successText="Caja Cerrada con Éxito"
          disabled={disabled}
          resetTrigger={resetKey}
          onUnlock={() => setUnlocked(true)}
        />
        <div className="flex gap-2 w-full">
          <button
            onClick={() => {
              setUnlocked(false);
              setResetKey(prev => prev + 1);
            }}
            className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-all outline-none"
          >
            Resetear Estado
          </button>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] w-full text-center">
          Estado: <span className="font-mono text-[var(--color-text)] font-bold">{unlocked ? 'DESBLOQUEADO (CONFIRMADO)' : 'BLOQUEADO'}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
