import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion, AnimatePresence } from 'framer-motion';

// Componente Local para simulación autónoma en el sandbox
function LocalAccordionInteractiveFilter({
  title = 'Filtro',
  children,
  defaultOpen = false,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden transition-all duration-200
      ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
    `}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left font-semibold text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/60 transition-colors outline-none select-none"
      >
        <span>{title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-xs text-[var(--color-text-muted)] animate-pulse"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 24
            }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AccordionInteractiveFilterSandbox() {
  const [disabled, setDisabled] = useState(false);
  const [title, setTitle] = useState('Categorías de Ropa 👕');
  const [defaultOpen, setDefaultOpen] = useState(true);

  const controls = [
    {
      type: 'toggle',
      label: 'Deshabilitar Accordion',
      value: disabled,
      onChange: setDisabled
    },
    {
      type: 'text',
      label: 'Título de Filtro',
      value: title,
      onChange: setTitle
    },
    {
      type: 'toggle',
      label: 'Abierto por defecto',
      value: defaultOpen,
      onChange: setDefaultOpen
    }
  ];

  return (
    <SandboxLayout title="AccordionInteractiveFilter" controls={controls}>
      <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full max-w-sm mx-auto">
        <LocalAccordionInteractiveFilter
          key={defaultOpen} // Forzar re-montaje cuando cambie defaultOpen en controles
          title={title}
          defaultOpen={defaultOpen}
          disabled={disabled}
        >
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input type="checkbox" className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)] bg-[var(--color-surface-2)]" defaultChecked />
              <span>Pantalones Jeans</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input type="checkbox" className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)] bg-[var(--color-surface-2)]" />
              <span>Poleras de Algodón</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input type="checkbox" className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)] bg-[var(--color-surface-2)]" />
              <span>Casacas Cortavientos</span>
            </label>
          </div>
        </LocalAccordionInteractiveFilter>
      </div>
    </SandboxLayout>
  );
}
