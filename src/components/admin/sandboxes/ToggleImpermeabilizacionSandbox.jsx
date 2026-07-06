import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const PRECIO_TEFLONADO = 45000;
const GARANTIA_MESES = 6;

function ToggleImpermeabilizacionComponent() {
  const [activo, setActivo] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className={`relative p-5 rounded-3xl border-2 transition-all duration-500 ${activo
        ? 'border-blue-500/60 bg-gradient-to-br from-blue-500/10 to-blue-600/5 shadow-[0_0_30px_rgba(59,130,246,0.15)]'
        : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`}>

        {activo && (
          <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-blue-400/10 animate-ping"
                style={{ width: 8+i*12, height: 8+i*12, top: `${15+i*10}%`, left: `${10+i*13}%`, animationDelay: `${i*0.3}s`, animationDuration: '3s' }} />
            ))}
          </div>
        )}

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <p className="text-sm font-black text-[var(--color-text)]">Teflonado Impermeabilizante</p>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
              Tratamiento nano-repelente que protege la tela de líquidos, manchas y polvo.
            </p>
            {activo && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-black text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full">✓ Garantía {GARANTIA_MESES} meses</span>
                <span className="text-[10px] font-black text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full">+1 día extra</span>
              </div>
            )}
          </div>

          <button onClick={() => setActivo(a => !a)}
            className={`relative w-14 h-7 rounded-full border-2 transition-all duration-300 cursor-pointer shrink-0 ${activo ? 'bg-blue-500 border-blue-400' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${activo ? 'left-[30px]' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${activo ? 'border-blue-500/40 bg-blue-500/10' : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`}>
        <div>
          <p className="text-[10px] text-[var(--color-text-muted)]">Servicio adicional</p>
          <p className="text-xs font-black text-[var(--color-text)]">Teflonado {activo ? 'incluido' : 'no incluido'}</p>
        </div>
        <div className="text-right">
          <p className={`text-xl font-black transition-colors ${activo ? 'text-blue-400' : 'text-[var(--color-text-muted)]'}`}>
            {activo ? `+$${(PRECIO_TEFLONADO/1000).toFixed(0)}k` : '$0'}
          </p>
        </div>
      </div>

      {activo && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">¿Qué incluye?</p>
          {['Aplicación de nano-repelente profesional','Secado UV controlado (1 hora adicional)','Certificado de garantía de 6 meses','Prueba de goteo incluida'].map(item => (
            <div key={item} className="flex items-center gap-2">
              <span className="text-blue-400 text-xs shrink-0">✓</span>
              <span className="text-[11px] text-[var(--color-text)]">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ToggleImpermeabilizacionSandbox() {
  return (
    <SandboxLayout
      title="Toggle de Impermeabilización"
      description="Activa el servicio de teflonado con garantía. Observa el efecto visual y el desglose de precio."
    >
      <ToggleImpermeabilizacionComponent />
    </SandboxLayout>
  );
}
