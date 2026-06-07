import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

export default function GlobalSkeletonLoaderSandbox() {
  const [variant, setVariant] = useState('card');
  const [count, setCount] = useState('3');
  const [isLoading, setIsLoading] = useState(true);

  // Soft shimmer using theme variables (surface-2 as base, background as shine)
  const shimmerStyle = {
    background: 'linear-gradient(90deg, var(--color-surface-2) 25%, var(--color-bg) 50%, var(--color-surface-2) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite linear',
    opacity: 0.85
  };

  const triggerSimulation = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  useEffect(() => {
    triggerSimulation();
  }, [variant, count]);

  const items = Array.from({ length: Number(count) });

  return (
    <SandboxLayout
      title="GlobalSkeletonLoader"
      description="Placeholders tipo shimmer contra CLS. Selecciona la variante y simula la carga asíncrona."
      controls={[
        { label: 'Variante', type: 'select', value: variant, options: ['card', 'table', 'form'], onChange: setVariant },
        { label: 'Cantidad', type: 'select', value: count, options: ['1', '2', '3', '4'], onChange: setCount }
      ]}
    >
      <div className="w-full space-y-4 text-[var(--color-text)] font-sans">
        <div className="flex justify-between items-center">
          <span className="text-[8px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Demostración</span>
          <button
            onClick={triggerSimulation}
            className="px-2.5 py-1 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-bold cursor-pointer transition-all active:scale-95 bg-indigo-600 shadow-md shadow-indigo-600/10"
          >
            🔄 Simular Carga
          </button>
        </div>

        <div className="border border-[var(--color-border)] rounded-2xl p-4 bg-[var(--color-surface-2)]/30 min-h-[180px] flex items-center justify-center transition-all duration-300">
          {isLoading ? (
            <div className="w-full animate-fade-in">
              {variant === 'card' && (
                <div className="grid grid-cols-2 gap-3">
                  {items.map((_, idx) => (
                    <div key={idx} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 space-y-3 shadow-sm">
                      <div style={shimmerStyle} className="w-full aspect-[4/3] rounded-xl" />
                      <div style={shimmerStyle} className="h-3 w-3/4 rounded-md" />
                      <div className="flex justify-between items-center pt-1">
                        <div style={shimmerStyle} className="h-3.5 w-10 rounded-md" />
                        <div style={shimmerStyle} className="h-5 w-12 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {variant === 'table' && (
                <div className="w-full border border-[var(--color-border)] rounded-xl divide-y divide-[var(--color-border)] overflow-hidden bg-[var(--color-surface)] shadow-sm">
                  <div className="bg-[var(--color-surface-2)]/60 p-2.5 flex justify-between gap-4">
                    <div style={shimmerStyle} className="h-2 w-8 rounded-md" />
                    <div style={shimmerStyle} className="h-2 w-16 rounded-md" />
                    <div style={shimmerStyle} className="h-2 w-8 rounded-md" />
                  </div>
                  {items.map((_, idx) => (
                    <div key={idx} className="p-3 flex justify-between gap-4 items-center">
                      <div style={shimmerStyle} className="h-3 w-10 rounded-md" />
                      <div style={shimmerStyle} className="h-3 w-20 rounded-md" />
                      <div style={shimmerStyle} className="h-3 w-8 rounded-md" />
                    </div>
                  ))}
                </div>
              )}

              {variant === 'form' && (
                <div className="w-full space-y-3.5 bg-[var(--color-surface)] p-4 border border-[var(--color-border)] rounded-xl shadow-sm">
                  {items.map((_, idx) => (
                    <div key={idx} className="space-y-2">
                      <div style={shimmerStyle} className="h-2.5 w-16 rounded-md" />
                      <div style={shimmerStyle} className="h-8 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full text-center py-6 space-y-3 animate-scale-up">
              <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <Check size={16} />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-[var(--color-text)] tracking-wider">Carga de Datos Completa</p>
                <p className="max-w-[220px] mx-auto text-[9px] text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] p-2.5 rounded-xl leading-relaxed mt-2 shadow-sm">
                  Los datos reales de Firestore se han renderizado fluidamente en lugar de la animación shimmer.
                </p>
              </div>
            </div>
          )}
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}} />
      </div>
    </SandboxLayout>
  );
}

