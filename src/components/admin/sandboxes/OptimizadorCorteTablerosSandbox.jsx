import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { LayoutGrid, AlertTriangle } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

function OptimizadorCorteTableros() {
  const { alertConfirm } = useAlertConfirm();
  const [boardType, setBoardType] = useState('std');
  const [anchoPieza, setAnchoPieza] = useState(600);
  const [altoPieza, setAltoPieza] = useState(400);
  const [cantidad, setCantidad] = useState(6);

  const BOARDS = {
    std: { label: 'Tablero Estándar (2.44m x 1.83m)', w: 2440, h: 1830 },
    oversize: { label: 'Tablero Grande (2.75m x 1.83m)', w: 2750, h: 1830 }
  };

  const activeBoard = BOARDS[boardType];

  const calculated = React.useMemo(() => {
    const boardArea = activeBoard.w * activeBoard.h;
    const pieceArea = anchoPieza * altoPieza;
    const cols = Math.floor(activeBoard.w / anchoPieza);
    const rows = Math.floor(activeBoard.h / altoPieza);
    const maxFits = cols * rows;

    const actualQty = Math.min(cantidad, maxFits);
    const actualAreaUsed = actualQty * pieceArea;
    const mermaPct = Math.max(0, Math.round(((boardArea - actualAreaUsed) / boardArea) * 100));

    return {
      cols,
      rows,
      maxFits,
      actualQty,
      mermaPct,
      insuficiente: cantidad > maxFits
    };
  }, [boardType, anchoPieza, altoPieza, cantidad]);

  const handleOptimize = () => {
    alertConfirm({
      title: 'Optimización Completa',
      message: 'Se generó el plano de corte. Se acomodaron ' + calculated.actualQty + ' piezas con un desperdicio del ' + calculated.mermaPct + '%.',
      variant: 'success'
    });
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
        <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Cálculo de Despiece</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Acomodación de piezas 2D sobre placas de MDF/Melamina</p>
          </div>
          <LayoutGrid className="w-5 h-5 text-indigo-400" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--color-text-muted)]">Tamaño del Tablero</label>
          <CustomSelect
            value={boardType}
            onChange={setBoardType}
            options={[
              { value: 'std', label: 'Tablero Estándar (2.44m x 1.83m)' },
              { value: 'oversize', label: 'Tablero Grande (2.75m x 1.83m)' }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Ancho Pieza (mm)</label>
            <input
              type="number"
              value={anchoPieza}
              onChange={(e) => setAnchoPieza(Math.max(100, parseInt(e.target.value) || 100))}
              className="w-full px-3 py-1.5 bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl text-xs focus:border-indigo-500/40 focus:outline-none text-[var(--color-text)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Alto Pieza (mm)</label>
            <input
              type="number"
              value={altoPieza}
              onChange={(e) => setAltoPieza(Math.max(100, parseInt(e.target.value) || 100))}
              className="w-full px-3 py-1.5 bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl text-xs focus:border-indigo-500/40 focus:outline-none text-[var(--color-text)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Cantidad Piezas</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-1.5 bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl text-xs focus:border-indigo-500/40 focus:outline-none text-[var(--color-text)]"
            />
          </div>
        </div>

        {/* Warning if too many */}
        {calculated.insuficiente && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-amber-400 text-[10px]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">Capacidad de Tablero Superada</span>
              <span className="text-[var(--color-text-muted)]">
                Solo caben {calculated.maxFits} piezas en un solo tablero. Necesitarás placas adicionales.
              </span>
            </div>
          </div>
        )}

        {/* Visual Map */}
        <div className="flex flex-col gap-2">
          <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-bold">Esquema del Tablero (Acomodación sugerida)</span>
          <div className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] aspect-[4/3] rounded-2xl p-4 flex items-center justify-center">
            <div className="w-full h-full bg-[var(--color-surface-3)]/20 rounded border border-dashed border-[var(--color-border)] grid grid-cols-4 grid-rows-3 gap-1 p-2">
              {Array.from({ length: calculated.actualQty }).map((_, idx) => (
                <div key={idx} className="bg-indigo-500/20 border border-indigo-500/40 rounded flex items-center justify-center text-[10px] font-bold text-indigo-300">
                  P{idx + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-xl p-4 flex justify-between items-center text-xs text-[var(--color-text)]">
          <div>
            <span className="text-[var(--color-text-muted)] block">Merma Estimada</span>
            <span className="text-sm font-bold text-indigo-400">{calculated.mermaPct}%</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)] block">Piezas en Placa</span>
            <span className="text-sm font-bold text-[var(--color-text)]">{calculated.actualQty} / {calculated.maxFits}</span>
          </div>
        </div>

        <button
          onClick={handleOptimize}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text)] font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
        >
          Generar Archivo de Corte
        </button>
      </div>
    </>
  );
}

export default function OptimizadorCorteTablerosSandbox() {
  return (
    <SandboxLayout
      title="Optimizador de Corte de Tableros"
      description="Visualizador de corte de madera para estimar merma de material."
    >
      <OptimizadorCorteTableros />
    </SandboxLayout>
  );
}
