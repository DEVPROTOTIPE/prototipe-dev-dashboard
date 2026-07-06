import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente Local para simulación autónoma en el sandbox
function LocalTypingBubbleIndicator({
  dotsColor = 'bg-[var(--color-text-muted)]',
  className = ''
}) {
  return (
    <div className={`inline-flex items-center gap-1 px-4 py-2.5 rounded-2xl rounded-bl-sm bg-[var(--color-surface-3)] border border-[var(--color-border)] shadow-sm ${className}`}>
      <div 
        className={`w-1.5 h-1.5 rounded-full animate-typingDot ${dotsColor}`}
        style={{ animationDelay: '0s' }}
      />
      <div 
        className={`w-1.5 h-1.5 rounded-full animate-typingDot ${dotsColor}`}
        style={{ animationDelay: '0.2s' }}
      />
      <div 
        className={`w-1.5 h-1.5 rounded-full animate-typingDot ${dotsColor}`}
        style={{ animationDelay: '0.4s' }}
      />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes typingDot {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }
        .animate-typingDot {
          animation: typingDot 0.9s infinite ease-in-out;
        }
      `}} />
    </div>
  );
}

export default function TypingBubbleIndicatorSandbox() {
  const [dotsColor, setDotsColor] = useState('bg-[var(--color-text-muted)]');

  const controls = [
    {
      type: 'select',
      label: 'Color de los Puntos',
      value: dotsColor,
      options: [
        { value: 'bg-[var(--color-text-muted)]', label: 'Silenciado (Muted)' },
        { value: 'bg-[var(--color-primary)]', label: 'Marca (Primary)' },
        { value: 'bg-emerald-500', label: 'Activo (Emerald)' }
      ],
      onChange: setDotsColor
    }
  ];

  return (
    <SandboxLayout title="TypingBubbleIndicator" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <div className="p-8 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full flex flex-col gap-4 min-h-[180px]">
          {/* Fila Simulada de Chat de Cliente */}
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-xs font-bold border border-[var(--color-primary)]/20 shrink-0">
              AI
            </div>
            <div className="flex flex-col gap-1 items-start">
              <span className="text-[10px] text-[var(--color-text-muted)] font-medium">Asistente Virtual</span>
              <LocalTypingBubbleIndicator dotsColor={dotsColor} />
            </div>
          </div>
        </div>
      </div>
    </SandboxLayout>
  );
}
