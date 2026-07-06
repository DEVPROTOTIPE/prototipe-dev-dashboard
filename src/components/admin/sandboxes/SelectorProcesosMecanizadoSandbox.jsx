import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Cpu, Scissors, Wrench, Layers, Compass, CheckCircle2 } from 'lucide-react';

// Recreación inline del componente
function SelectorProcesosMecanizado({
  selectedProcesos = [],
  onChange = null,
  procesos = [
    { id: 'torneado', name: 'Torneado', desc: 'Mecanizado de piezas cilíndricas en torno', icon: Compass },
    { id: 'fresado', name: 'Fresado / CNC', desc: 'Corte tridimensional con fresas de carburo', icon: Cpu },
    { id: 'rectificado', name: 'Rectificado', desc: 'Acabado de alta precisión en plano o cilindros', icon: Wrench },
    { id: 'electroerosion', name: 'Electroerosión', desc: 'Corte por hilo de metal de alta dureza', icon: Scissors },
    { id: 'soldadura', name: 'Soldadura / Ensamble', desc: 'Unión de piezas y estructuras metálicas', icon: Layers }
  ]
}) {
  const [selectedIds, setSelectedIds] = useState(selectedProcesos);

  const toggleProceso = (id) => {
    const isSelected = selectedIds.includes(id);
    let updatedList = [];
    if (isSelected) {
      updatedList = selectedIds.filter(item => item !== id);
    } else {
      updatedList = [...selectedIds, id];
    }
    setSelectedIds(updatedList);
    if (onChange) {
      onChange(updatedList);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-[var(--color-text)] mb-1.5">
        Procesos de Fabricación
      </h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Selecciona uno o más procesos necesarios para mecanizar la pieza de acuerdo a tu plano técnico.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {procesos.map((proceso) => {
          const Icon = proceso.icon;
          const isSelected = selectedIds.includes(proceso.id);
          
          return (
            <div
              key={proceso.id}
              onClick={() => toggleProceso(proceso.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 relative cursor-pointer group flex flex-col justify-between h-32 select-none ${
                isSelected
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-2)]/30 hover:border-[var(--color-primary)]/40 hover:-translate-y-1 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg transition-colors ${
                  isSelected 
                    ? 'bg-[var(--color-primary)] text-white' 
                    : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]'
                }`}>
                  <Icon size={18} />
                </div>
                {isSelected && (
                  <CheckCircle2 size={16} className="text-[var(--color-primary)] shrink-0" />
                )}
              </div>

              <div>
                <span className="text-xs font-bold text-[var(--color-text)] block mb-0.5">
                  {proceso.name}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] line-clamp-2 leading-tight">
                  {proceso.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SelectorProcesosMecanizadoSandbox() {
  const [selectedList, setSelectedList] = useState([]);

  return (
    <SandboxLayout
      title="Selector de Procesos"
      description="Selector interactivo en cuadrícula para indicar las operaciones físicas requeridas."
      controls={[]}
    >
      <div className="py-6 flex flex-col items-center justify-center w-full">
        <SelectorProcesosMecanizado
          onChange={setSelectedList}
        />
        {selectedList.length > 0 && (
          <div className="mt-4 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] flex flex-wrap gap-2 items-center">
            <span className="font-bold text-[var(--color-text-muted)]">Ruta de producción:</span>
            {selectedList.map((id, index) => (
              <span key={id} className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold capitalize">
                {index + 1}. {id}
              </span>
            ))}
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
