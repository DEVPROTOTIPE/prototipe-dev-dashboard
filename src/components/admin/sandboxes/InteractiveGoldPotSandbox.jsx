import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import InteractiveGoldPot from '../../common/InteractiveGoldPot';
import CustomSelect from '../../ui/CustomSelect';

export default function InteractiveGoldPotSandbox() {
  const [initialAmount, setInitialAmount] = useState(150000);
  const [goalAmount, setGoalAmount] = useState(500000);
  const [goalLog, setGoalLog] = useState('');
  const [resetKey, setResetKey] = useState(0);

  const goalOptions = [
    { value: '300000', label: '$300.000 COP' },
    { value: '500000', label: '$500.000 COP' },
    { value: '1000000', label: '$1.000.000 COP' },
    { value: '2000000', label: '$2.000.000 COP' }
  ];

  const handleGoalReached = () => {
    setGoalLog(`[Goal Event] ¡Meta de ahorro alcanzada con éxito a las ${new Date().toLocaleTimeString()}! 🪙🎉`);
  };

  const handleReset = () => {
    setResetKey(prev => prev + 1);
    setGoalLog('');
  };

  const handleGoalChange = (value) => {
    setGoalAmount(parseInt(value, 10));
    handleReset();
  };

  return (
    <SandboxLayout
      title="InteractiveGoldPot Sandbox"
      description="Playground interactivo para simular el componente de olla de oro de ahorro con físicas de caída de moneda y efecto squash-and-stretch en Framer Motion."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controles de Configuración */}
        <div className="lg:col-span-4 space-y-5 bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] p-5 rounded-[20px] h-fit">
          <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider mb-2">Configuración</h3>
          
          {/* 1. Selector de Meta de Ahorro */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--color-text-muted)]">
              Meta de Ahorro (goalAmount)
            </label>
            <CustomSelect
              options={goalOptions}
              value={String(goalAmount)}
              onChange={handleGoalChange}
            />
          </div>

          {/* 2. Entrada de Ahorro Inicial */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--color-text-muted)]">
              Ahorro Inicial ($ COP)
            </label>
            <input
              type="number"
              value={initialAmount}
              onChange={(e) => {
                setInitialAmount(Math.max(0, parseInt(e.target.value, 10) || 0));
                handleReset();
              }}
              className="w-full h-11 px-3 bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-sm font-medium"
            />
          </div>

          {/* Acciones */}
          <div className="pt-2">
            <button
              onClick={handleReset}
              className="w-full h-10 px-4 text-xs font-bold text-[var(--color-text)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl cursor-pointer transition-colors active:scale-95"
            >
              Reiniciar Olla de Oro
            </button>
          </div>
        </div>

        {/* Workspace de Visualización */}
        <div className="lg:col-span-8 space-y-4 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-8 bg-[var(--color-surface-2)]/30 rounded-[24px] border border-[var(--color-border)] shadow-sm min-h-[400px]">
            <InteractiveGoldPot
              key={`${resetKey}-${goalAmount}-${initialAmount}`}
              initialAmount={initialAmount}
              goalAmount={goalAmount}
              onGoalReached={handleGoalReached}
            />
          </div>

          {/* Consola de Telemetría */}
          <div className="p-4 bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-[20px]">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
              Consola de Eventos
            </span>
            <div className="h-10 text-xs font-mono text-amber-400 flex items-center">
              {goalLog || <span className="text-slate-500 italic">Esperando que se complete la meta de ahorro...</span>}
            </div>
          </div>
        </div>

      </div>
    </SandboxLayout>
  );
}
