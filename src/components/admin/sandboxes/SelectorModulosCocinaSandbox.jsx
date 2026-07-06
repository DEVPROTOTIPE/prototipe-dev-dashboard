import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { LayoutGrid, Trash2 } from 'lucide-react';

function SelectorModulosCocina() {
  const { alertConfirm } = useAlertConfirm();
  const [kitchenUnits, setKitchenUnits] = useState([]);

  const modulosDisponibles = [
    { id: 'base_2p', name: 'Modulo Bajo 2 Puertas (80cm)', precio: 320000, tipo: 'Bajo' },
    { id: 'base_cajones', name: 'Cajonera Baja 3 Cajones (60cm)', precio: 450000, tipo: 'Bajo' },
    { id: 'alto_2p', name: 'Modulo Alto 2 Puertas (80cm)', precio: 280000, tipo: 'Alto' },
    { id: 'torre_hornos', name: 'Torre Despensa Porta-Hornos', precio: 850000, tipo: 'Torre' }
  ];

  const addUnit = (unit) => {
    setKitchenUnits([...kitchenUnits, { ...unit, tempId: Date.now() + Math.random() }]);
  };

  const removeUnit = (tempId) => {
    setKitchenUnits(kitchenUnits.filter(u => u.tempId !== tempId));
  };

  const totalPresupuesto = kitchenUnits.reduce((sum, u) => sum + u.precio, 0);

  const handleClear = async () => {
    if (kitchenUnits.length === 0) return;
    const confirm = await alertConfirm({
      title: 'Limpiar Configuración',
      message: '¿Deseas eliminar todos los módulos añadidos al diseño?',
      variant: 'error'
    });

    if (confirm) {
      setKitchenUnits([]);
    }
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-2xl mx-auto shadow-xl">
        <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Diseñador de Modular</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Añade módulos para armar y cotizar la cocina</p>
          </div>
          <LayoutGrid className="w-5 h-5 text-indigo-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Módulos Disponibles */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Módulos del Catálogo</span>
            <div className="flex flex-col gap-1.5">
              {modulosDisponibles.map((m) => (
                <div
                  key={m.id}
                  onClick={() => addUnit(m)}
                  className="p-3 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl flex justify-between items-center cursor-pointer hover:border-indigo-500/30 transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-[var(--color-text)]">{m.name}</span>
                    <span className="text-[9px] text-[var(--color-text-muted)]">Tipo: {m.tipo}</span>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-400 shrink-0">+${m.precio.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Diseño actual */}
          <div className="flex flex-col gap-2 border-t md:border-t-0 md:border-l border-[var(--color-border)] pt-4 md:pt-0 md:pl-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Diseño ({kitchenUnits.length} mod.)</span>
              {kitchenUnits.length > 0 && (
                <button onClick={handleClear} className="text-red-400 hover:text-red-500 text-[10px] font-bold flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" />
                  Vaciar Todo
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {kitchenUnits.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--color-text-muted)] italic">
                  Tu cocina está vacía. Haz clic en un módulo de la izquierda para agregarlo al diseño.
                </div>
              ) : (
                kitchenUnits.map((u) => (
                  <div key={u.tempId} className="p-2.5 bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-xl flex justify-between items-center text-xs text-[var(--color-text)]">
                    <span className="font-semibold">{u.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-indigo-400">${u.precio.toLocaleString()}</span>
                      <button onClick={() => removeUnit(u.tempId)} className="text-[var(--color-text-muted)] hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPresupuesto > 0 && (
              <div className="border-t border-[var(--color-border)] pt-3.5 mt-2 flex justify-between items-center text-sm font-bold text-[var(--color-text)]">
                <span>Total Cocina</span>
                <span className="text-indigo-400 text-base">${totalPresupuesto.toLocaleString()} COP</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function SelectorModulosCocinaSandbox() {
  return (
    <SandboxLayout
      title="Selector de Módulos de Cocina"
      description="Planificador interactivo de distribución y presupuesto de cocinas modulares."
    >
      <SelectorModulosCocina />
    </SandboxLayout>
  );
}
