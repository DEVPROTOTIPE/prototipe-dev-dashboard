import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const DICTIONARY = {
  'wash-30': {
    label: 'Lavado a máquina máx 30°C',
    description: 'Lavar en ciclo delicado con agua fría para preservar fibras.',
    svgPath: 'M12 4v4m0 0a4 4 0 100 8 4 4 0 000-8z'
  },
  'no-bleach': {
    label: 'No usar blanqueador',
    description: 'El uso de cloro o blanqueadores ópticos dañará el color original.',
    svgPath: 'M18.36 5.64L5.64 18.36M12 2a10 10 0 110 20 10 10 0 010-20z'
  },
  'iron-low': {
    label: 'Planchar a temperatura baja',
    description: 'Temperatura máxima de la suela de la plancha: 110°C.',
    svgPath: 'M3 19h18M6 15c0-4 3-7 6-7h6v4c0 2-2 3-4 3H6z'
  },
  'dry-flat': {
    label: 'Secar en plano horizontal',
    description: 'Secar extendido horizontalmente a la sombra para evitar deformaciones.',
    svgPath: 'M3 12h18M5 6v12M19 6v12'
  }
};

// Componente real inline para el Sandbox
function IconosCuidadoPrendas({
  instructions
}) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  return (
    <div 
      id="iconos-cuidado-prendas-container"
      className="flex gap-3 items-center justify-start p-1"
    >
      {instructions.map(instKey => {
        const data = DICTIONARY[instKey];
        if (!data) return null;
        const isHovered = activeTooltip === instKey;

        return (
          <div 
            key={instKey}
            className="relative"
            onMouseEnter={() => setActiveTooltip(instKey)}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            {/* Botón de Icono */}
            <div
              className={`w-10 h-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 text-[var(--color-text)] flex items-center justify-center transition-all duration-300 cursor-help hover:border-indigo-500/40 hover:text-indigo-500 hover:bg-indigo-500/5`}
              id={`icon-care-${instKey}`}
            >
              <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={data.svgPath} />
              </svg>
            </div>

            {/* Tooltip interactivo premium */}
            {isHovered && (
              <div 
                id={`tooltip-care-${instKey}`}
                className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-48 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] shadow-xl backdrop-blur-md animate-fade-in"
              >
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2.5 h-2.5 rotate-45 bg-[var(--color-surface)] border-r border-b border-[var(--color-border)]" />
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400 block mb-0.5">
                  Cuidado
                </span>
                <span className="text-[11px] font-bold block leading-tight mb-1">
                  {data.label}
                </span>
                <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                  {data.description}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function IconosCuidadoPrendasSandbox() {
  const [activeSet, setActiveSet] = useState('full');

  const selectedInstructions = activeSet === 'full' 
    ? ['wash-30', 'no-bleach', 'iron-low', 'dry-flat']
    : ['no-bleach', 'iron-low'];

  const controls = [
    {
      label: 'Mostrar solo advertencias',
      type: 'toggle',
      value: activeSet === 'warn',
      onChange: (val) => setActiveSet(val ? 'warn' : 'full'),
      labels: ['Solo blanqueador y plancha', 'Ver todo']
    }
  ];

  return (
    <SandboxLayout
      title="Iconos de Cuidado de Prendas"
      description="Fila de símbolos de lavado internacionales con tooltips explicativos interactivos en hover."
      controls={controls}
    >
      <div className="flex flex-col items-center justify-center p-6 w-80">
        <IconosCuidadoPrendas
          instructions={selectedInstructions}
        />
        <div className="mt-4 text-[11px] text-[var(--color-text-muted)] text-center leading-normal">
          Pasa el cursor sobre los iconos para ver las instrucciones técnicas de planchado y secado.
        </div>
      </div>
    </SandboxLayout>
  );
}
