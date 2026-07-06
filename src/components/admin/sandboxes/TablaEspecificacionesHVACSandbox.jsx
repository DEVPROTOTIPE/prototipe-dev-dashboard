import React, { useState, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Settings, Info, ListFilter, Cpu } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

// Recreación inline del componente
function TablaEspecificacionesHVAC({
  selectedModel = '',
  onChange = null,
  filterOptions = [
    { value: 'all', label: 'Ver todas las capacidades' },
    { value: '9k', label: 'Capacidades 9,000 BTU' },
    { value: '12k', label: 'Capacidades 12,000 BTU' },
    { value: '18k', label: 'Capacidades 18,000 BTU' },
    { value: '24k', label: 'Capacidades 24,000 BTU' }
  ],
  specifications = [
    { id: 'c1', name: 'Compresor Rotary 9k R410A', capacity: '9,000 BTU', filterCap: '9k', rla: 4.1, lra: 22.0, gas: 'R410A', oil: 'POE (Synthetic)' },
    { id: 'c2', name: 'Compresor Inverter 9k R32', capacity: '9,500 BTU', filterCap: '9k', rla: 3.2, lra: 14.5, gas: 'R32', oil: 'POE (Synthetic)' },
    { id: 'c3', name: 'Compresor Rotary 12k R410A', capacity: '12,000 BTU', filterCap: '12k', rla: 5.6, lra: 29.0, gas: 'R410A', oil: 'POE (Synthetic)' },
    { id: 'c4', name: 'Compresor Inverter 12k R410A', capacity: '12,000 BTU', filterCap: '12k', rla: 4.4, lra: 18.0, gas: 'R410A', oil: 'POE (Synthetic)' },
    { id: 'c5', name: 'Compresor Scroll 18k R22', capacity: '18,000 BTU', filterCap: '18k', rla: 9.8, lra: 48.0, gas: 'R22', oil: 'Mineral Oil' },
    { id: 'c6', name: 'Compresor Inverter 18k R410A', capacity: '18,000 BTU', filterCap: '18k', rla: 6.8, lra: 26.0, gas: 'R410A', oil: 'POE (Synthetic)' },
    { id: 'c7', name: 'Compresor Scroll 24k R410A', capacity: '24,000 BTU', filterCap: '24k', rla: 11.2, lra: 58.0, gas: 'R410A', oil: 'POE (Synthetic)' },
    { id: 'c8', name: 'Compresor Inverter 24k R32', capacity: '24,000 BTU', filterCap: '24k', rla: 8.9, lra: 38.0, gas: 'R32', oil: 'POE (Synthetic)' }
  ]
}) {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(selectedModel);

  const filteredSpecs = useMemo(() => {
    if (filter === 'all') return specifications;
    return specifications.filter(s => s.filterCap === filter);
  }, [filter, specifications]);

  const handleRowClick = (item) => {
    setSelectedId(item.id);
    if (onChange) {
      onChange(item);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
            <Cpu size={16} className="text-[var(--color-primary)]" />
            <span>Especificaciones de Compresores HVAC</span>
          </h3>
          <p className="text-[10px] text-[var(--color-text-muted)]">Tabla comparativa de corriente, refrigerantes y lubricación.</p>
        </div>

        <div className="w-full sm:w-48 shrink-0">
          <CustomSelect
            value={filter}
            onChange={setFilter}
            options={filterOptions}
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto border border-[var(--color-border)] rounded-xl scrollbar-thin">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[var(--color-surface-2)]/50 border-b border-[var(--color-border)] text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              <th className="p-3">Modelo / Compresor</th>
              <th className="p-3 text-right">Capacidad</th>
              <th className="p-3 text-right">Amperaje Marcha (RLA)</th>
              <th className="p-3 text-right">Arranque (LRA)</th>
              <th className="p-3">Refrigerante</th>
              <th className="p-3">Aceite</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {filteredSpecs.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <tr
                  key={item.id}
                  onClick={() => handleRowClick(item)}
                  className={`hover:bg-[var(--color-primary)]/5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[var(--color-primary)]/10 font-bold' : ''
                  }`}
                >
                  <td className="p-3 font-semibold text-[var(--color-text)]">{item.name}</td>
                  <td className="p-3 text-right font-mono">{item.capacity}</td>
                  <td className="p-3 text-right font-mono text-[var(--color-primary)]">{item.rla.toFixed(1)} A</td>
                  <td className="p-3 text-right font-mono">{item.lra.toFixed(1)} A</td>
                  <td className="p-3 font-mono">{item.gas}</td>
                  <td className="p-3 text-[10px] text-[var(--color-text-muted)]">{item.oil}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3.5 flex items-start gap-1.5 text-[9px] text-[var(--color-text-muted)]">
        <Info size={12} className="shrink-0 text-[var(--color-primary)] mt-0.5" />
        <span>
          <strong>RLA:</strong> Rated Load Amps (Corriente nominal de marcha). <strong>LRA:</strong> Locked Rotor Amps (Corriente máxima de arranque con rotor bloqueado). Si el amperaje medido en sitio supera el RLA en más de un 15%, indica problemas mecánicos o desgaste.
        </span>
      </div>
    </div>
  );
}

export default function TablaEspecificacionesHVACSandbox() {
  const [selected, setSelected] = useState(null);

  return (
    <SandboxLayout
      title="Tabla Técnica Comparativa HVAC"
      description="Tabla comparativa con scroll horizontal, filtros dinámicos CustomSelect y tipografías monospaced."
      controls={[]}
    >
      <div className="py-6 flex flex-col items-center justify-center w-full">
        <TablaEspecificacionesHVAC
          onChange={setSelected}
        />
        {selected && (
          <div className="mt-4 p-3 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-xl text-xs">
            Seleccionado: <strong>{selected.name}</strong>. Refrigerante: <strong>{selected.gas}</strong> | RLA: <strong>{selected.rla} A</strong>.
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
