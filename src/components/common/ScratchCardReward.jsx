import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, CircleDollarSign, Sparkles, X, Check } from 'lucide-react';

export default function ScratchCardReward({ 
  rewardType = 'gift', // Tipos soportados: 'gift' | 'image' | 'number'
  rewardContent = '¡20% DCTO!', // Texto del premio o URL de la imagen
  subtitle = 'Cupón: RASCA20',
  onReveal = () => console.log('Premio revelado exitosamente')
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const scratchCountRef = useRef(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [coinPos, setCoinPos] = useState({ x: -100, y: -100 });
  const [sparkles, setSparkles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pincel de raspado aumentado para mayor facilidad de borrado
  const BRUSH_SIZE = 35;
  // Umbral de revelación optimizado al 35% para no fatigar al usuario
  const REVEAL_THRESHOLD = 35;

  // Inicializar la cubierta del Rasca y Gana con ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    const paintCanvas = (w, h) => {
      canvas.width = w || 360;
      canvas.height = h || 240;
      
      // Pintar la capa "plateada/metálica" con gradiente premium
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#f1f5f9'); // slate-100
      gradient.addColorStop(0.3, '#cbd5e1'); // slate-300
      gradient.addColorStop(0.7, '#94a3b8'); // slate-400
      gradient.addColorStop(1, '#475569'); // slate-600
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Agregar patrón de texto "Rasca Aquí"
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Repetir el texto a lo largo del canvas de forma cruzada
      for (let i = 0; i < canvas.width; i += 120) {
        for (let j = 0; j < canvas.height; j += 60) {
          ctx.fillText('RASCA', i + 60, j + 30);
        }
      }
    };

    // Usar ResizeObserver para detectar el renderizado real en el DOM
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          paintCanvas(width, height);
        }
      }
    });

    resizeObserver.observe(canvas);

    // Pintar fallback inicial
    const initialWidth = canvas.offsetWidth || canvas.clientWidth || 360;
    const initialHeight = canvas.offsetHeight || canvas.clientHeight || 240;
    paintCanvas(initialWidth, initialHeight);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Función para evaluar si ya se raspó suficiente
  const checkRevealPercentage = useCallback(() => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let transparentPixels = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }
    
    const totalPixels = pixels.length / 4;
    const percentage = (transparentPixels / totalPixels) * 100;

    console.log(`[Rasca y Gana] Porcentaje raspado: ${percentage.toFixed(1)}% | Trazos: ${scratchCountRef.current}`);

    // Umbral del 35% o fallback de 30 movimientos de dibujo para máxima resiliencia
    if (percentage > REVEAL_THRESHOLD || scratchCountRef.current > 30) {
      console.log(`[Rasca y Gana] Revelación activada (Porcentaje: ${percentage.toFixed(1)}% | Trazos: ${scratchCountRef.current})`);
      setIsRevealed(true);
      setIsModalOpen(true);
      onReveal();
      
      // Explosión de Confeti utilizando import dinámico
      import('canvas-confetti').then(module => {
        module.default({
          particleCount: 180,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#34d399', '#60a5fa', '#f43f5e', '#ffffff'],
          zIndex: 9999,
          disableForReducedMotion: true
        });
      });
    }
  }, [isRevealed, onReveal]);

  // Loop de físicas para las chispas de raspado
  useEffect(() => {
    if (sparkles.length === 0) return;
    const frame = requestAnimationFrame(() => {
      setSparkles(prev => 
        prev
          .map(s => ({
            ...s,
            x: s.x + s.vx,
            y: s.y + s.vy,
            vy: s.vy + 0.18, // gravedad
            size: Math.max(0, s.size - 0.12)
          }))
          .filter(s => s.size > 0.5)
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [sparkles]);

  // Manejador de raspado (Mouse y Touch)
  const handleScratch = (e) => {
    if (isRevealed) return;
    
    // Prevenir el scroll por defecto del navegador en móviles al raspar
    if (e.cancelable) e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setCoinPos({ x, y });

    if (!isDrawing) return;

    // Destruir pixeles (hacer transparente)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, BRUSH_SIZE, 0, Math.PI * 2);
    ctx.fill();

    // Generar chispas visuales con físicas
    const newSparkles = Array.from({ length: 2 }).map(() => ({
      id: Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5 - 1, // Lanzar un poco hacia arriba
      size: Math.random() * 4 + 2,
      color: ['#fbbf24', '#f59e0b', '#38bdf8', '#ffffff'][Math.floor(Math.random() * 4)]
    }));
    setSparkles(prev => [...prev.slice(-30), ...newSparkles]);

    // Verificación asíncrona periódica en tiempo real
    scratchCountRef.current++;
    if (scratchCountRef.current % 6 === 0) {
      checkRevealPercentage();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    checkRevealPercentage(); // Último chequeo al levantar
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-sm p-4 mx-auto select-none">
      
      <div 
        ref={containerRef}
        className="relative w-full aspect-[3/2] overflow-hidden rounded-[24px] shadow-soft-2xl border-4 border-[var(--color-surface)] bg-[var(--color-surface-2)] group"
      >
        
        {/* 1. CAPA DEL PREMIO (Ocupa el 100% real sin padding restrictivo) */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-2)] ${rewardType === 'image' ? 'p-0' : 'p-6'}`}>
          {rewardType === 'image' && (
            <img 
              src={rewardContent} 
              alt="Premio" 
              className="object-cover w-full h-full rounded-[20px] shadow-sm animate-fade-in"
              draggable={false}
            />
          )}
          
          {rewardType === 'gift' && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isRevealed ? { scale: 1, opacity: 1 } : {}}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="flex flex-col items-center animate-fade-in"
            >
              <div className="flex items-center justify-center w-16 h-16 mb-3 rounded-full shadow-lg bg-[var(--color-primary)] text-white">
                <Gift size={32} />
              </div>
              <h3 className="text-2xl font-bold font-display text-[var(--color-text)] leading-tight">{rewardContent}</h3>
              <p className="text-sm font-medium text-[var(--color-primary)] mt-1">{subtitle}</p>
            </motion.div>
          )}

          {rewardType === 'number' && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={isRevealed ? { scale: 1, opacity: 1 } : {}}
              className="flex flex-col items-center animate-fade-in"
            >
              <h2 className="text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
                {rewardContent}
              </h2>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">{subtitle}</p>
            </motion.div>
          )}

          {/* Micro-partículas de decoración de fondo */}
          <Sparkles className="absolute top-4 right-4 text-[var(--color-primary)]/20 w-8 h-8" />
          <Sparkles className="absolute bottom-4 left-4 text-[var(--color-primary)]/20 w-6 h-6" />
        </div>

        {/* 2. CAPA RASCABLE (Canvas HTML5) */}
        <AnimatePresence>
          {!isRevealed && (
            <motion.canvas
              ref={canvasRef}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              onMouseDown={(e) => { setIsDrawing(true); handleScratch(e); }}
              onMouseMove={handleScratch}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={(e) => { setIsDrawing(true); handleScratch(e); }}
              onTouchMove={handleScratch}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 z-20 w-full h-full cursor-crosshair touch-none"
            />
          )}
        </AnimatePresence>

        {/* 3. MONEDA ANIMADA (Sigue el cursor mientras se raspa) */}
        {!isRevealed && (
          <motion.div
            animate={{ 
              x: coinPos.x - 20, 
              y: coinPos.y - 20,
              rotate: isDrawing ? [-12, 12, -12] : 0 
            }}
            transition={{ type: 'tween', ease: 'linear', duration: 0.03 }}
            className={`absolute z-30 pointer-events-none text-[var(--color-primary)] drop-shadow-lg transition-opacity duration-200 ${
              coinPos.x > 0 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <CircleDollarSign size={40} className="fill-[var(--color-surface)]" strokeWidth={1.5} />
          </motion.div>
        )}

        {/* 4. RENDIMIENTO DE CHISPAS EN TIEMPO REAL */}
        {sparkles.map(s => (
          <div
            key={s.id}
            className="absolute pointer-events-none rounded-full z-45"
            style={{
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
              boxShadow: `0 0 6px ${s.color}`
            }}
          />
        ))}
      </div>

      <p className="mt-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">
        {isRevealed ? '¡Premio desbloqueado!' : 'Usa tu dedo o mouse para raspar'}
      </p>

      {/* 5. MODAL GLASSMORPHIC DE CELEBRACIÓN / PREMIO REVELADO MEDIANTE PORTAL */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-white/20 bg-[var(--color-surface)]/85 backdrop-blur-xl shadow-2xl p-6 text-center select-none"
              >
                {/* Botón de Cierre */}
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors active:scale-95 cursor-pointer z-50"
                >
                  <X size={16} />
                </button>

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none -z-10" />

                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, transition: { delay: 0.15, type: 'spring' } }}
                  className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-violet-600 text-white shadow-lg shadow-amber-500/20"
                >
                  <Gift size={40} className="animate-bounce" />
                </motion.div>

                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">
                  ¡Felicidades, Has Ganado!
                </span>

                <h2 className="mt-2 text-3xl font-black font-display text-[var(--color-text)] leading-tight">
                  {rewardType === 'image' ? 'Tu Premio Especial' : rewardContent}
                </h2>
                
                <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                  {subtitle}
                </p>

                {rewardType === 'image' && (
                  <div className="w-full aspect-[4/3] rounded-[16px] overflow-hidden my-4 border border-[var(--color-border)] shadow-md">
                    <img src={rewardContent} alt="Premio obtenido" className="object-cover w-full h-full" />
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex items-center justify-center gap-2 w-full h-11 px-4 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-95 active:scale-95 shadow-md shadow-[var(--color-primary)]/25 cursor-pointer transition-transform"
                  >
                    <Check size={16} />
                    Reclamar Recompensa
                  </button>
                  
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full h-11 px-4 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] active:scale-95 cursor-pointer transition-all"
                  >
                    Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
