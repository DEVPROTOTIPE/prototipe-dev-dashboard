import React, { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { CircleDollarSign, Plus, Sparkles, Target } from 'lucide-react';

// Olla de oro premium en SVG
function GoldPot({ isGoalReached }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Gradiente metálico de la olla */}
        <linearGradient id="potGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" /> {/* slate-700 */}
          <stop offset="50%" stopColor="#1e293b" /> {/* slate-800 */}
          <stop offset="100%" stopColor="#0f172a" /> {/* slate-900 */}
        </linearGradient>
        {/* Gradiente dorado para monedas y ribetes */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" /> {/* amber-400 */}
          <stop offset="40%" stopColor="#f59e0b" /> {/* amber-500 */}
          <stop offset="80%" stopColor="#d97706" /> {/* amber-600 */}
          <stop offset="100%" stopColor="#78350f" /> {/* amber-900 */}
        </linearGradient>
        {/* Brillo mágico de fondo */}
        <radialGradient id="glowPot" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Halo de resplandor */}
      <circle cx="50" cy="45" r="35" fill="url(#glowPot)" />

      {/* Monedas de Oro que rebosan */}
      <ellipse cx="50" cy="35" rx="20" ry="8" fill="url(#goldGradient)" stroke="#d97706" strokeWidth="1" />
      <circle cx="42" cy="32" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
      <circle cx="50" cy="29" r="6.5" fill="#fcd34d" stroke="#d97706" strokeWidth="0.8" />
      <circle cx="58" cy="32" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
      <circle cx="46" cy="31" r="5" fill="#f59e0b" stroke="#b45309" strokeWidth="0.8" />
      <circle cx="54" cy="31" r="5" fill="#fcd34d" stroke="#b45309" strokeWidth="0.8" />

      {/* Cuerpo de la Olla de Barro */}
      <path
        d="M25 46 C25 66, 30 76, 50 76 C70 76, 75 66, 75 46 C75 36, 70 36, 50 36 C30 36, 25 36, 25 46 Z"
        fill="url(#potGradient)"
        stroke={isGoalReached ? "url(#goldGradient)" : "#475569"}
        strokeWidth="2.5"
        className="transition-colors duration-500"
      />

      {/* Boca de la Olla */}
      <ellipse cx="50" cy="36" rx="22" ry="5.5" fill="#0f172a" stroke="url(#goldGradient)" strokeWidth="2.2" />

      {/* Detalle/Cinto dorado de la Olla */}
      <path d="M26 53 C35 57, 65 57, 74 53" stroke="url(#goldGradient)" strokeWidth="1.5" fill="none" opacity="0.8" />
      
      {/* Sello de Moneda grabado en la olla */}
      <circle cx="50" cy="56" r="8" fill="url(#goldGradient)" stroke="#b45309" strokeWidth="1" />
      
      {/* Simbolo de Dolar en el Sello */}
      <path d="M50 51.5 L50 60.5 M47.5 54 L52.5 54 C53.5 54 53.5 56 50 56 C46.5 56 46.5 58 47.5 58 L52.5 58" stroke="#78350f" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export default function InteractiveGoldPot({ 
  initialAmount = 150000, 
  goalAmount = 500000,
  onGoalReached = () => console.log('¡Meta alcanzada!')
}) {
  const [saved, setSaved] = useState(initialAmount);
  const [deposit, setDeposit] = useState('');
  const [isDropping, setIsDropping] = useState(false);
  
  // Controlador orquestado para la animación de la olla
  const potControls = useAnimation();

  const progress = Math.min((saved / goalAmount) * 100, 100);
  const isGoalReached = saved >= goalAmount;

  // Crecimiento gradual de la olla: escala 1.0 (0% de ahorro) hasta 1.35 (100% de ahorro)
  const sizeFactor = 1 + (progress / 100) * 0.35;

  // Formateador visual para Pesos Colombianos (COP)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val || 0);
  };

  // Sanitización de entrada (Evita letras y símbolos)
  const handleDepositChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setDeposit(val);
  };

  // Orquestación de la física del abono
  const handleDeposit = async (e) => {
    e.preventDefault();
    const amount = parseInt(deposit, 10);
    
    if (!amount || isDropping || amount <= 0) return;

    setIsDropping(true);

    // 1. Esperamos que la moneda caiga (400ms coordinados con CSS/Framer)
    await new Promise(resolve => setTimeout(resolve, 400));

    // 2. Efecto Squash & Stretch (La olla de oro traga la moneda)
    await potControls.start({
      scale: [1, 1.18, 0.82, 1.06, 1],
      transition: { duration: 0.5, ease: "easeInOut" }
    });

    // 3. Actualización matemática y visual
    const newSaved = saved + amount;
    setSaved(newSaved);
    setDeposit('');
    setIsDropping(false);

    // 4. Disparar celebración si se cruza la meta por primera vez
    if (newSaved >= goalAmount && saved < goalAmount) {
      onGoalReached();
      import('canvas-confetti').then(module => {
        module.default({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.55 },
          colors: ['#fbbf24', '#f59e0b', '#10b981', '#ffffff'],
          disableForReducedMotion: true,
          zIndex: 9999
        });
      });
    }
  };

  // Animación de reposo (respiración infinita)
  useEffect(() => {
    if (!isDropping) {
      potControls.start({
        scale: [1, 1.02, 1],
        transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
      });
    }
  }, [isDropping, potControls]);

  return (
    <div className="relative flex flex-col items-center w-full max-w-sm p-6 mx-auto bg-[var(--color-surface)]/85 backdrop-blur-xl border border-[var(--color-border)] rounded-[24px] shadow-soft-2xl overflow-visible text-[var(--color-text)]">
      
      {/* Halo de celebración si la meta está cumplida */}
      {isGoalReached && (
        <div className="absolute inset-0 w-full h-full rounded-[24px] bg-[var(--color-primary)]/20 blur-3xl -z-10 animate-pulse-slow pointer-events-none" />
      )}

      {/* Cabecera de Meta */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--color-text-muted)]">
            Ahorro / Abonos
          </span>
          <span className="text-2xl font-black font-display text-[var(--color-text)] leading-none mt-1">
            {formatCurrency(saved)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <Target size={14} className="text-[var(--color-primary)]" />
          <span className="text-xs font-bold text-[var(--color-text)]">
            Meta: {formatCurrency(goalAmount)}
          </span>
        </div>
      </div>

      {/* ESCENARIO DE ANIMACIÓN (Holgura pt-12 para evitar clipping de la moneda) */}
      <div className="relative flex flex-col items-center justify-center w-full pt-12 pb-6 min-h-[160px]">
        
        {/* Moneda Cayendo */}
        <AnimatePresence>
          {isDropping && (
            <motion.div
              initial={{ y: -80, opacity: 0, scale: 0.5, rotate: 0 }}
              animate={{ y: -10, opacity: 1, scale: 1, rotate: 180 }}
              exit={{ y: 15, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, ease: "easeIn" }}
              className="absolute top-0 z-20 text-amber-500 drop-shadow-lg"
            >
              <CircleDollarSign size={40} className="fill-[var(--color-surface)]" strokeWidth={1.5} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenedor exterior que escala de forma de abono proporcional */}
        <motion.div
          animate={{ scale: sizeFactor }}
          transition={{ type: "spring", stiffness: 90, damping: 15 }}
          className="relative z-30 flex items-center justify-center w-36 h-36"
        >
          {/* Olla de Oro Animada */}
          <motion.div 
            animate={potControls}
            className="w-full h-full text-[var(--color-primary)]"
          >
            {/* Resplandor interno */}
            <div className="absolute inset-0 w-24 h-24 m-auto rounded-full bg-amber-500/25 blur-xl -z-10 animate-pulse" />
            
            <GoldPot isGoalReached={isGoalReached} className={isGoalReached ? 'drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]' : 'drop-shadow-2xl'} />
            
            {/* Estrellas brillantes si llegó a la meta */}
            {isGoalReached && (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute -top-1 -right-1 text-yellow-400"
              >
                <Sparkles size={24} />
              </motion.div>
            )}
          </motion.div>
        </motion.div>

      </div>

      {/* Barra de Progreso Elástica */}
      <div className="w-full mb-6">
        <div className="flex justify-between mb-1.5 text-xs font-bold">
          <span className="text-[var(--color-text-muted)]">Progreso de Ahorro</span>
          <span className="text-[var(--color-primary)]">{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* Formulario de Abono */}
      <form onSubmit={handleDeposit} className="flex gap-2 w-full">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-bold">
            $
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={deposit ? new Intl.NumberFormat('es-CO').format(parseInt(deposit, 10)) : ''}
            onChange={handleDepositChange}
            placeholder="Monto a ahorrar"
            disabled={isDropping || isGoalReached}
            className="w-full h-12 pl-8 pr-4 text-sm font-semibold bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all disabled:opacity-50"
          />
        </div>
        
        <button
          type="submit"
          disabled={!deposit || isDropping || isGoalReached}
          className="flex-shrink-0 flex items-center justify-center w-12 h-12 text-white bg-[var(--color-primary)] hover:opacity-95 rounded-xl active:scale-95 transition-all shadow-soft-sm disabled:opacity-50 disabled:active:scale-100 outline-none cursor-pointer"
          aria-label="Realizar abono"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </form>

      {isGoalReached && (
        <p className="mt-4 text-xs font-bold text-center text-amber-500 animate-pulse">
          ¡Felicidades, la Olla de Oro está llena! 🪙🎉
        </p>
      )}
    </div>
  );
}
