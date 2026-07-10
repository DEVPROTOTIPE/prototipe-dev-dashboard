import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import PremiumWelcomeSplash from '../../common/PremiumWelcomeSplash';

export default function WelcomePageSandbox() {
  const [navigationLog, setNavigationLog] = useState('');

  return (
    <SandboxLayout
      title="WelcomePage Sandbox"
      description="Playground interactivo para simular el comportamiento de la pantalla de bienvenida modular PremiumWelcomeSplash con animación sonar concéntrica, micro-ondas concéntricas y orbes ambientales."
    >
      <div className="w-full max-w-lg mx-auto space-y-6">
        
        {/* Renderizado de la pantalla de bienvenida */}
        <div className="border border-[var(--color-border)] rounded-[24px] overflow-hidden shadow-soft-2xl bg-[var(--color-surface-2)]">
          <PremiumWelcomeSplash
            brandName="Tienda Gourmet"
            tagline="Los mejores cortes y vinos importados en un solo clic."
            onNavigateLogin={() => setNavigationLog('Navegando a: Iniciar Sesión (Ruta de Login)')}
            onNavigateCatalog={() => setNavigationLog('Navegando a: Explorar Catálogo (Ruta de Invitado)')}
          />
        </div>

        {/* Log de Navegación del Evento */}
        {navigationLog && (
          <div className="p-4 rounded-2xl bg-[var(--color-surface-3)] border border-[var(--color-border)] space-y-1 animate-fade-in">
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-primary)]">
              Acción Disparada (onNavigate...)
            </span>
            <p className="text-xs font-semibold text-[var(--color-text)]">
              {navigationLog}
            </p>
          </div>
        )}

      </div>
    </SandboxLayout>
  );
}
