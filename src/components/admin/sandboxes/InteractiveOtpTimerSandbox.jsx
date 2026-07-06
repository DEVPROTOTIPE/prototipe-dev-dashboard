import React, { useState, useEffect } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

// Componente Local para simulación autónoma en el sandbox
function LocalInteractiveOtpTimer({
  durationSeconds = 60,
  onResend,
  className = ''
}) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isActive, setIsActive] = useState(true);

  // SVG Config
  const radius = 22;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / durationSeconds) * circumference;

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (timeLeft <= 0) setIsActive(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isActive]);

  const handleResendClick = () => {
    if (timeLeft > 0) return;
    setTimeLeft(durationSeconds);
    setIsActive(true);
    if (onResend) {
      onResend();
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={`flex flex-col items-center p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl w-48 text-center ${className}`}>
      {/* Indicador Circular SVG */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Anillo de Fondo */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Anillo de Progreso Activo */}
          <motion.circle
            cx="32"
            cy="32"
            r={radius}
            stroke="var(--color-primary)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.9, ease: 'linear' }}
          />
        </svg>
        <span className="absolute text-xs font-mono font-extrabold text-[var(--color-text)]">
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Botón de Reenvío */}
      <button
        type="button"
        disabled={timeLeft > 0}
        onClick={handleResendClick}
        className={`mt-4 w-full py-2 px-3 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center space-x-1.5 border transition-all duration-300 ${
          timeLeft > 0
            ? 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)]/50 border-[var(--color-border)] cursor-not-allowed'
            : 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 shadow-sm hover:scale-[1.02]'
        }`}
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reenviar</span>
      </button>
    </div>
  );
}

export default function InteractiveOtpTimerSandbox() {
  const [duration, setDuration] = useState(30);
  const [resendCount, setResendCount] = useState(0);
  const [key, setKey] = useState(0);

  const handleResend = () => {
    setResendCount((prev) => prev + 1);
  };

  const handleReset = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <SandboxLayout
      title="InteractiveOtpTimer"
      description="Cronómetro circular regresivo con físicas SVG continuas para flujos de reenvío de códigos de seguridad de un solo uso."
      controls={
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
              Duración del Temporizador
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 60].map((secs) => (
                <button
                  key={secs}
                  onClick={() => { setDuration(secs); handleReset(); }}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    duration === secs
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-surface-3)]'
                  }`}
                >
                  {secs}s
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-[var(--color-surface-3)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-4)] transition-all"
          >
            Reiniciar Reloj
          </button>
        </div>
      }
    >
      <div className="w-full max-w-sm mx-auto space-y-6 flex flex-col items-center">
        <LocalInteractiveOtpTimer
          key={key}
          durationSeconds={duration}
          onResend={handleResend}
        />

        {resendCount > 0 && (
          <div className="p-3 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-xl text-center text-xs font-semibold w-full max-w-[200px]">
            📲 Reenvíos ejecutados: {resendCount}
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
