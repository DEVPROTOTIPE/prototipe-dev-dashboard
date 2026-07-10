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

      {/* LA GALLETA DE LA FORTUNA (Compuesta por 2 mitades SVG realistas con pliegues tridimensionales) */}
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

            <svg viewBox="0 0 100 100" className="w-44 h-44 drop-shadow-2xl overflow-visible">
              <defs>
                {/* Degradado para el cuerpo de la galleta (dorado cálido tostado con brillo) */}
                <linearGradient id="cookieBody" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffe4b5" />
                  <stop offset="60%" stopColor="#e5a95e" />
                  <stop offset="100%" stopColor="#b3732d" />
                </linearGradient>
                {/* Degradado para las sombras de los pliegues y arrugas */}
                <linearGradient id="cookieShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a06020" />
                  <stop offset="100%" stopColor="#5d350b" />
                </linearGradient>
                {/* Degradado para los brillos de relieve superior */}
                <linearGradient id="cookieHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Mitad Izquierda de la Galleta */}
              <motion.g
                exit={{ x: -35, y: 15, rotate: -30, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {/* Cuerpo Principal */}
                <path 
                  d="M 50,30 C 35,15 10,25 10,52 C 10,72 25,82 35,82 C 42,82 48,70 50,60 Z" 
                  fill="url(#cookieBody)" 
                />
                {/* Pliegue de Sombra Interior (Doble característico) */}
                <path 
                  d="M 50,60 C 48,70 42,82 35,82 C 39,78 43,68 43,58 Z" 
                  fill="url(#cookieShadow)" 
                  opacity="0.85"
                />
                {/* Brillo en el borde superior para volumen */}
                <path 
                  d="M 50,30 C 38,18 20,25 15,42 C 22,32 38,25 50,30 Z" 
                  fill="url(#cookieHighlight)" 
                />
              </motion.g>

              {/* Mitad Derecha de la Galleta */}
              <motion.g
                exit={{ x: 35, y: 15, rotate: 30, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {/* Cuerpo Principal (Un poco más oscuro para profundidad general) */}
                <path 
                  d="M 50,30 C 65,15 90,25 90,52 C 90,72 75,82 65,82 C 58,82 52,70 50,60 Z" 
                  fill="url(#cookieBody)" 
                  className="brightness-95"
                />
                {/* Pliegue de Sombra Interior */}
                <path 
                  d="M 50,60 C 52,70 58,82 65,82 C 61,78 57,68 57,58 Z" 
                  fill="url(#cookieShadow)" 
                  opacity="0.95"
                />
                {/* Brillo en el borde superior */}
                <path 
                  d="M 50,30 C 62,18 80,25 85,42 C 78,32 62,25 50,30 Z" 
                  fill="url(#cookieHighlight)" 
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
