import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Shirt } from 'lucide-react';

const PRENDAS = [
  { id: 'camisa', label: 'Camisa', metodo: 'Normal', temp: '40°C', icono: '👕', nota: 'Lavado estándar, centrifugado normal.' },
  { id: 'pantalon', label: 'Pantalón', metodo: 'Normal', temp: '40°C', icono: '👖', nota: 'Voltear antes de lavar.' },
  { id: 'vestido', label: 'Vestido', metodo: 'Delicado', temp: '30°C', icono: '👗', nota: 'Ciclo suave, sin centrifugado fuerte.' },
  { id: 'lana', label: 'Lana', metodo: 'A mano', temp: '20°C', icono: '🧶', nota: 'Sumergir suavemente, no frotar.' },
  { id: 'seda', label: 'Seda', metodo: 'Seco', temp: 'No lavar', icono: '🎀', nota: 'Solo limpieza en seco profesional.' },
  { id: 'ropa_interior', label: 'Interior', metodo: 'Delicado', temp: '30°C', icono: '🧺', nota: 'Ciclo delicado o a mano.' },
  { id: 'toalla', label: 'Toalla', metodo: 'Normal', temp: '60°C', icono: '🛁', nota: 'Alta temperatura para higiene total.' },
  { id: 'abrigo', label: 'Abrigo', metodo: 'Seco', temp: 'No lavar', icono: '🧥', nota: 'Limpieza profesional recomendada.' },
  { id: 'deportiva', label: 'Deportiva', metodo: 'Normal', temp: '30°C', icono: '👟', nota: 'Temperatura baja para fibras técnicas.' },
];

const METODO_STYLE = {
  Normal: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  Delicado: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  Seco: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  'A mano': 'text-green-400 bg-green-500/10 border-green-500/30',
};

function SelectorComponent() {
  const [selected, setSelected] = useState(null);
  const prenda = PRENDAS.find(p => p.id === selected);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        {PRENDAS.map(p => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all cursor-pointer ${
              selected === p.id
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 scale-[1.03] shadow-md'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/50'
            }`}
          >
            <span className="text-xl">{p.icono}</span>
            <span className="text-[10px] font-semibold text-[var(--color-text)] leading-tight">{p.label}</span>
          </button>
        ))}
      </div>

      {prenda ? (
        <div className={`border rounded-2xl p-4 flex flex-col gap-2 transition-all ${METODO_STYLE[prenda.metodo]}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider">Método: {prenda.metodo}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10">{prenda.temp}</span>
          </div>
          <p className="text-[11px] opacity-80 leading-relaxed">{prenda.nota}</p>
        </div>
      ) : (
        <div className="border border-dashed border-[var(--color-border)] rounded-2xl p-4 text-center text-[11px] text-[var(--color-text-muted)]">
          Selecciona una prenda para ver el método de lavado
        </div>
      )}
    </div>
  );
}

export default function SelectorTipoPrendaLavadoSandbox() {
  return (
    <SandboxLayout
      title="Selector de Tipo de Prenda y Lavado"
      description="Grilla de prendas con método de lavado recomendado por categoría"
    >
      <SelectorComponent />
    </SandboxLayout>
  );
}
