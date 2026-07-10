import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles, Navigation } from 'lucide-react';
import confetti from 'canvas-confetti';

// Configuración por defecto (Totalmente inyectable desde Zustand o Props)
const DEFAULT_PRIZES = [
  { id: 1, label: "10% DCTO" },
  { id: 2, label: "Envío Gratis" },
  { id: 3, label: "Premio Sorpresa" },
  { id: 4, label: "Sigue Intentando" },
  { id: 5, label: "5% DCTO" },
  { id: 6, label: "2x1 Hoy" }
];

export default function InteractiveFortuneWheel({ 
  prizes = DEFAULT_PRIZES,
  onPrizeWon = (prize) => console.log("Premio ganado:", prize)
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [resultModal, setResultModal] = useState(null);

  // Cálculos geométricos para dibujar la ruleta dinámicamente
  const sliceAngle = 360 / prizes.length;
  
  // Generador del gradiente cónico dinámico usando tokens HSL de PROTOTIPE
  const wheelGradient = prizes.map((_, i) => {
    const color = i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-surface-2)';
    return `${color} ${i * sliceAngle}deg ${(i + 1) * sliceAngle}deg`;
  }).join(', ');

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResultModal(null);

    // Selección aleatoria matemática del premio
    const winningIndex = Math.floor(Math.random() * prizes.length);
    
    // Física de rotación real:
    // 1. Centro de la porción ganadora dentro del ciclo de 360°
    const sliceCenter = (winningIndex * sliceAngle) + (sliceAngle / 2);
    // 2. Ángulo necesario para que ese centro quede en la cima (0°)
    const targetRelativeAngle = 360 - sliceCenter;
    // 3. 5 vueltas de suspenso acumuladas sobre la rotación actual
    const extraSpins = 5 * 360;
    const nextRotation = rotation + extraSpins + targetRelativeAngle - (rotation % 360);

    setRotation(nextRotation);

    // Esperar a que la animación de física concluya (6 segundos)
    setTimeout(() => {
      setIsSpinning(false);
      
      // Confeti premium sólo si ganó un premio real
      if (prizes[winningIndex].label.toLowerCase() !== "sigue intentando") {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#fcd34d', '#ffffff'],
          disableForReducedMotion: true,
          zIndex: 60
        });
      }

      setResultModal(prizes[winningIndex]);
      onPrizeWon(prizes[winningIndex]);
    }, 6000);
  };

  const closeModal = () => setResultModal(null);

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[450px] p-6 overflow-hidden">
      
      {/* Halo Magnético Dinámico */}
      <div 
        className={`absolute inset-0 m-auto w-72 h-72 rounded-full bg-[var(--color-primary)] blur-3xl -z-10 transition-opacity duration-1000 ${
          isSpinning ? 'opacity-40 animate-pulse' : 'opacity-10'
        }`}
      />

      {/* Puntero Superior — FUERA del disco, en el flujo flex-column */}
      <div className="flex flex-col items-center z-20 mb-[-6px]">
        <Navigation size={32} strokeWidth={3.5} className="fill-[var(--color-primary)] text-[var(--color-primary)] drop-shadow-[0_2px_8px_var(--color-primary)] rotate-180" />
        <div className="w-0.5 h-3 bg-[var(--color-primary)] rounded-full opacity-70" />
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="relative flex items-center justify-center w-72 h-72">

        {/* Disco Giratorio */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 6, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative w-full h-full rounded-full shadow-soft-2xl border-4 border-[var(--color-surface)] overflow-hidden"
          style={{ background: `conic-gradient(${wheelGradient})` }}
        >
          {/* Etiquetas de premios */}
          {prizes.map((prize, i) => {
            const rotationAngle = (i * sliceAngle) + (sliceAngle / 2);
            const isDarkBg = i % 2 === 0;
            return (
              <div 
                key={prize.id}
                className="absolute top-0 left-0 w-full h-full flex items-start justify-center pt-6"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              >
                <span 
                  className={`text-xs font-bold uppercase tracking-wider ${isDarkBg ? '!text-white' : 'text-[var(--color-text)]'}`}
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  {prize.label}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Botón Central (Eje) */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="absolute z-10 flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-surface)] border-[6px] border-[var(--color-primary)] text-[var(--color-primary)] shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-80 disabled:hover:scale-100 disabled:cursor-not-allowed outline-none"
          aria-label="Girar Ruleta"
        >
          <Gift size={24} strokeWidth={2.5} />
        </button>
      </div>

      <p className="mt-8 text-sm font-medium text-[var(--color-text-muted)]">
        {isSpinning ? "¡Cruzando los dedos! 🤞" : "Toca el regalo central para girar"}
      </p>

      {/* MODAL DE RESULTADO */}
      <AnimatePresence>
        {resultModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="absolute inset-0 z-40" onClick={closeModal}></div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative z-50 w-full max-w-sm p-8 text-center overflow-hidden rounded-3xl bg-[var(--color-surface)] shadow-soft-2xl border border-[var(--color-border)]"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[var(--color-primary)]/20 to-transparent -z-10 pointer-events-none"></div>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface-2)] rounded-full transition-colors active:scale-95"
              >
                <X size={18} />
              </button>
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                <Sparkles size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-display font-bold text-[var(--color-text)] leading-tight mb-2">
                {resultModal.label.toLowerCase() === "sigue intentando" ? "¡Casi lo logras!" : "¡Felicidades!"}
              </h3>
              <p className="text-[var(--color-text-muted)] mb-6">
                {resultModal.label.toLowerCase() === "sigue intentando" 
                  ? "La suerte te acompañará en la próxima vuelta." 
                  : `Has ganado: ${resultModal.label}. Tu premio ha sido agregado a tu cuenta.`}
              </p>
              <button 
                onClick={closeModal}
                className="w-full py-3 text-sm font-bold !text-white transition-transform rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 active:scale-95 shadow-soft-md"
              >
                Continuar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
