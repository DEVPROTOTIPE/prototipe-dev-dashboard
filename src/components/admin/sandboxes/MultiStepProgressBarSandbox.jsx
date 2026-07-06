import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';

// Componente Local para simulación autónoma en el sandbox
function LocalMultiStepProgressBar({
  steps = ['Paso 1', 'Paso 2', 'Paso 3'],
  currentStep = 0,
  className = ''
}) {
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 1 
    ? (currentStep / (totalSteps - 1)) * 100 
    : 0;

  return (
    <div className={`relative flex items-center justify-between w-full select-none ${className}`}>
      <div className="absolute left-0 right-0 h-1 bg-[var(--color-border)] z-[-20] rounded-full" />

      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: `${progressPercent}%` }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="absolute left-0 h-1 bg-[var(--color-primary)] z-[-10] rounded-full origin-left"
      />

      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;

        return (
          <div key={idx} className="flex flex-col items-center relative">
            <motion.div
              initial={false}
              animate={{
                backgroundColor: isCompleted || isActive 
                  ? 'var(--color-primary)' 
                  : 'var(--color-surface-3)',
                borderColor: isCompleted || isActive 
                  ? 'var(--color-primary)' 
                  : 'var(--color-border)',
                scale: isActive ? 1.15 : 1
              }}
              transition={{ duration: 0.3 }}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center relative z-10 text-xs font-bold transition-all
                ${isCompleted || isActive ? '!text-white' : 'text-[var(--color-text-muted)]'}
              `}
              style={{
                backgroundColor: 'var(--color-surface-3)',
              }}
            >
              {isCompleted ? (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
              ) : (
                <span>{idx + 1}</span>
              )}
            </motion.div>

            <span className={`absolute top-10 text-[10px] font-semibold whitespace-nowrap transition-all duration-200
              ${isActive ? 'text-[var(--color-primary)] font-bold opacity-100' : 'text-[var(--color-text-muted)] opacity-60'}
            `}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function MultiStepProgressBarSandbox() {
  const [currentStep, setCurrentStep] = useState(1);
  const steps = ['Recibido 📦', 'Lavado 🧼', 'Planchado 💨', 'Entregado 🚚'];

  const controls = [];

  return (
    <SandboxLayout title="MultiStepProgressBar" controls={controls}>
      {/* padding inferior amplio (pb-12) para alojar el label absolute top-10 sin recortes */}
      <div className="flex flex-col items-center justify-center p-12 pb-16 space-y-12 w-full max-w-md mx-auto">
        <LocalMultiStepProgressBar
          steps={steps}
          currentStep={currentStep}
        />
        
        <div className="flex gap-2 w-full mt-6">
          <button
            onClick={() => setCurrentStep(c => Math.max(0, c - 1))}
            disabled={currentStep === 0}
            className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-all outline-none disabled:opacity-50"
          >
            Paso Anterior
          </button>
          <button
            onClick={() => setCurrentStep(c => Math.min(steps.length - 1, c + 1))}
            disabled={currentStep === steps.length - 1}
            className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold bg-[var(--color-primary)] !text-white hover:bg-[var(--color-primary)]/90 transition-all outline-none disabled:opacity-50"
          >
            Siguiente Paso
          </button>
        </div>

        <div className="text-sm text-[var(--color-text-muted)] w-full text-center select-none">
          Paso activo: <span className="font-mono text-[var(--color-text)] font-bold">{currentStep + 1} de {steps.length} ({steps[currentStep]})</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
