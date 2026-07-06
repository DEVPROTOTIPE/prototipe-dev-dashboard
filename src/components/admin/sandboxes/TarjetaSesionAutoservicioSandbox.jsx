import React, { useState, useEffect } from 'react';
import { SandboxLayout } from './SandboxLayout';

const MAQUINAS = [
  { id: 'L1', tipo: 'Lavadora', num: 1, estado: 'libre', minutos: 0 },
  { id: 'L2', tipo: 'Lavadora', num: 2, estado: 'ocupada', minutos: 24 },
  { id: 'L3', tipo: 'Lavadora', num: 3, estado: 'ocupada', minutos: 8 },
  { id: 'S1', tipo: 'Secadora', num: 1, estado: 'libre', minutos: 0 },
  { id: 'S2', tipo: 'Secadora', num: 2, estado: 'ocupada', minutos: 42 },
  { id: 'S3', tipo: 'Secadora', num: 3, estado: 'libre', minutos: 0 },
];

function countdown(m) {
  return m > 0 ? `${m} min` : '—';
}

function AutoservicioComponent() {
  const [maquinas, setMaquinas] = useState(MAQUINAS.map(m => ({ ...m })));
  const [selected, setSelected] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const selMaq = maquinas.find(m => m.id === selected);

  const iniciar = (id) => {
    setMaquinas(ms => ms.map(m => m.id === id ? { ...m, estado: 'ocupada', minutos: 35 } : m));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        {maquinas.map(m => (
          <button key={m.id} onClick={() => setSelected(m.id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all cursor-pointer ${
              selected === m.id
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40'
            }`}>
            <span className="text-xl">{m.tipo === 'Lavadora' ? '🫧' : '🌀'}</span>
            <span className="text-[10px] font-black text-[var(--color-text)]">{m.tipo} {m.num}</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.estado === 'libre' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {m.estado === 'libre' ? 'Libre' : countdown(m.minutos)}
            </span>
          </button>
        ))}
      </div>

      {selMaq && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selMaq.tipo === 'Lavadora' ? '🫧' : '🌀'}</span>
            <div>
              <p className="text-sm font-black text-[var(--color-text)]">{selMaq.tipo} #{selMaq.num}</p>
              <p className={`text-xs font-bold ${selMaq.estado === 'libre' ? 'text-green-400' : 'text-red-400'}`}>
                {selMaq.estado === 'libre' ? '✓ Disponible' : `⏱ ${selMaq.minutos} minutos restantes`}
              </p>
            </div>
          </div>

          {selMaq.estado === 'ocupada' && (
            <div className="w-full h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-primary)] rounded-full animate-pulse" style={{ width: `${100 - (selMaq.minutos / 60) * 100}%` }} />
            </div>
          )}

          {selMaq.estado === 'libre' && (
            <button onClick={() => iniciar(selMaq.id)}
              className="w-full py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-black cursor-pointer hover:opacity-90 transition-opacity">
              Iniciar ciclo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function TarjetaSesionAutoservicioSandbox() {
  return (
    <SandboxLayout
      title="Tarjeta de Sesión Autoservicio"
      description="Selecciona una máquina para ver su estado y tiempo restante"
    >
      <AutoservicioComponent />
    </SandboxLayout>
  );
}
