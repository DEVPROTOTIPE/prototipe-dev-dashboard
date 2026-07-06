import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente real inline para el Sandbox
function PestanasFiltroTemporada({
  seasons,
  activeSeasonId,
  onChangeSeason
}) {
  return (
    <div 
      id="pestanas-filtro-temporada-wrapper"
      className="w-full overflow-x-auto scrollbar-none flex gap-2.5 p-1 border-b border-[var(--color-border)]/40"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {seasons.map(s => {
        const isActive = activeSeasonId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChangeSeason && onChangeSeason(s.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
              isActive
                ? 'bg-indigo-600/15 text-indigo-500 border border-indigo-500/20 shadow-md shadow-indigo-600/5 scale-98'
                : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-indigo-500/40 hover:text-[var(--color-text)]'
            }`}
            id={`tab-season-${s.id}`}
          >
            <span>{s.label}</span>
            <span className={`text-[10px] px-1.5 py-0.25 rounded-md font-black ${
              isActive 
                ? 'bg-indigo-600 text-white' 
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
            }`}>
              {s.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const SEASONS_MOCK = [
  { id: 'all', label: 'Ver Todo 🛍️', count: 245 },
  { id: 'winter', label: 'Otoño-Invierno 🍁', count: 85 },
  { id: 'summer', label: 'Primavera-Verano ☀️', count: 110 },
  { id: 'sports', label: 'Activewear / Deportivo ⚡', count: 50 }
];

export default function PestanasFiltroTemporadaSandbox() {
  const [activeSeason, setActiveSeason] = useState('all');

  const controls = [
    {
      label: 'Reiniciar a Ver Todo',
      type: 'toggle',
      value: activeSeason === 'all',
      onChange: (val) => {
        if (val) setActiveSeason('all');
      }
    }
  ];

  return (
    <SandboxLayout
      title="Pestañas de Filtro por Temporada"
      description="Hilera deslizable de tags horizontales premium para filtrar colecciones y catálogos en tiempo real."
      controls={controls}
    >
      <div className="flex flex-col items-center justify-center p-2 w-full max-w-md">
        <PestanasFiltroTemporada
          seasons={SEASONS_MOCK}
          activeSeasonId={activeSeason}
          onChangeSeason={setActiveSeason}
        />
        <div className="mt-4 text-xs font-semibold text-[var(--color-text-muted)] text-center">
          Temporada activa elegida: <span className="text-[var(--color-text)] font-black uppercase tracking-wider">{activeSeason}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
