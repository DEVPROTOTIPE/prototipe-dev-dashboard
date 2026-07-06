import React, { useRef, useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Layers, ChevronLeft, ChevronRight, HelpCircle, Thermometer } from 'lucide-react';

// Recreación inline del componente
function SelectorRefrigeranteRepuestos({
  selectedItem = '',
  onChange = null,
  items = [
    {
      id: 'r410a',
      name: 'Gas Ecológico R410A',
      type: 'Refrigerante HFC',
      color: '#ff6b6b',
      desc: 'Gas estándar actual en aire acondicionado comercial y residencial Inverter.',
      pressurePsi: '120 - 130 PSI'
    },
    {
      id: 'r32',
      name: 'Gas Eficiente R32',
      type: 'Refrigerante Puro HFC',
      color: '#4dadf7',
      desc: 'Nueva generación con menor potencial de calentamiento atmosférico.',
      pressurePsi: '125 - 135 PSI'
    },
    {
      id: 'r134a',
      name: 'Gas Automotriz R134a',
      type: 'Refrigerante HFC',
      color: '#ffc078',
      desc: 'Principalmente para aire acondicionado automotriz y refrigeradores.',
      pressurePsi: '25 - 45 PSI'
    },
    {
      id: 'r22',
      name: 'Gas Tradicional R22',
      type: 'Refrigerante HCFC (Restringido)',
      color: '#a9e34b',
      desc: 'Usado en sistemas antiguos. En fase de eliminación internacional.',
      pressurePsi: '60 - 70 PSI'
    },
    {
      id: 'filter_drier',
      name: 'Filtro Deshidratador',
      type: 'Consumible Cobre',
      color: '#ced4da',
      desc: 'Retiene humedad e impurezas mecánicas en la línea de líquido.',
      pressurePsi: 'N/A'
    }
  ]
}) {
  const [activeId, setActiveId] = useState(selectedItem || items[0].id);
  const scrollRef = useRef(null);

  const handleSelect = (id) => {
    setActiveId(id);
    const selected = items.find(i => i.id === id);
    if (onChange && selected) {
      onChange(selected);
    }
  };

  const handleScroll = (dir) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const offset = dir === 'left' ? -220 : 220;
      scrollRef.current.scrollTo({
        left: scrollLeft + offset,
        behavior: 'smooth'
      });
    }
  };

  const activeItemData = items.find(i => i.id === activeId) || items[0];

  return (
    <div className="w-full max-w-2xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text)]">Refrigerantes & Consumibles</h3>
          <p className="text-[10px] text-[var(--color-text-muted)]">Elige el tipo de gas o repuesto para tu orden de mantenimiento técnico.</p>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="w-7 h-7 border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] rounded-lg flex items-center justify-center text-[var(--color-text-muted)] cursor-pointer transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="w-7 h-7 border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] rounded-lg flex items-center justify-center text-[var(--color-text-muted)] cursor-pointer transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Contenedor del Carrusel — py-4 para blindar contra clipping visual */}
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-none snap-x py-4 w-full"
      >
        {items.map((it) => {
          const isActive = it.id === activeId;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => handleSelect(it.id)}
              className={`w-48 shrink-0 snap-start p-4 rounded-xl border-2 transition-all duration-300 text-left flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-md ${
                isActive
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-2)]/10 hover:border-[var(--color-primary)]/30'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: it.color }}
                  />
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-[var(--color-text-muted)]">
                    {it.type}
                  </span>
                </div>
                <span className={`text-[11px] font-extrabold block ${
                  isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
                }`}>
                  {it.name}
                </span>
              </div>

              <div className="mt-3 pt-2 border-t border-[var(--color-border)] flex justify-between items-center text-[9px] text-[var(--color-text-muted)] w-full">
                <span>Presión Trabajo:</span>
                <span className="font-mono font-bold text-[var(--color-text)]">{it.pressurePsi}</span>
              </div>
            </button>
          );
        })}
      </div>

      {activeItemData && (
        <div className="mt-2 p-3.5 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl flex items-start gap-2.5 text-xs">
          <HelpCircle size={14} className="shrink-0 text-[var(--color-primary)] mt-0.5" />
          <div>
            <span className="text-[10px] font-bold text-[var(--color-text)] block mb-0.5">
              Especificación de carga
            </span>
            <p className="text-[9px] text-[var(--color-text-muted)] leading-relaxed">
              {activeItemData.desc} Presión de recarga recomendada: <strong>{activeItemData.pressurePsi}</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SelectorRefrigeranteRepuestosSandbox() {
  const [selected, setSelected] = useState(null);

  return (
    <SandboxLayout
      title="Carrusel de Gases y Consumibles"
      description="Carrusel horizontal deslizable con py-4 anti-clipping para recambios de climatización HVAC."
      controls={[]}
    >
      <div className="py-6 flex flex-col items-center justify-center w-full">
        <SelectorRefrigeranteRepuestos
          onChange={setSelected}
        />
      </div>
    </SandboxLayout>
  );
}
