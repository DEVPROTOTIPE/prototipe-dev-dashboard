import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';

// Componente Local para simulación autónoma en el sandbox
function LocalAnimatedPasswordInput({
  value,
  onChange,
  placeholder = 'Digita tu contraseña...',
  showStrengthMeter = true,
  className = ''
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Evalúa la fuerza del password de 0 a 4
  const getStrength = (pwd) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8 && /[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strength = getStrength(value);

  const getStrengthColor = (score) => {
    if (score === 1) return 'bg-red-500';
    if (score === 2) return 'bg-amber-500';
    if (score === 3) return 'bg-yellow-500';
    if (score >= 4) return 'bg-green-500';
    return 'bg-transparent';
  };

  const getStrengthLabel = (score) => {
    if (score === 0) return 'Muy débil';
    if (score === 1) return 'Débil';
    if (score === 2) return 'Media';
    if (score === 3) return 'Buena';
    return 'Excelente/Segura';
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className={`flex items-center w-full min-h-[44px] px-3.5 rounded-xl border transition-all duration-300 bg-[var(--color-surface)] ${
          isFocused
            ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-md shadow-[var(--color-primary)]/5'
            : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]/50'
        }`}
      >
        <Lock className="w-5 h-5 text-[var(--color-text-muted)] shrink-0 mr-2.5" />
        
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full h-10 bg-transparent text-[var(--color-text)] focus:outline-none placeholder-transparent text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors shrink-0 ml-2"
        >
          <motion.div
            animate={{ scale: showPassword ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 0.2 }}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </motion.div>
        </button>
      </div>

      {/* Barra de progreso de seguridad */}
      {showStrengthMeter && value.length > 0 && (
        <div className="mt-2.5 px-1 space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            <span>Seguridad</span>
            <span className="font-semibold">{getStrengthLabel(strength)}</span>
          </div>
          <div className="h-1.5 w-full bg-[var(--color-surface-3)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(strength / 4) * 100}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`h-full rounded-full transition-all duration-300 ${getStrengthColor(strength)}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnimatedPasswordInputSandbox() {
  const [password, setPassword] = useState('');
  const [showMeter, setShowMeter] = useState(true);

  return (
    <SandboxLayout
      title="AnimatedPasswordInput"
      description="Entrada de contraseña premium con botón elástico de visibilidad e indicador visual interactivo de complejidad."
      controls={
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
              Medidor de Seguridad
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowMeter(true)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  showMeter
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-surface-3)]'
                }`}
              >
                Mostrar
              </button>
              <button
                onClick={() => setShowMeter(false)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  !showMeter
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-surface-3)]'
                }`}
              >
                Ocultar
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            Nueva Contraseña
          </label>
          <LocalAnimatedPasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Introduce tu clave de seguridad..."
            showStrengthMeter={showMeter}
          />
        </div>

        <div className="p-3 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] space-y-1.5">
          <strong className="text-[var(--color-text)]">Criterios de seguridad evaluados:</strong>
          <ul className="list-disc list-inside pl-1 space-y-0.5">
            <li>Mínimo 6 caracteres de longitud.</li>
            <li>Inclusión de letras mayúsculas.</li>
            <li>Inclusión de números.</li>
            <li>Inclusión de caracteres especiales (!, @, #, $, etc.).</li>
          </ul>
        </div>
      </div>
    </SandboxLayout>
  );
}
