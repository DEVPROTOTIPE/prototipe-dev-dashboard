import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const TIPOS_MANCHA = ['Aceite','Vino','Café','Sangre','Tinta','Barro','Grasa','Sudor'];
const ZONAS_FRENTE = [
  { id: 'hombro_izq', label: 'Hombro Izq', top: '10%', left: '20%' },
  { id: 'hombro_der', label: 'Hombro Der', top: '10%', left: '70%' },
  { id: 'pecho', label: 'Pecho', top: '22%', left: '45%' },
  { id: 'manga_izq', label: 'Manga Izq', top: '30%', left: '8%' },
  { id: 'manga_der', label: 'Manga Der', top: '30%', left: '82%' },
  { id: 'abdomen', label: 'Abdomen', top: '42%', left: '45%' },
  { id: 'falda_izq', label: 'Falda Izq', top: '62%', left: '30%' },
  { id: 'falda_der', label: 'Falda Der', top: '62%', left: '60%' },
];

function FichaComponent() {
  const [manchas, setManchas] = useState([]);
  const [tipoActivo, setTipoActivo] = useState('Aceite');
  const [lado, setLado] = useState('frente');

  const addMancha = (zona) => {
    if (manchas.find(m => m.zona === zona.id && m.lado === lado)) return;
    setManchas(m => [...m, { zona: zona.id, label: zona.label, tipo: tipoActivo, lado }]);
  };
  const remove = (i) => setManchas(m => m.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {['frente','espalda'].map(l => (
          <button key={l} onClick={() => setLado(l)}
            className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer capitalize ${lado===l ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Tipo de mancha activa</span>
        <div className="flex flex-wrap gap-1.5">
          {TIPOS_MANCHA.map(t => (
            <button key={t} onClick={() => setTipoActivo(t)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${tipoActivo===t ? 'bg-orange-500/20 border-orange-500/60 text-orange-400' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden" style={{ width: '180px', height: '260px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-7xl opacity-20">{lado === 'frente' ? '👕' : '🔄'}</span>
        </div>
        <p className="absolute top-2 left-0 right-0 text-center text-[9px] font-bold text-[var(--color-text-muted)] uppercase">{lado}</p>
        {ZONAS_FRENTE.map(z => {
          const marcada = manchas.find(m => m.zona === z.id && m.lado === lado);
          return (
            <button key={z.id} onClick={() => addMancha(z)}
              title={z.label}
              style={{ top: z.top, left: z.left, transform: 'translate(-50%,-50%)' }}
              className={`absolute w-7 h-7 rounded-full border-2 text-[9px] font-black transition-all cursor-pointer ${marcada ? 'bg-red-500 border-red-400 text-white scale-110' : 'bg-white/5 border-white/20 text-white/40 hover:border-orange-400 hover:bg-orange-500/20'}`}>
              {marcada ? '!' : '+'}
            </button>
          );
        })}
      </div>

      {manchas.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Manchas registradas ({manchas.length})</span>
          {manchas.map((m, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-xl">
              <span className="text-[11px] text-red-400 font-semibold">{m.label} ({m.lado}) — {m.tipo}</span>
              <button onClick={() => remove(i)} className="text-red-400 text-xs font-black cursor-pointer hover:text-red-300">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FichaReporteManchasSandbox() {
  return (
    <SandboxLayout
      title="Ficha de Reporte de Manchas"
      description="Toca la zona de la prenda para marcar manchas. Selecciona el tipo antes de marcar."
    >
      <FichaComponent />
    </SandboxLayout>
  );
}
