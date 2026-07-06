import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { SandboxLayout } from './SandboxLayout';

function SandboxGuidedToast({ isVisible, message, type = 'info', onClose, onActionClick, actionText }) {
  if (!isVisible || !message) return null;
  const config = {
    success: { bg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400', icon: <CheckCircle size={18} className="text-emerald-400" /> },
    warning: { bg: 'bg-amber-500/10 border-amber-500/25 text-amber-400', icon: <AlertTriangle size={18} className="text-amber-400" /> },
    error: { bg: 'bg-red-500/10 border-red-500/25 text-red-400', icon: <AlertTriangle size={18} className="text-red-400" /> },
    info: { bg: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400', icon: <Info size={18} className="text-indigo-400" /> },
  }[type] || { bg: 'bg-[var(--color-surface)]/90 border-[var(--color-border)] text-slate-100', icon: <Info size={18} /> };

  return (
    <div className={`w-full border backdrop-blur-xl p-4 rounded-2xl flex items-start gap-3 ${config.bg} text-left`}>
      <div className="shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-xs font-bold leading-relaxed">{message}</p>
        {onActionClick && actionText && (
          <button onClick={onActionClick} className="mt-2 text-[10px] font-black uppercase tracking-wider hover:underline cursor-pointer">{actionText}</button>
        )}
      </div>
      <button onClick={onClose} className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"><X size={14} /></button>
    </div>
  );
}

export default function GuidedToastSandbox() {
  const { showAlert } = useAlertConfirm();
  const [type, setType] = useState('success');
  const [message, setMessage] = useState('¡Operación completada exitosamente!');
  const [hasAction, setHasAction] = useState(false);
  const [visible, setVisible] = useState(true);

  return (
    <SandboxLayout
      title="GuidedToast"
      description="Notificación contextual con soporte para acciones y 4 variantes semánticas."
      controls={[
        { label: 'Tipo', type: 'select', value: type, options: ['success', 'error', 'warning', 'info'], onChange: setType },
        { label: 'Con Acción', type: 'toggle', value: hasAction, onChange: setHasAction, labels: ['No', 'Sí'] },
        { label: 'Mensaje', type: 'text', value: message, onChange: setMessage },
      ]}
    >
      <div className="space-y-4 w-full">
        <div className="flex justify-center gap-2 flex-wrap">
          {['success', 'error', 'warning', 'info'].map(t => (
            <button
              key={t}
              onClick={() => { setType(t); setVisible(true); }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all ${
                type === t ? 'bg-indigo-600 text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]/80'
              }`}
            >{t}</button>
          ))}
        </div>
        {visible ? (
          <SandboxGuidedToast
            isVisible={true}
            message={message}
            type={type}
            onClose={() => setVisible(false)}
            onActionClick={hasAction ? () => showAlert({ title: 'Detalles', message: '¡Acción ejecutada desde el Toast Premium!', variant: 'success' }) : null}
            actionText={hasAction ? 'Ver detalles →' : ''}
          />
        ) : (
          <div className="text-center py-6">
            <button
              onClick={() => setVisible(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
            >
              Mostrar Toast
            </button>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
