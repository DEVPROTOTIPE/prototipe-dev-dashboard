import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Eye, Settings, X, ChevronLeft } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

function ModalTemplate({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  icon: Icon, 
  onBack,
  children, 
  footerActions 
}) {
  
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const modalDOM = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border border-[var(--color-border)] pointer-events-auto"
            style={{ willChange: 'transform' }}
          >
            {title && (
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] shrink-0">
                <div className="flex items-center gap-3">
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors active:scale-90"
                      aria-label="Volver"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  )}
                  {Icon && (
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shrink-0">
                      <Icon size={20} className="animate-pulse" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-[var(--color-text)] text-base leading-none">{title}</h3>
                    {subtitle && <div className="text-xs text-[var(--color-text-muted)] mt-1 leading-none">{subtitle}</div>}
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-all active:scale-90 cursor-pointer"
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-[var(--color-text)]">
              {children}
            </div>

            {footerActions && (
              <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] shrink-0 flex gap-3">
                {footerActions}
              </div>
            )}
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalDOM, document.body);
}

export default function ModalTemplateSandbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [showFooter, setShowFooter] = useState(true);
  const [hasIcon, setHasIcon] = useState(true);

  const handleOpen = () => {
    setStep(1);
    setIsOpen(true);
  };

  return (
    <SandboxLayout
      title="Modal Template"
      description="Modal base premium estructurado con React Portals, scroll lock automático y Framer Motion spring-physics."
      controls={[
        { label: 'Con Footer', type: 'toggle', value: showFooter, onChange: setShowFooter, labels: ['No', 'Sí'] },
        { label: 'Con Icono', type: 'toggle', value: hasIcon, onChange: setHasIcon, labels: ['No', 'Sí'] },
      ]}
    >
      <div className="flex flex-col items-center">
        <button
          onClick={handleOpen}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
        >
          <Eye size={14} />
          Previsualizar Modal
        </button>

        <ModalTemplate
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={step === 1 ? "Detalle de Producto" : "Configurar Opciones"}
          subtitle={step === 1 ? "Paso 1 de 2: Vista previa" : "Paso 2 de 2: Opciones de compra"}
          icon={hasIcon ? (step === 1 ? ShoppingBag : Settings) : null}
          onBack={step === 2 ? () => setStep(1) : null}
          footerActions={showFooter ? (
            <>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)] text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                Cancelar
              </button>
              {step === 1 ? (
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
                >
                  Finalizar
                </button>
              )}
            </>
          ) : null}
        >
          {step === 1 ? (
            <div className="space-y-3">
              <div className="aspect-video w-full rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] font-mono text-[10px]">
                [Imagen del Producto Mocked]
              </div>
              <h4 className="font-bold text-xs">Camiseta Premium Algodón</h4>
              <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                Diseño minimalista con costuras reforzadas y teñido orgánico de alta duración. Fabricado con fibras recicladas.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <h4 className="font-bold text-xs">Especificaciones Técnicas</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] py-1.5 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-text-muted)]">Material:</span>
                  <span className="font-bold">100% Algodón Pima</span>
                </div>
                <div className="flex justify-between items-center text-[10px] py-1.5 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-text-muted)]">Tallas Disponibles:</span>
                  <span className="font-bold text-indigo-400">S, M, L, XL</span>
                </div>
                <div className="flex justify-between items-center text-[10px] py-1.5">
                  <span className="text-[var(--color-text-muted)]">Origen:</span>
                  <span className="font-bold">Medellín, Colombia</span>
                </div>
              </div>
            </div>
          )}
        </ModalTemplate>
      </div>
    </SandboxLayout>
  );
}
