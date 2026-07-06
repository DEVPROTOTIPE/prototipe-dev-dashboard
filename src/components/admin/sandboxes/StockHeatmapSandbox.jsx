import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

function SandboxStockHeatmap({ stock, threshold = 5, showLabel = true, variant = 'badge' }) {
  const getStatus = () => {
    if (stock <= 0) {
      return {
        label: 'Agotado',
        colorClass: 'bg-slate-800/80 text-slate-400 border-slate-700/30',
        dotClass: 'bg-slate-500'
      };
    }
    if (stock < threshold) {
      return {
        label: `¡Solo quedan ${stock} u!`,
        colorClass: 'bg-red-500/10 text-red-400 border-red-500/25 animate-pulse',
        dotClass: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
      };
    }
    if (stock <= threshold * 2) {
      return {
        label: 'Pocas unidades',
        colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        dotClass: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
      };
    }
    return {
      label: 'Disponible',
      colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
    };
  };

  const status = getStatus();

  if (variant === 'dot') {
    return (
      <div className="flex items-center gap-1.5" title={`${status.label} (${stock} unidades)`}>
        <span className={`w-2 h-2 rounded-full transition-all ${status.dotClass}`} />
        {showLabel && <span className="text-[10px] font-bold text-[var(--color-text-muted)]">{status.label}</span>}
      </div>
    );
  }

  return (
    <div className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-all ${status.colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
      {showLabel && <span>{status.label}</span>}
    </div>
  );
}

export default function StockHeatmapSandbox() {
  const [stock, setStock] = useState(3);
  const [threshold, setThreshold] = useState(5);
  const [showLabel, setShowLabel] = useState(true);
  const [variant, setVariant] = useState('badge');

  return (
    <SandboxLayout
      title="StockHeatmap"
      description="Semáforo visual de stock. Modifica las unidades en los controles para ver los cambios de color y animación."
      controls={[
        { label: 'Unidades Stock', type: 'number', value: stock, onChange: v => setStock(Math.max(0, Number(v))) },
        { label: 'Umbral Crítico', type: 'number', value: threshold, onChange: v => setThreshold(Math.max(1, Number(v))) },
        { label: 'Mostrar texto', type: 'toggle', value: showLabel, onChange: setShowLabel },
        { label: 'Variante', type: 'select', value: variant, options: ['badge', 'dot'], onChange: setVariant },
      ]}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="p-6 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl flex flex-col items-center gap-3 w-full">
          <span className="text-3xl">{stock === 0 ? '📦 ❌' : '📦'}</span>
          <SandboxStockHeatmap
            stock={stock}
            threshold={threshold}
            showLabel={showLabel}
            variant={variant}
          />
        </div>
        <p className="text-[10px] text-slate-500 font-mono">
          stock: {stock} | threshold: {threshold}
        </p>
      </div>
    </SandboxLayout>
  );
}
