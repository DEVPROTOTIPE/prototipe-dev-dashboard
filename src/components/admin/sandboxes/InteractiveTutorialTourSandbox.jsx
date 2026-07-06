import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { SandboxLayout } from './SandboxLayout';

function SandboxInteractiveTutorialTour({ active, steps = [], onComplete = () => {} }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState(null);

  useEffect(() => {
    if (!active || steps.length === 0) return;
    const updatePosition = () => {
      const step = steps[currentStep];
      const targetElement = document.querySelector(step.selector);
      if (targetElement) {
        targetElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
        const rect = targetElement.getBoundingClientRect();
        const padding = 6;
        setHighlightStyle({
          left: `${rect.left + window.scrollX - padding}px`,
          top: `${rect.top + window.scrollY - padding}px`,
          width: `${rect.width + padding * 2}px`,
          height: `${rect.height + padding * 2}px`,
          position: 'absolute',
          boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.65)',
          borderRadius: '12px',
          pointerEvents: 'auto'
        });
        setTooltipStyle({
          left: `${Math.max(12, Math.min(window.innerWidth - 290, rect.left + window.scrollX))}px`,
          top: `${rect.bottom + window.scrollY + 10}px`,
          width: '260px',
          position: 'absolute',
          pointerEvents: 'auto'
        });
      } else {
        setHighlightStyle({ width: 0, height: 0, opacity: 0 });
        setTooltipStyle({ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '260px', position: 'fixed', pointerEvents: 'auto' });
      }
    };
    const timer = setTimeout(updatePosition, 300);
    return () => clearTimeout(timer);
  }, [active, currentStep, steps]);

  if (!active || steps.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] pointer-events-none">
      {highlightStyle && <div style={highlightStyle} className="border-2 border-indigo-500/40 ring-4 ring-indigo-500/10" />}
      <div style={tooltipStyle} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4.5 shadow-2xl flex flex-col gap-3.5 text-slate-100">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase text-indigo-400">Paso {currentStep + 1} de {steps.length}</span>
          <button onClick={onComplete} className="text-slate-500 hover:text-slate-350 cursor-pointer"><X size={12} /></button>
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-100">{steps[currentStep]?.title}</h4>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{steps[currentStep]?.content}</p>
        </div>
        <div className="flex justify-between items-center gap-2 border-t border-[var(--color-border)] pt-2.5">
          <button onClick={onComplete} className="text-[9px] font-bold text-slate-500 hover:text-slate-400 cursor-pointer">Saltar</button>
          <div className="flex gap-1">
            {currentStep > 0 && (
              <button onClick={() => setCurrentStep(p => p - 1)} className="px-2 py-1 bg-slate-800 border border-slate-700 text-[9px] font-bold rounded-lg text-slate-300">Atrás</button>
            )}
            <button onClick={() => currentStep < steps.length - 1 ? setCurrentStep(p => p + 1) : onComplete()} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-[9px] font-black rounded-lg text-white">
              {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function InteractiveTutorialTourSandbox() {
  const { showAlert } = useAlertConfirm();
  const [active, setActive] = useState(false);
  const steps = [
    { selector: 'h1', title: 'Título Principal', content: 'Este es el título de la biblioteca de componentes. Organiza todo el catálogo.' },
    { selector: '.grid-cols-2', title: 'Playgrounds del Sandbox', content: 'Aquí puedes seleccionar directamente las demos jugables activas.' },
    { selector: 'button', title: 'Botón de Inicialización', content: 'Presiona este botón en cualquier momento para reiniciar la guía de inducción.' }
  ];

  return (
    <SandboxLayout
      title="InteractiveTutorialTour"
      description="Guía de onboarding paso a paso que resalta y enfoca elementos específicos del DOM."
      controls={[]}
    >
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() => setActive(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
        >
          Iniciar Tour de Prueba
        </button>
        <SandboxInteractiveTutorialTour
          active={active}
          steps={steps}
          onComplete={() => {
            setActive(false);
            showAlert({
              title: '¡Onboarding Completado!',
              message: '¡Has recorrido exitosamente el tour guiado interactivo de inducción!',
              variant: 'success'
            });
          }}
        />
      </div>
    </SandboxLayout>
  );
}
