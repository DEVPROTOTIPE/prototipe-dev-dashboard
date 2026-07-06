import React, { useState } from 'react';
import { Trash2, AlertTriangle, Info } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

export default function ModalConfirmacionSandbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [variant, setVariant] = useState('danger');
  const [title, setTitle] = useState('Eliminar registro');
  const [body, setBody] = useState('Esta acción es irreversible. ¿Deseas continuar?');

  const variants = {
    danger: { icon: <Trash2 size={22} className="text-red-400" />, bg: 'bg-red-600', label: 'Eliminar', ring: 'ring-red-500/30' },
    warning: { icon: <AlertTriangle size={22} className="text-amber-400" />, bg: 'bg-amber-500', label: 'Continuar', ring: 'ring-amber-500/30' },
    info: { icon: <Info size={22} className="text-indigo-400" />, bg: 'bg-indigo-600', label: 'Confirmar', ring: 'ring-indigo-500/30' },
  };
  const v = variants[variant];

  return (
    <SandboxLayout
      title="Modal de Confirmación"
      description="Modal con overlay y 3 variantes semánticas (danger, warning, info) con focus trap simulado."
      controls={[
        { label: 'Variante', type: 'select', value: variant, options: Object.keys(variants), onChange: setVariant },
        { label: 'Título', type: 'text', value: title, onChange: setTitle },
        { label: 'Cuerpo', type: 'text', value: body, onChange: setBody },
      ]}
    >
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() => setIsOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
        >
          Abrir Modal
        </button>

        {isOpen && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}
          >
            <div className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-7 max-w-sm w-full mx-4 shadow-2xl ring-1 ${v.ring} animate-fade-in-up text-left`}>
              <div className="flex items-start gap-4 mb-5">
                <div className="p-3 bg-[var(--color-surface-2)] rounded-2xl shrink-0">{v.icon}</div>
                <div>
                  <h3 className="font-black text-sm text-[var(--color-text)]">{title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">{body}</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-2)]/80 text-[var(--color-text-muted)] text-xs font-bold rounded-xl cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`flex-1 py-2.5 ${v.bg} hover:opacity-90 text-white text-xs font-bold rounded-xl cursor-pointer transition-all`}
                >
                  {v.label}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
