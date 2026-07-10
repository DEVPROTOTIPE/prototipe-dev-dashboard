import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, Quote } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function InteractiveFortuneCookie({ 
  // Texto dinámico programable por el cliente o la base de datos
  fortuneText = "La organización hoy, será tu mayor ganancia de mañana.",
  author = "PROTOTIPE Ecosistema"
}) {
  const [isBroken, setIsBroken] = useState(false);

  const handleBreak = () => {
    if (isBroken) return;
    
    // Ráfaga de confeti premium sincronizada con la ruptura (colores dorados de galleta)
    const colors = ['#f59e0b', '#fcd34d', '#ffffff'];
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: colors,
      disableForReducedMotion: true,
      zIndex: 50
    });

    setIsBroken(true);
  };

  const handleReset = () => {
    setIsBroken(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[300px] p-8 overflow-visible">
      
      {/* EL PAPEL DE LA FORTUNA (Se revela al romperse) */}
      <AnimatePresence>
        {isBroken && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
            className="absolute z-10 flex flex-col items-center w-full max-w-sm p-6 mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] shadow-soft-2xl rounded-3xl backdrop-blur-md"
          >
            <Quote className="w-8 h-8 mb-3 text-[var(--color-primary)]/40" />
            <p className="text-base font-medium text-center text-[var(--color-text)] leading-relaxed">
              "{fortuneText}"
            </p>
            {author && (
              <span className="mt-3 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)]">
                — {author}
              </span>
            )}
            
            <button
              onClick={handleReset}
              aria-label="Romper otra galleta"
              className="mt-6 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 rounded-full transition-colors active:scale-95"
            >
              <RotateCcw size={14} />
              <span>Probar de nuevo</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LA GALLETA DE LA FORTUNA (Compuesta por 2 mitades SVG) */}
      <AnimatePresence>
        {!isBroken && (
          <motion.button
            onClick={handleBreak}
            aria-label="Romper galleta de la fortuna"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              y: [0, -8, 0] // Levitación suave infinita
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              y: { repeat: Infinity, duration: 3, ease: 'easeInOut' }
            }}
            className="relative z-20 flex items-center justify-center w-48 h-48 cursor-pointer group active:scale-95 transition-transform duration-200 outline-none"
          >
            {/* Halo interactivo al hover */}
            <div className="absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 bg-[var(--color-primary)]/20 blur-2xl group-hover:opacity-100 -z-10"></div>

            {/* Mitad Izquierda */}
            <motion.div
              exit={{ x: -60, y: 20, rotate: -45, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute drop-shadow-xl text-[var(--color-primary)]"
            >
              <svg viewBox="0 0 100 100" className="w-32 h-32">
                <path 
                  d="M 50 15 C 20 15 10 40 10 65 C 10 85 30 95 50 95 C 65 95 70 80 50 55 C 35 35 50 15 50 15 Z" 
                  fill="currentColor" 
                />
              </svg>
            </motion.div>

            {/* Mitad Derecha */}
            <motion.div
              exit={{ x: 60, y: 20, rotate: 45, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute drop-shadow-xl text-[var(--color-primary)] brightness-90"
            >
              <svg viewBox="0 0 100 100" className="w-32 h-32">
                <path 
                  d="M 50 15 C 80 15 90 40 90 65 C 90 85 70 95 50 95 C 35 95 30 80 50 55 C 65 35 50 15 50 15 Z" 
                  fill="currentColor" 
                />
              </svg>
            </motion.div>

            {/* Micro-icono flotante central */}
            <div className="absolute flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shadow-soft-sm text-white">
              <Sparkles size={16} />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
