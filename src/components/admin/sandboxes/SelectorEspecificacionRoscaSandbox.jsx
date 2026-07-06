import React, { useState, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Compass, HelpCircle } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

// Recreación inline del componente
function SelectorEspecificacionRosca({
  selectedRosca = null,
  onChange = null,
  threadSystems = [
    { value: 'metrica', label: 'Rosca Métrica ISO (M)' },
    { value: 'whitworth', label: 'Rosca Whitworth BSP (G)' },
    { value: 'npt', label: 'Rosca Cónica NPT' }
  ],
  threadsData = {
    metrica: [
      { value: 'm3', label: 'M3 x 0.50 mm', drillMm: 2.5, pitch: 0.5 },
      { value: 'm4', label: 'M4 x 0.70 mm', drillMm: 3.3, pitch: 0.7 },
      { value: 'm5', label: 'M5 x 0.80 mm', drillMm: 4.2, pitch: 0.8 },
      { value: 'm6', label: 'M6 x 1.00 mm', drillMm: 5.0, pitch: 1.0 },
      { value: 'm8', label: 'M8 x 1.25 mm', drillMm: 6.8, pitch: 1.25 },
      { value: 'm10', label: 'M10 x 1.50 mm', drillMm: 8.5, pitch: 1.5 },
      { value: 'm12', label: 'M12 x 1.75 mm', drillMm: 10.2, pitch: 1.75 }
    ],
    whitworth: [
      { value: 'g1_8', label: 'G 1/8" - 28 hilos', drillMm: 8.8, pitch: 0.907 },
      { value: 'g1_4', label: 'G 1/4" - 19 hilos', drillMm: 11.8, pitch: 1.337 },
      { value: 'g3_8', label: 'G 3/8" - 19 hilos', drillMm: 15.2, pitch: 1.337 },
      { value: 'g1_2', label: 'G 1/2" - 14 hilos', drillMm: 19.0, pitch: 1.814 }
    ],
    npt: [
      { value: 'npt1_8', label: '1/8" NPT - 27 hilos', drillMm: 8.4, pitch: 0.94 },
      { value: 'npt1_4', label: '1/4" NPT - 18 hilos', drillMm: 11.2, pitch: 1.41 },
      { value: 'npt3_8', label: '3/8" NPT - 18 hilos', drillMm: 14.5, pitch: 1.41 },
      { value: 'npt1_2', label: '1/2" NPT - 14 hilos', drillMm: 17.8, pitch: 1.81 }
    ]
  }
}) {
  const [system, setSystem] = useState(threadSystems[0].value);
  const [threadSize, setThreadSize] = useState(threadsData[threadSystems[0].value][0].value);

  const availableSizes = useMemo(() => {
    return threadsData[system] || [];
  }, [system, threadsData]);

  const activeThread = useMemo(() => {
    return availableSizes.find(t => t.value === threadSize) || availableSizes[0];
  }, [threadSize, availableSizes]);

  const handleSystemChange = (newSystem) => {
    setSystem(newSystem);
    const newSizes = threadsData[newSystem] || [];
    if (newSizes.length > 0) {
      setThreadSize(newSizes[0].value);
      if (onChange) {
        onChange({ system: newSystem, thread: newSizes[0] });
      }
    }
  };

  const handleSizeChange = (newSize) => {
    setThreadSize(newSize);
    const thread = availableSizes.find(t => t.value === newSize);
    if (onChange && thread) {
      onChange({ system, thread });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
        <Compass size={16} className="text-[var(--color-primary)]" />
        <span>Especificación de Roscado</span>
      </h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Selecciona la norma técnica y el paso de rosca para el cilindrado de tu pieza mecanizada.
      </p>

      <div className="space-y-4">
        {/* Sistema de Rosca */}
        <div>
          <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">
            Norma / Sistema de Roscas
          </label>
          <CustomSelect
            value={system}
            onChange={handleSystemChange}
            options={threadSystems}
          />
        </div>

        {/* Diámetro y Paso */}
        <div>
          <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">
            Medida Nominal & Paso
          </label>
          <CustomSelect
            value={threadSize}
            onChange={handleSizeChange}
            options={availableSizes}
          />
        </div>

        {/* Bloque de Información de Taller */}
        {activeThread && (
          <div className="mt-4 p-4 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl space-y-2.5">
            <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider block">
              Datos Técnicos de Tornería
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] text-[var(--color-text-muted)] block">Diámetro Broca Previo:</span>
                <span className="font-mono text-sm font-extrabold text-[var(--color-primary)]">
                  Ø {activeThread.drillMm.toFixed(1)} mm
                </span>
              </div>
              <div>
                <span className="text-[9px] text-[var(--color-text-muted)] block">Paso de Rosca (Pitch):</span>
                <span className="font-mono text-sm font-extrabold text-[var(--color-text)]">
                  {activeThread.pitch.toFixed(3)} mm
                </span>
              </div>
            </div>

            <div className="border-t border-[var(--color-border)] pt-2 text-[9px] text-[var(--color-text-muted)] flex items-start gap-1.5">
              <HelpCircle size={12} className="shrink-0 text-[var(--color-primary)] mt-0.5" />
              <span>
                Utiliza una broca de Ø {activeThread.drillMm.toFixed(1)} mm en el taladro/torno antes de proceder a pasar el macho de roscar.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SelectorEspecificacionRoscaSandbox() {
  const [selected, setSelected] = useState(null);

  return (
    <SandboxLayout
      title="Selector de Roscas Normalizadas"
      description="Dropdowns interactivos para parametrizar roscas cilíndricas y cónicas de taller."
      controls={[]}
    >
      <div className="py-6 flex flex-col items-center justify-center w-full">
        <SelectorEspecificacionRosca
          onChange={setSelected}
        />
        {selected && (
          <div className="mt-4 p-3 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-xl text-xs">
            Especificación seleccionada: <strong>{selected.thread.label}</strong> en norma <strong>{selected.system.toUpperCase()}</strong>.
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
