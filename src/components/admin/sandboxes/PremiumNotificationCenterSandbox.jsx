import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import PremiumNotificationCenter from '../../common/PremiumNotificationCenter';

export default function PremiumNotificationCenterSandbox() {
  const [notificationLog, setNotificationLog] = useState([]);

  // Nota: Dado que PremiumNotificationCenter encapsula su propio estado mock
  // en la bandeja para esta ilustración, aquí lo mostramos dentro de una barra
  // de navegación superior simulada para evaluar la alineación absoluta,
  // el z-index y el comportamiento responsive.

  return (
    <SandboxLayout
      title="PremiumNotificationCenter"
      description="Bandeja de notificaciones flotante premium con resolución del BUG-002 (cierre por clics fuera en móviles usando fase de captura), micro-interacciones de Framer Motion, y scroll nativo anti-clipping."
    >
      <div className="w-full max-w-2xl mx-auto space-y-6">
        
        {/* Barra de navegación de cabecera ficticia */}
        <div className="w-full h-16 px-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex items-center justify-between shadow-soft-md">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
              Ecosistema Panel
            </span>
          </div>

          {/* Componente Integrado */}
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-[var(--color-text-muted)] font-medium hidden sm:inline">
              Sergio (Admin)
            </span>
            <PremiumNotificationCenter />
          </div>
        </div>

        {/* Panel explicativo */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] space-y-2">
          <p className="font-bold text-[var(--color-text)]">🛠️ Simulación y pruebas de interacción:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Haz clic en la campana de notificaciones para desplegar la bandeja histórica.</li>
            <li>En viewports de escritorio se abrirá como menú absoluto; si reduces la ventana (simulando móvil) ocupará pantalla completa con un botón de cierre.</li>
            <li>Haz clic fuera del menú o de la campana y verifica que se cierra al instante (Fix BUG-002 en mousedown y touchstart con capture phase).</li>
          </ul>
        </div>
      </div>
    </SandboxLayout>
  );
}
