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

      {/* LA GALLETA DE LA FORTUNA (Compuesta por 2 mitades SVG con degradados realistas) */}
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
            className="relative z-20 flex items-center justify-center w-56 h-56 cursor-pointer group active:scale-95 transition-transform duration-200 outline-none"
          >
            {/* Halo interactivo al hover */}
            <div className="absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 bg-[var(--color-primary)]/20 blur-2xl group-hover:opacity-100 -z-10"></div>

            <svg viewBox="0 0 100 100" className="w-40 h-40 drop-shadow-2xl overflow-visible">
              <defs>
                {/* Degradado para la mitad izquierda (dorado cálido tostado con brillo) */}
                <linearGradient id="cookieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd899" />
                  <stop offset="40%" stopColor="#f3b05a" />
                  <stop offset="80%" stopColor="#d58936" />
                  <stop offset="100%" stopColor="#a05c1b" />
                </linearGradient>
                {/* Degradado para la mitad derecha (un poco más oscuro para dar sombra de volumen) */}
                <linearGradient id="cookieGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f3b05a" />
                  <stop offset="50%" stopColor="#d58936" />
                  <stop offset="100%" stopColor="#804710" />
                </linearGradient>
              </defs>

              {/* Mitad Izquierda de la Galleta */}
              <motion.g
                exit={{ x: -25, y: 15, rotate: -25, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <path 
                  d="M 50,15 C 28,15 10,25 5,48 C -1,73 14,90 35,90 C 38,90 40,85 41,80 C 42,75 35,68 30,52 C 24,35 45,20 50,15 Z" 
                  fill="url(#cookieGrad)" 
                />
              </motion.g>

              {/* Mitad Derecha de la Galleta */}
              <motion.g
                exit={{ x: 25, y: 15, rotate: 25, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <path 
                  d="M 50,15 C 72,15 90,25 95,48 C 101,73 86,90 65,90 C 62,90 60,85 59,80 C 58,75 65,68 70,52 C 76,35 55,20 50,15 Z" 
                  fill="url(#cookieGradDark)" 
                />
              </motion.g>
            </svg>

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
