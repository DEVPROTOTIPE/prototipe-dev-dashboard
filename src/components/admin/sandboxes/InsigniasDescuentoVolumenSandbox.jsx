import React, { useState, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente real inline para el Sandbox
function InsigniasDescuentoVolumen({
  rules,
  currentQuantity,
  basePrice
}) {
  const sortedRules = useMemo(() => {
    return [...rules].sort((a, b) => a.quantity - b.quantity);
  }, [rules]);

  const activeRule = useMemo(() => {
    let active = sortedRules[0];
    sortedRules.forEach(r => {
      if (currentQuantity >= r.quantity) {
        active = r;
      }
    });
    return active;
  }, [sortedRules, currentQuantity]);

  const nextRule = useMemo(() => {
    return sortedRules.find(r => r.quantity > currentQuantity) || null;
  }, [sortedRules, currentQuantity]);

  const calculatedPrices = useMemo(() => {
    const discountFactor = 1 - (activeRule.discountPercentage / 100);
    const unitPrice = Math.round(basePrice * discountFactor);
    const totalPrice = unitPrice * currentQuantity;

    return {
      unitPrice,
      totalPrice,
      saving: (basePrice - unitPrice) * currentQuantity
    };
  }, [activeRule, currentQuantity, basePrice]);

  const progressPercent = useMemo(() => {
    if (!nextRule) return 100;
    const currentTierQty = activeRule.quantity;
    const nextTierQty = nextRule.quantity;
    const progress = ((currentQuantity - currentTierQty) / (nextTierQty - currentTierQty)) * 100;
    return Math.max(0, Math.min(100, Math.round(progress)));
  }, [activeRule, nextRule, currentQuantity]);

  return (
    <div 
      id="insignias-descuento-volumen-container"
      className="w-full max-w-sm p-5 rounded-2xl bg-[var(--color-surface)]/20 border border-[var(--color-border)] text-[var(--color-text)] shadow-xl backdrop-blur-xl animate-fade-in"
    >
      <div className="mb-4">
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400">Escala de Precios</span>
        <h3 className="text-sm font-bold text-[var(--color-text)] mt-0.5">Descuentos por Cantidad</h3>
      </div>

      {/* Grid de Reglas */}
      <div className="grid grid-cols-3 gap-2.5 mb-4" id="rules-grid">
        {sortedRules.map(r => {
          const isActive = activeRule.quantity === r.quantity;
          return (
            <div
              key={r.quantity}
              className={`p-2.5 rounded-xl border text-center flex flex-col justify-between transition-all duration-350 ${
                isActive
                  ? 'bg-indigo-650/10 border-indigo-500 shadow-md shadow-indigo-650/5'
                  : 'bg-[var(--color-surface-2)]/40 border-[var(--color-border)] opacity-70'
              }`}
            >
              <div>
                <span className="text-[10px] font-black text-[var(--color-text)] block">x{r.quantity}+ uds.</span>
                <span className="text-[9px] text-[var(--color-text-muted)] block mt-0.5 leading-tight">{r.label}</span>
              </div>
              <span className={`text-[10px] font-black block mt-2.5 ${r.discountPercentage > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-[var(--color-text)]'}`}>
                {r.discountPercentage > 0 ? `${r.discountPercentage}% OFF` : 'Precio base'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Barra de Progreso */}
      {nextRule && (
        <div className="space-y-1.5 mb-4" id="tier-progress-bar-wrapper">
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)]">
            <span>Faltan {nextRule.quantity - currentQuantity} unidades para el {nextRule.discountPercentage}% OFF</span>
            <span className="font-bold">{progressPercent}%</span>
          </div>
          <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border)]/40">
            <div 
              className="h-full bg-indigo-650 transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Resumen de Compra */}
      <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)]/65 p-3.5 rounded-xl flex flex-col gap-2">
        <div className="flex justify-between text-xs">
          <span className="text-[var(--color-text-muted)]">Precio unitario:</span>
          <span className="font-bold text-[var(--color-text)]">
            ${calculatedPrices.unitPrice.toLocaleString()} COP
          </span>
        </div>
        <div className="flex justify-between items-baseline border-t border-[var(--color-border)]/20 pt-2">
          <span className="text-xs font-semibold text-[var(--color-text-muted)]">Total ({currentQuantity} uds):</span>
          <span className="text-lg font-black text-indigo-500 dark:text-indigo-400">
            ${calculatedPrices.totalPrice.toLocaleString()} COP
          </span>
        </div>
        {calculatedPrices.saving > 0 && (
          <div className="mt-1 text-[10px] text-emerald-500 dark:text-emerald-400 font-bold text-center bg-emerald-500/5 border border-emerald-500/10 py-1 rounded-lg">
            ¡Ahorras ${calculatedPrices.saving.toLocaleString()} COP en esta compra!
          </div>
        )}
      </div>
    </div>
  );
}

const RULES_MOCK = [
  { quantity: 1, discountPercentage: 0, label: 'Precio Regular' },
  { quantity: 3, discountPercentage: 10, label: 'Pack Mayorista' },
  { quantity: 6, discountPercentage: 20, label: 'Lote Distribuidor' }
];

export default function InsigniasDescuentoVolumenSandbox() {
  const [qty, setQty] = useState(1);

  const controls = [
    {
      label: 'Cantidad a simular: x1',
      type: 'toggle',
      value: qty === 4,
      onChange: (val) => setQty(val ? 4 : 2),
      labels: ['Simular 4 unidades (10% OFF)', 'Simular 2 unidades (Regular)']
    }
  ];

  return (
    <SandboxLayout
      title="Insignias de Descuento por Volumen"
      description="Visualizador de escalas de precios al por mayor, totalización interactiva y barra de progreso de metas de ahorro."
      controls={controls}
    >
      <div className="flex flex-col items-center justify-center p-2 w-80">
        <InsigniasDescuentoVolumen
          rules={RULES_MOCK}
          currentQuantity={qty}
          basePrice={85000}
        />
        
        {/* Controles rápidos de cantidad */}
        <div className="flex gap-3 items-center justify-center mt-4">
          <button
            type="button"
            onClick={() => setQty(prev => Math.max(1, prev - 1))}
            className="w-8 h-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] font-bold text-[var(--color-text)] flex items-center justify-center hover:bg-[var(--color-surface)] transition-all cursor-pointer shadow-sm active:scale-95"
          >
            -
          </button>
          <span className="text-xs font-black text-[var(--color-text)] w-8 text-center select-none">{qty} uds</span>
          <button
            type="button"
            onClick={() => setQty(prev => Math.min(10, prev + 1))}
            className="w-8 h-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] font-bold text-[var(--color-text)] flex items-center justify-center hover:bg-[var(--color-surface)] transition-all cursor-pointer shadow-sm active:scale-95"
          >
            +
          </button>
        </div>
      </div>
    </SandboxLayout>
  );
}
