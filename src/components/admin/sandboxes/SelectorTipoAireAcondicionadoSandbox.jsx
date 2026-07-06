import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Layers, Wind, CheckCircle, Home, Monitor } from 'lucide-react';

// Recreación inline del componente
function SelectorTipoAireAcondicionado({
  selectedType = '',
  onChange = null,
  options = [
    {
      id: 'minisplit',
      name: 'Mini-Split Residencial',
      desc: 'Ideal para habitaciones individuales u oficinas pequeñas sin conductos.',
      advantages: 'Bajo nivel de ruido, instalación rápida en pared.',
      icon: Wind
    },
    {
      id: 'cassette',
      name: 'Unidad de Cassette',
      desc: 'Instalación en falso techo que distribuye el aire a 4 direcciones.',
      advantages: 'Estética discreta, ideal para salones u oficinas amplias.',
      icon: Layers
    },
    {
      id: 'ductless',
      name: 'Equipo Central por Ductos',
      desc: 'Distribución centralizada mediante conductos ocultos en el cielo raso.',
      advantages: 'Climatización homogénea de múltiples habitaciones.',
      icon: Home
    },
    {
      id: 'vfv',
      name: 'Sistema Variable VRF',
      desc: 'Alta ingeniería con compresores multi-inverter para grandes consumos.',
      advantages: 'Zonificación independiente, máximo ahorro energético.',
      icon: Monitor
    }
  ]
}) {
  const [activeId, setActiveId] = useState(selectedType || options[0].id);

  const handleSelect = (id) => {
    setActiveId(id);
    if (onChange) {
      onChange(id);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[var(--color-text)]">Tipo de Sistema Evaporador</h3>
        <p className="text-[10px] text-[var(--color-text-muted)]">Elige el formato físico del aire acondicionado para tu espacio.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = opt.id === activeId;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 text-left flex flex-col justify-between relative cursor-pointer group ${
                isActive
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-2)]/10 hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-2)]/25'
              }`}
            >
              <div className="flex justify-between items-center w-full mb-3">
                <div className={`p-2 rounded-lg ${
                  isActive ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                }`}>
                  <Icon size={16} />
                </div>
                {isActive && (
                  <CheckCircle size={16} className="text-[var(--color-primary)]" />
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-extrabold text-[var(--color-text)] block group-hover:text-[var(--color-primary)] transition-colors">
                  {opt.name}
                </span>
                <p className="text-[9px] text-[var(--color-text-muted)] leading-relaxed">
                  {opt.desc}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[var(--color-border)] w-full">
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-[var(--color-text-muted)] block">
                  Ventaja Clave
                </span>
                <span className={`text-[9px] font-bold ${
                  isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
                }`}>
                  {opt.advantages}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SelectorTipoAireAcondicionadoSandbox() {
  const [selected, setSelected] = useState('minisplit');

  return (
    <SandboxLayout
      title="Selector de Formato de Aire Acondicionado"
      description="Cuadrícula interactiva premium para seleccionar tipos de evaporadoras HVAC residenciales y comerciales."
      controls={[]}
    >
      <div className="py-6 flex flex-col items-center justify-center w-full">
        <SelectorTipoAireAcondicionado
          selectedType={selected}
          onChange={setSelected}
        />
      </div>
    </SandboxLayout>
  );
}
