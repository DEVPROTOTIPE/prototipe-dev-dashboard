import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import PhoneIdLoginPage from '../../common/PhoneIdLoginPage';

export default function PhoneIdLoginPageSandbox() {
  const [lastLogin, setLastLogin] = useState(null);

  const handleLoginSuccess = (payload) => {
    setLastLogin(payload);
  };

  return (
    <SandboxLayout
      title="PhoneIdLoginPage"
      description="Playground interactivo para la página de login directa. Permite inicio de sesión rápido para clientes únicamente ingresando su número celular como ID de cuenta (sin verificar SMS), y login clásico para personal."
    >
      <div className="w-full max-w-lg mx-auto space-y-6">
        <PhoneIdLoginPage onLoginSuccess={handleLoginSuccess} />

        {lastLogin && (
          <div className="p-4 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">
              Sesión Iniciada Exitosamente (onLoginSuccess)
            </div>
            <div className="text-xs font-mono bg-black/30 p-3 rounded-lg text-[var(--color-text)]">
              {JSON.stringify(lastLogin, null, 2)}
            </div>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
