import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../../ui/CustomSelect';

const BANNER_THEMES = {
  success: 'bg-green-500/15 border-green-500 text-green-500 ring-4 ring-green-500/5',
  warning: 'bg-amber-500/15 border-amber-500 text-amber-500 ring-4 ring-amber-500/5',
  error: 'bg-red-500/15 border-red-500 text-red-500 ring-4 ring-red-500/5'
};

// Componente Local para simulación autónoma en el sandbox
function LocalAlertBannerSlide({
  show = false,
  message = '',
  type = 'success',
  onClose,
  duration = 3000
}) {
  React.useEffect(() => {
    if (!show || duration <= 0) return;

    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 20 }}
          className={`absolute top-4 left-4 right-4 z-40 p-3.5 rounded-xl border flex items-center justify-between shadow-lg select-none ${BANNER_THEMES[type] || BANNER_THEMES.success}`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-bold leading-tight">{message}</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-black/5 active:bg-black/10 transition-colors text-current font-bold"
            >
              ✕
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AlertBannerSlideSandbox() {
  const [show, setShow] = useState(false);
  const [type, setType] = useState('success');
  const [message, setMessage] = useState('¡Operación realizada con éxito!');
  const [duration, setDuration] = useState(3000);

  const controls = [
    {
      type: 'custom',
      label: 'Tipo de Alerta',
      render: () => (
        <CustomSelect
          options={[
            { value: 'success', label: 'Éxito (success)' },
            { value: 'warning', label: 'Advertencia (warning)' },
            { value: 'error', label: 'Error (error)' }
          ]}
          value={type}
          onChange={setType}
        />
      )
    },
    {
      type: 'text',
      label: 'Mensaje de Alerta',
      value: message,
      onChange: setMessage
    },
    {
      type: 'number',
      label: 'Duración (ms)',
      value: duration,
      onChange: setDuration,
      min: 0,
      max: 10000
    }
  ];

  return (
    <SandboxLayout title="AlertBannerSlide" controls={controls}>
      {/* Contenedor relativo y con pt-20 para alojar el banner absolute superior */}
      <div className="flex flex-col items-center justify-center p-12 pt-20 space-y-6 w-full max-w-sm mx-auto relative overflow-hidden min-h-[160px]">
        <LocalAlertBannerSlide
          show={show}
          message={message}
          type={type}
          duration={duration}
          onClose={() => setShow(false)}
        />
        
        <button
          onClick={() => setShow(true)}
          className="py-2.5 px-5 rounded-xl text-xs font-semibold bg-[var(--color-primary)] !text-white hover:bg-[var(--color-primary)]/90 shadow-md transition-all outline-none"
        >
          Disparar Alerta
        </button>

        <div className="text-sm text-[var(--color-text-muted)] w-full text-center select-none">
          Estado del banner: <span className="font-mono text-[var(--color-text)] font-bold">{show ? 'MOSTRANDO' : 'OCULTO'}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
