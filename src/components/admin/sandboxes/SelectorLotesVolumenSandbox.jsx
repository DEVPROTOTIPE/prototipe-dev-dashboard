import React, { useState, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Layers, Sparkles, Check, ArrowRight } from 'lucide-react';

// Recreación inline del componente
function SelectorLotesVolumen({
  quantity = 1,
  onChange = null,
  tiers = [
    { min: 1, max: 9, priceUnit: 120.00, label: 'Prototipo Inicial' },
    { min: 10, max: 49, priceUnit: 98.00, label: 'Lote Pequeño' },
    { min: 50, max: 199, priceUnit: 75.00, label: 'Lote de Producción' },
    { min: 200, max: null, priceUnit: 58.00, label: 'Producción en Serie' }
  ]
}) {
  const [qty, setQty] = useState(quantity);

  const activeTierIndex = useMemo(() => {
    return tiers.findIndex(t => {
      if (t.max === null) return qty >= t.min;
      return qty >= t.min && qty <= t.max;
    });
  }, [qty, tiers]);

  const activeTier = useMemo(() => {
    return tiers[activeTierIndex] || tiers[0];
  }, [activeTierIndex, tiers]);

  const savingsInfo = useMemo(() => {
    const nextTier = tiers[activeTierIndex + 1];
    if (!nextTier) return null;

    const qtyToNext = nextTier.min - qty;
    const currentCost = qty * activeTier.priceUnit;
    const nextTierCost = nextTier.min * nextTier.priceUnit;
    const isNextCheaper = nextTierCost < currentCost;

    return {
      qtyToNext,
      nextMin: nextTier.min,
      nextPrice: nextTier.priceUnit.toFixed(2),
      isNextCheaper,
      savings: (currentCost - nextTierCost).toFixed(2)
    };
  }, [qty, activeTierIndex, activeTier, tiers]);

  const handleQtyChange = (val) => {
    const newQty = Math.max(1, parseInt(val) || 1);
    setQty(newQty);
    if (onChange) {
      onChange(newQty);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text)]">Descuento por Lotes de Fabricación</h3>
          <p className="text-[10px] text-[var(--color-text-muted)]">A mayor cantidad de piezas mecanizadas, menor costo unitario.</p>
        </div>
      </div>

      {/* Input de Cantidad */}
      <div className="mb-4">
        <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">Cantidad de Piezas a Mecanizar</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={qty}
            onChange={(e) => handleQtyChange(e.target.value)}
            className="w-32 h-10 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-sm font-mono text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
            min="1"
          />
          <span className="text-xs text-[var(--color-text-muted)]">
            Costo unitario actual: <strong className="text-[var(--color-primary)] font-mono">${activeTier.priceUnit.toFixed(2)} USD</strong>
          </span>
        </div>
      </div>

      {/* Tiers de Volumen */}
      <div className="space-y-2 mb-4">
        {tiers.map((tier, index) => {
          const isActive = index === activeTierIndex;
          return (
            <div
              key={index}
              className={`p-3.5 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
                isActive
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-2)]/10 hover:border-[var(--color-primary)]/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                  isActive ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                }`}>
                  {isActive ? <Check size={12} /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--color-text)] block">
                    {tier.label}
                  </span>
                  <span className="text-[9px] text-[var(--color-text-muted)]">
                    Rango: {tier.min}{tier.max ? ` a ${tier.max}` : '+'} piezas
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-black text-[var(--color-text)] block">
                  ${tier.priceUnit.toFixed(2)}
                </span>
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-[var(--color-text-muted)]">
                  Costo Unitario
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sugerencias de Escalado */}
      {savingsInfo && (
        <div className={`p-3 border rounded-xl flex items-start gap-2.5 text-[11px] ${
          savingsInfo.isNextCheaper
            ? 'bg-green-500/10 border-green-500/20 text-green-600'
            : 'bg-[var(--color-surface-2)]/40 border-[var(--color-border)] text-[var(--color-text-muted)]'
        }`}>
          <Sparkles size={14} className="shrink-0 mt-0.5 text-[var(--color-primary)]" />
          <div>
            {savingsInfo.isNextCheaper ? (
              <span>
                <strong>¡Tip de Ahorro!</strong> Si agregas <strong>{savingsInfo.qtyToNext}</strong> piezas más, pasarás al lote de {savingsInfo.nextMin} piezas y el total del pedido será más económico. Ahorrarías <strong>${savingsInfo.savings} USD</strong>.
              </span>
            ) : (
              <span>
                Agrega <strong>{savingsInfo.qtyToNext}</strong> piezas más para obtener una tarifa de <strong>${savingsInfo.nextPrice} USD</strong> por unidad.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SelectorLotesVolumenSandbox() {
  const [qty, setQty] = useState(1);

  return (
    <SandboxLayout
      title="Tabla de Precios por Volumen"
      description="Selector interactivo de volumen que resalta los tiers de descuento y advierte oportunidades de compra cruzada."
      controls={[]}
    >
      <div className="py-6 flex flex-col items-center justify-center w-full">
        <SelectorLotesVolumen
          quantity={qty}
          onChange={setQty}
        />
      </div>
    </SandboxLayout>
  );
}
