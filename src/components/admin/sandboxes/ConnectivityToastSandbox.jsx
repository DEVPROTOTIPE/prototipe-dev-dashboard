import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

export default function ConnectivityToastSandbox() {
  const [simulatedStatus, setSimulatedStatus] = useState(null); // null, 'online', 'offline'

  const triggerOnline = () => {
    setSimulatedStatus('online');
    const timer = setTimeout(() => {
      setSimulatedStatus(null);
    }, 3000);
    return () => clearTimeout(timer);
  };

  const triggerOffline = () => {
    setSimulatedStatus('offline');
  };

  return (
    <SandboxLayout
      title="Connectivity Toast"
      description="Toast superior reactivo de red. Puedes simular los estados online/offline mediante los controles inferiores."
      controls={[
        { label: 'Simular Estado', type: 'select', value: simulatedStatus || 'Ninguno', options: ['Ninguno', 'online', 'offline'], onChange: (val) => {
          if (val === 'online') triggerOnline();
          else if (val === 'offline') triggerOffline();
          else setSimulatedStatus(null);
        }},
      ]}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={triggerOnline}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-xl cursor-pointer transition-all active:scale-95"
          >
            Simular Conexión (3s)
          </button>
          <button
            onClick={triggerOffline}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-xl cursor-pointer transition-all active:scale-95"
          >
            Simular Desconexión (Fijo)
          </button>
        </div>

        {/* Notificación Inline Simulada (para ver dentro del Sandbox sin tapar toda la pantalla de forma invasiva, pero posicionada absolutamente arriba si se desea) */}
        <div className="w-full flex items-center justify-center p-4 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface-2)]/40 min-h-[80px]">
          <AnimatePresence mode="wait">
            {simulatedStatus ? (
              <motion.div
                key={simulatedStatus}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-md border font-bold text-xs select-none ${
                  simulatedStatus === 'online'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                }`}
              >
                {simulatedStatus === 'online' ? (
                  <>
                    <Wifi size={14} className="animate-pulse" />
                    <span>Conexión restablecida</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={14} className="animate-bounce" />
                    <span>Sin conexión a Internet</span>
                  </>
                )}
              </motion.div>
            ) : (
              <span className="text-[10px] text-[var(--color-text-muted)] italic">No hay alertas activas</span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SandboxLayout>
  );
}
