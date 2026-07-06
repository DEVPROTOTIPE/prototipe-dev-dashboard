import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

function SandboxSwipeableBottomSheet({ isOpen, onClose, title = '', children }) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setDragOffset(0);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchMove = (e) => {
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) setDragOffset(deltaY);
  };
  const handleTouchEnd = () => {
    if (dragOffset > 100) {
      onClose();
    } else {
      setDragOffset(0);
    }
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        style={{
          transform: isOpen ? `translateY(${dragOffset}px)` : 'translateY(100%)',
          transition: dragOffset === 0 ? 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        }}
        className="relative w-full max-w-md bg-[var(--color-surface)] border-t border-[var(--color-border)] rounded-t-[2rem] p-6 shadow-2xl flex flex-col max-h-[80vh] z-10 text-slate-100"
      >
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full py-2 cursor-grab active:cursor-grabbing shrink-0"
        >
          <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto" />
        </div>
        {title && (
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] shrink-0">
            <h3 className="text-xs font-black tracking-wide text-slate-200">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:bg-slate-850 transition-all cursor-pointer border-none bg-transparent flex items-center justify-center"><X size={14} /></button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 scrollbar-thin text-xs leading-relaxed text-slate-350">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function SwipeableBottomSheetSandbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('Detalles del Servicio');
  
  return (
    <SandboxLayout
      title="SwipeableBottomSheet"
      description="Panel táctil inferior responsivo diseñado para pantallas móviles. Arrastra la barra hacia abajo para cerrar."
      controls={[
        { label: 'Título', type: 'text', value: title, onChange: setTitle },
      ]}
    >
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() => setIsOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95 border-none"
        >
          Abrir Panel Deslizable
        </button>

        <SandboxSwipeableBottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title={title}>
          <div className="space-y-4">
            <p className="text-xs text-slate-400">Este es el área de contenido del Bottom Sheet con scroll independiente. Se adapta de forma elástica al arrastre.</p>
            <div className="h-20 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-center font-black text-indigo-400">Sección de Variantes</div>
            <div className="h-20 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-center font-black text-indigo-400">Métodos de Pago</div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all border-none"
            >
              Aceptar y Continuar
            </button>
          </div>
        </SandboxSwipeableBottomSheet>
      </div>
    </SandboxLayout>
  );
}
