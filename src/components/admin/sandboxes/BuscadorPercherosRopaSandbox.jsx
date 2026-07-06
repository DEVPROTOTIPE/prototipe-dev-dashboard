import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const PERCHEROS = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  pasillo: i < 8 ? 'A' : i < 16 ? 'B' : 'C',
  color: ['azul','verde','rojo','amarillo'][i % 4],
}));

const COLOR_MAP = { azul: 'bg-blue-500', verde: 'bg-green-500', rojo: 'bg-red-500', amarillo: 'bg-yellow-400' };

function BuscadorComponent() {
  const [query, setQuery] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(false);

  const buscar = () => {
    const n = parseInt(query, 10);
    const p = PERCHEROS.find(p => p.id === n);
    if (p) { setResultado(p); setError(false); }
    else { setResultado(null); setError(true); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input
          type="number" min={1} max={24} value={query}
          onChange={e => { setQuery(e.target.value); setError(false); setResultado(null); }}
          onKeyDown={e => e.key === 'Enter' && buscar()}
          placeholder="N° de ticket (1-24)"
          className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/50"
        />
        <button onClick={buscar}
          className="px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-black rounded-xl cursor-pointer hover:opacity-90">
          Buscar
        </button>
      </div>

      {error && <p className="text-[11px] text-red-400 font-semibold">No se encontró el perchero #{query}</p>}

      {resultado && (
        <div className="flex items-center gap-4 p-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-2xl">
          <div className={`w-10 h-10 rounded-xl ${COLOR_MAP[resultado.color]} flex items-center justify-center text-white font-black text-sm`}>
            {resultado.id}
          </div>
          <div>
            <p className="text-xs font-black text-[var(--color-text)]">Perchero #{resultado.id}</p>
            <p className="text-[11px] text-[var(--color-text-muted)]">Pasillo {resultado.pasillo} · Marcador: {resultado.color}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Mapa de percheros</p>
        <div className="grid grid-cols-8 gap-1.5">
          {PERCHEROS.map(p => (
            <div key={p.id}
              className={`h-7 rounded-lg flex items-center justify-center text-[9px] font-black text-white transition-all ${COLOR_MAP[p.color]} ${resultado?.id === p.id ? 'ring-2 ring-white scale-125 z-10' : 'opacity-70'}`}>
              {p.id}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-1">
          {Object.entries(COLOR_MAP).map(([c, cls]) => (
            <div key={c} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-sm ${cls}`} />
              <span className="text-[9px] text-[var(--color-text-muted)] capitalize">{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BuscadorPercherosRopaSandbox() {
  return (
    <SandboxLayout
      title="Buscador de Percheros de Ropa"
      description="Ingresa el número de ticket para ubicar el perchero en el pasillo"
    >
      <BuscadorComponent />
    </SandboxLayout>
  );
}
