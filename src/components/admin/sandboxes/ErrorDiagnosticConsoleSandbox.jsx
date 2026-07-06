import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';

export default function ErrorDiagnosticConsoleSandbox() {
  const [theme, setTheme] = useState('dark');

  return (
    <SandboxLayout
      title="Consola de Errores y Diagnóstico Inteligente (ErrorDiagnosticConsole) (ErrorDiagnosticConsole)"
      description="Playground interactivo para simular el comportamiento del componente."
      controls={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Tema del Componente</label>
            <div className="flex gap-2">
              {['light', 'dark'].map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    theme === t
                      ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className={`p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center min-h-[220px]`}>
        <div className="text-center space-y-2">
          <p className="text-xs text-[var(--color-text-muted)] font-mono">
            [ Componente ErrorDiagnosticConsole Scaffolded ]
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Personaliza este Sandbox importando tu componente y vinculando sus propiedades.
          </p>
        </div>
      </div>
    </SandboxLayout>
  );
}
