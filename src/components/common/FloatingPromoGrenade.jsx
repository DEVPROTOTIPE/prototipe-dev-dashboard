import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, X, Tag, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FloatingPromoGrenade({ 
  // Promociones configurables por el cliente (pueden venir de Zustand o Firestore)
  promotions = [
    { id: 1, title: '20% en tu primera compra', code: 'BOOM20' },
    { id: 2, title: 'Envío Gratis Hoy', code: 'FLASHFREE' }
  ] 
}) {
  // Estados: 'floating' (flotando) | 'ignited' (explotando) | 'revealed' (modal abierto)
  const [phase, setPhase] = useState('floating');

  const handleIgnite = () => {
    setPhase('ignited');
    
    // Disparar la explosión de alta calidad (partículas) a mitad de la animación
    setTimeout(() => {
      const colors = ['#ff0000', '#ffa500', '#ffff00', '#ffffff'];
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.6 },
        colors: colors,
        disableForReducedMotion: true
      });
      setPhase('revealed');
    }, 600); // Sincronizado con la expansión masiva de Framer Motion
  };

  const handleClose = () => {
    setPhase('floating');
  };

  // Renderizar el modal usando Portal para evitar que se recorte por el overflow del contenedor padre
  const renderModal = () => {
    if (typeof window === 'undefined' || !document.body) return null;

    return createPortal(
      <AnimatePresence>
        {phase === 'revealed' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            {/* Tap-shield para cerrar al hacer clic afuera */}
            <div className="absolute inset-0 z-40" onClick={handleClose}></div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="relative z-50 w-full max-w-sm p-6 overflow-hidden rounded-3xl bg-[var(--color-surface)] shadow-soft-2xl border border-[var(--color-border)] flex flex-col"
            >
              {/* Brillo holográfico interno (Efecto Premium) */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[var(--color-primary)]/15 to-transparent -z-10 pointer-events-none"></div>

              <button
                onClick={handleClose}
                aria-label="Cerrar promociones"
                className="absolute top-4 right-4 p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface-2)] rounded-full transition-colors active:scale-95"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center mb-6 text-center mt-2">
                <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                  <Sparkles size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-display font-bold text-[var(--color-text)] leading-tight">
                  ¡Boom! Promociones Desbloqueadas
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1.5">
                  Aprovecha estas ofertas exclusivas diseñadas para ti.
                </p>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto scrollbar-thin max-h-[50vh] pb-2">
                {promotions.length > 0 ? (
                  promotions.map((promo, index) => (
                    <motion.div
                      key={promo.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3.5 border rounded-xl border-[var(--color-border)] bg-[var(--color-surface-2)]/60 hover:border-[var(--color-primary)]/40 transition-colors"
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-medium text-[var(--color-text)] text-sm truncate">
                          {promo.title}
                        </span>
                        <span className="text-xs text-[var(--color-primary)] flex items-center gap-1 mt-1 font-semibold">
                          <Tag size={12} /> {promo.code}
                        </span>
                      </div>
                      <button className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-white transition-all rounded-lg bg-[var(--color-primary)] active:scale-95 shadow-soft-sm">
                        Aplicar
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-4 text-sm text-[var(--color-text-muted)]">
                    No hay promociones activas en este momento.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    );
  };

  return (
    <>
      {/* 1. TRIGGER FLOTANTE Y ANIMACIÓN DE EXPLOSIÓN */}
      <AnimatePresence>
        {phase === 'floating' && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -12, 0] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ y: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } }}
            onClick={handleIgnite}
            aria-label="Descubrir promociones explosivas"
            className="fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-primary)] text-white shadow-soft-xl border border-white/20 active:scale-95 transition-transform animate-bounce"
          >
            <Bomb size={24} strokeWidth={2.5} />
            {/* Halo pulsante de fondo */}
            <span className="absolute inset-0 rounded-full animate-ping bg-[var(--color-primary)] opacity-40 -z-10"></span>
          </motion.button>
        )}

        {phase === 'ignited' && (
          <motion.div
            initial={{ scale: 1 }}
            animate={{
              // Efecto caricatura: Inflarse, temblar, desinflarse rápido y explotar a escala gigante
              scale: [1, 1.3, 0.8, 2, 40],
              rotate: [0, -15, 15, -15, 15, 0],
              opacity: [1]
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="fixed bottom-24 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-primary)] text-white pointer-events-none"
          >
            <Bomb size={28} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MODAL GLASSMORPHIC DE REVELACIÓN (Portalizado y Animado) */}
      {renderModal()}
    </>
  );
}
