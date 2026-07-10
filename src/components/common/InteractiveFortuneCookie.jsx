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
  const [isBreaking, setIsBreaking] = useState(false);

  const handleBreak = () => {
    if (isBroken || isBreaking) return;
    
    setIsBreaking(true);
    
    // Pequeño retardo de vibración/shake antes de la ruptura física
    setTimeout(() => {
      // Ráfaga de confeti premium con tonos dorados y crema (masa de galleta)
      const colors = ['#f59e0b', '#fcd34d', '#ffe4b5', '#ffffff'];
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: colors,
        disableForReducedMotion: true,
        zIndex: 50
      });

      setIsBroken(true);
      setIsBreaking(false);
    }, 450); // Tiempo del efecto shake/temblor
  };

  const handleReset = () => {
    setIsBroken(false);
    setIsBreaking(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[340px] p-8 overflow-visible select-none">
      
      {/* EL PAPEL DE LA FORTUNA (Emerge elásticamente desde el centro al romperse) */}
      <AnimatePresence>
        {isBroken && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 60, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 14, stiffness: 180, delay: 0.25 }}
            className="absolute z-30 flex flex-col items-center w-full max-w-sm p-6 mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] shadow-soft-2xl rounded-3xl backdrop-blur-md"
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

      {/* CONTENEDOR DE LA GALLETA (Permanece montado para dar soporte a la animación de separación de las mitades) */}
      <div className="relative z-20 flex items-center justify-center w-64 h-64">
        
        <motion.button
          onClick={handleBreak}
          aria-label="Romper galleta de la fortuna"
          animate={isBreaking 
            ? { 
                rotate: [0, -6, 6, -6, 6, 0], 
                scale: 0.95 
              } 
            : isBroken 
              ? { scale: 0.9 }
              : { y: [0, -8, 0] }
          }
          transition={isBreaking 
            ? { duration: 0.45, ease: 'easeInOut' } 
            : isBroken 
              ? { duration: 0.2 } 
              : { repeat: Infinity, duration: 3, ease: 'easeInOut' }
          }
          className="relative w-full h-full flex items-center justify-center cursor-pointer group active:scale-95 transition-transform duration-200 outline-none"
          disabled={isBroken || isBreaking}
        >
          {/* Halo interactivo al hover */}
          {!isBroken && !isBreaking && (
            <div className="absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 bg-[var(--color-primary)]/15 blur-2xl group-hover:opacity-100 -z-10"></div>
          )}

          {/* SVG rotado 180 grados para situar el lomo continuo abajo y las puntas/hendidura arriba */}
          <svg viewBox="0 0 100 100" className="w-48 h-48 drop-shadow-2xl overflow-visible rotate-180">
            <defs>
              {/* Degradado para el cuerpo de la galleta (dorado cálido tostado con brillo) */}
              <linearGradient id="cookieBody" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffebb3" />
                <stop offset="50%" stopColor="#e5a95e" />
                <stop offset="100%" stopColor="#b3732d" />
              </linearGradient>
              {/* Degradado para las sombras de los pliegues y arrugas */}
              <linearGradient id="cookieShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a06020" />
                <stop offset="100%" stopColor="#5d350b" />
              </linearGradient>
              {/* Degradado para los brillos de relieve superior */}
              <linearGradient id="cookieHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Mitad Izquierda de la Galleta (Animación adaptada a la inversión local de ejes por rotate-180) */}
            <motion.g
              animate={isBroken 
                ? { x: 85, y: -40, rotate: 45, opacity: 0 } 
                : { x: 0, y: 0, rotate: 0, opacity: 1 }
              }
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Cuerpo Principal (Curvatura continua abajo localmente, puntas afiladas arriba localmente) */}
              <path 
                d="M 50,18 C 35,18 12,22 6,44 C 1,63 12,81 24,84 C 28,80 41,68 50,52 Z" 
                fill="url(#cookieBody)" 
              />
              {/* Pliegue de Sombra Interior */}
              <path 
                d="M 50,52 C 43,65 30,78 24,84 C 28,80 41,68 44,58 Z" 
                fill="url(#cookieShadow)" 
                opacity="0.85"
              />
              {/* Brillo en el lomo superior */}
              <path 
                d="M 50,18 C 38,18 20,25 14,40 C 22,30 38,22 50,18 Z" 
                fill="url(#cookieHighlight)" 
              />
            </motion.g>

            {/* Mitad Derecha de la Galleta (Animación adaptada) */}
            <motion.g
              animate={isBroken 
                ? { x: -85, y: -40, rotate: -45, opacity: 0 } 
                : { x: 0, y: 0, rotate: 0, opacity: 1 }
              }
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Cuerpo Principal (Simétrico) */}
              <path 
                d="M 50,18 C 65,18 88,22 94,44 C 99,63 88,81 76,84 C 72,80 59,68 50,52 Z" 
                fill="url(#cookieBody)" 
                className="brightness-95"
              />
              {/* Pliegue de Sombra Interior */}
              <path 
                d="M 50,52 C 57,65 70,78 76,84 C 72,80 59,68 56,58 Z" 
                fill="url(#cookieShadow)" 
                opacity="0.95"
              />
              {/* Brillo en el lomo superior */}
              <path 
                d="M 50,18 C 62,18 80,25 86,40 C 78,30 62,22 50,18 Z" 
                fill="url(#cookieHighlight)" 
              />
            </motion.g>
          </svg>

          {/* Micro-icono flotante central (Solo visible en estado cerrado) */}
          {!isBroken && !isBreaking && (
            <div className="absolute flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shadow-soft-sm text-white transition-opacity group-hover:scale-110">
              <Sparkles size={16} />
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
}
