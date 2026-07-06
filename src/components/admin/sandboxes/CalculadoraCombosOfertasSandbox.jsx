import React, { useState, useEffect, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Tag, Sparkles, Check, Info, Plus, Minus, Gift, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

const COMBO_TEMPLATES = [
  {
    id: 'C01',
    name: 'Combo Almuerzo Tradicional',
    description: 'Todo lo básico para preparar el almuerzo familiar a precio de costo.',
    items: [
      { id: 'I01', name: 'Arroz Diana Premium 1Kg', price: 3800, selectable: false },
      { id: 'I02', name: 'Aceite Girasol 1L', price: 9500, selectable: false },
      { id: 'I03', name: 'Papa Pastusa 1Kg', price: 2800, selectable: true, options: ['Papa Pastusa', 'Papa Criolla', 'Yuca'] }
    ],
    comboPrice: 13500
  },
  {
    id: 'C02',
    name: 'Combo Desayuno Saludable',
    description: 'Pack de inicio del día con alto valor nutricional y lácteos seleccionados.',
    items: [
      { id: 'I04', name: 'Leche Alquería Entera 1L', price: 4200, selectable: false },
      { id: 'I05', name: 'Avena Molida Quaker 500g', price: 5900, selectable: false },
      { id: 'I06', name: 'Huevos A x 30 unidades', price: 16500, selectable: true, options: ['Huevos A x 30', 'Huevos AA x 30', 'Huevos AAA x 12'] }
    ],
    comboPrice: 22000
  },
  {
    id: 'C03',
    name: 'Combo Limpieza Total',
    description: 'Productos de aseo indispensables para el cuidado del hogar.',
    items: [
      { id: 'I07', name: 'Detergente Ariel Líquido 1.5L', price: 18500, selectable: false },
      { id: 'I08', name: 'Lavaplatos Axion Limón 500g', price: 6200, selectable: false },
      { id: 'I09', name: 'Suavizante Downy Libre Enjuague', price: 8950, selectable: true, options: ['Downy Libre Enjuague', 'Suavizante Soflan Brisa'] }
    ],
    comboPrice: 28500
  }
];

function CalculadoraCombosOfertas({
  onAddCombo = () => {}
}) {
  const [activeComboId, setActiveComboId] = useState(COMBO_TEMPLATES[0].id);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);

  const activeCombo = useMemo(() => {
    return COMBO_TEMPLATES.find(c => c.id === activeComboId) || COMBO_TEMPLATES[0];
  }, [activeComboId]);

  useEffect(() => {
    const initialOpts = {};
    activeCombo.items.forEach(item => {
      if (item.selectable && item.options) {
        initialOpts[item.id] = item.options[0];
      }
    });
    setSelectedOptions(initialOpts);
    setQuantity(1);
  }, [activeComboId, activeCombo]);

  const handleOptionChange = (itemId, val) => {
    setSelectedOptions(prev => ({ ...prev, [itemId]: val }));
  };

  const individualTotal = useMemo(() => {
    return activeCombo.items.reduce((sum, item) => sum + item.price, 0);
  }, [activeCombo]);

  const comboTotal = activeCombo.comboPrice;
  const savings = individualTotal - comboTotal;
  const savingsPercent = Math.round((savings / individualTotal) * 100);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl w-full p-6 text-[var(--color-text)]">
      <div className="flex items-center gap-3 mb-6 border-b border-[var(--color-border)] pb-4">
        <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)]">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Calculadora de Combos y Descuentos</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Arma y simula ofertas combinadas para maximizar tus compras</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5 flex flex-col gap-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Promociones Disponibles
          </label>
          <div className="flex flex-col gap-2.5">
            {COMBO_TEMPLATES.map(combo => {
              const isActive = combo.id === activeComboId;
              return (
                <div
                  key={combo.id}
                  onClick={() => setActiveComboId(combo.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition text-left ${isActive ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)] shadow-sm' : 'bg-[var(--color-surface-2)] border-[var(--color-border)] hover:bg-[var(--color-border)]/20'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-xs text-[var(--color-text)]">{combo.name}</h4>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/30">
                      Combo
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed truncate">{combo.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="xl:col-span-7 bg-[var(--color-surface-2)] border border-[var(--color-border)]/50 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-baseline border-b border-[var(--color-border)] pb-3 mb-4">
              <h4 className="font-extrabold text-sm">{activeCombo.name}</h4>
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">Incluye {activeCombo.items.length} productos</span>
            </div>

            <div className="flex flex-col gap-3">
              {activeCombo.items.map(item => {
                if (item.selectable) {
                  return (
                    <div key={item.id} className="flex flex-col gap-2 p-3 bg-[var(--color-surface)] border border-[var(--color-border)]/40 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-emerald-500/10 rounded-full text-emerald-500 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 w-full">
                            <span className="font-semibold text-[var(--color-text-muted)] shrink-0">Elegir:</span>
                            <div className="flex-1 min-w-0">
                              <CustomSelect 
                                value={selectedOptions[item.id] || item.options[0]}
                                onChange={(val) => handleOptionChange(item.id, val)}
                                options={item.options.map(opt => ({ value: opt, label: opt }))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="font-semibold text-[var(--color-text-muted)] self-end">{formatCurrency(item.price)}</span>
                    </div>
                  );
                } else {
                  return (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-[var(--color-surface)] border border-[var(--color-border)]/40 rounded-xl text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1 bg-emerald-500/10 rounded-full text-emerald-500 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold truncate text-[var(--color-text)]">{item.name}</span>
                      </div>
                      <span className="font-semibold text-[var(--color-text-muted)] shrink-0">{formatCurrency(item.price)}</span>
                    </div>
                  );
                }
              })}
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--color-border)] pt-4">
            <div className="space-y-2.5 bg-[var(--color-surface)] border border-[var(--color-border)]/40 p-3.5 rounded-xl mb-4 text-xs">
              <div className="flex justify-between items-center text-[var(--color-text-muted)]">
                <span>Precio Regular</span>
                <span className="line-through">{formatCurrency(individualTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-[var(--color-text)] font-semibold">
                <span>Precio Combo</span>
                <span className="text-[var(--color-primary)] font-bold">{formatCurrency(comboTotal)}</span>
              </div>
              <div className="border-t border-[var(--color-border)]/50 mt-2 pt-2 flex justify-between items-center text-emerald-500 font-bold">
                <span>Ahorro Neto</span>
                <span>{formatCurrency(savings)} ({savingsPercent}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mb-4 bg-[var(--color-surface)] border border-[var(--color-border)]/40 p-2.5 rounded-xl">
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">Cantidad de Combos</span>
              <div className="flex items-center gap-1 bg-[var(--color-surface-2)] p-1 rounded-lg border border-[var(--color-border)]">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded bg-[var(--color-surface)] border border-[var(--color-border)]/60 text-[var(--color-text)] hover:bg-[var(--color-border)]/20 transition font-bold"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-bold text-xs w-8 text-center text-[var(--color-text)]">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded bg-[var(--color-surface)] border border-[var(--color-border)]/60 text-[var(--color-text)] hover:bg-[var(--color-border)]/20 transition font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <button
              onClick={() => onAddCombo({ combo: activeCombo, options: selectedOptions, quantity, total: comboTotal * quantity, savings: savings * quantity })}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 py-2.5 rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Gift className="w-4 h-4" />
              Llevar Combo • {formatCurrency(comboTotal * quantity)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalculadoraCombosOfertasSandbox() {
  const [combosList, setCombosList] = useState([]);

  const handleAddCombo = (newCombo) => {
    setCombosList(prev => [...prev, { ...newCombo, id: Date.now() }]);
  };

  const handleRemove = (id) => {
    setCombosList(prev => prev.filter(c => c.id !== id));
  };

  const accumulatedSavings = combosList.reduce((sum, item) => sum + item.savings, 0);
  const totalCost = combosList.reduce((sum, item) => sum + item.total, 0);

  const accumulatedSavingsFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(accumulatedSavings);
  const totalCostFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalCost);

  return (
    <SandboxLayout
      title="Calculadora de Combos y Ofertas"
      description="Simulador de promociones cruzadas y visualización en tiempo real del ahorro acumulado"
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full max-w-5xl mx-auto">
        <div className="xl:col-span-8">
          <CalculadoraCombosOfertas onAddCombo={handleAddCombo} />
        </div>

        {/* Canasta de Combos */}
        <div className="xl:col-span-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow p-5 flex flex-col justify-between max-h-[500px]">
          <div>
            <h4 className="font-bold text-sm border-b border-[var(--color-border)] pb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[var(--color-primary)]" />
              Combos en Carrito
            </h4>
            <div className="flex flex-col gap-2.5 py-4 overflow-y-auto max-h-[300px] min-h-[200px]">
              {combosList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-[var(--color-text-muted)] text-xs">
                  <Gift className="w-8 h-8 stroke-1 mb-2" />
                  <p>Ningún combo agregado</p>
                  <p className="mt-1">Selecciona una promoción y presiona "Llevar Combo Promocional".</p>
                </div>
              ) : (
                combosList.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs p-3 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]/55">
                    <div>
                      <p className="font-bold">{item.combo.name}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        {item.quantity} {item.quantity === 1 ? 'pack' : 'packs'} • Ahorro: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(item.savings)}
                      </p>
                      {Object.keys(item.options).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.entries(item.options).map(([k, v]) => (
                            <span key={k} className="text-[9px] px-1 bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]/50 rounded">
                              {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--color-primary)]">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(item.total)}
                      </span>
                      <button onClick={() => handleRemove(item.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {combosList.length > 0 && (
            <div className="border-t border-[var(--color-border)] pt-3 flex flex-col gap-2">
              <div className="flex justify-between items-baseline text-xs">
                <span className="font-semibold text-emerald-600">Ahorro Total:</span>
                <span className="font-bold text-emerald-600">{accumulatedSavingsFormatted}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-[var(--color-text-muted)]">Total Combos:</span>
                <span className="text-xl font-extrabold text-[var(--color-primary)] !text-[var(--color-primary)]">{totalCostFormatted}</span>
              </div>
              <button 
                onClick={() => setCombosList([])}
                className="w-full py-2 border border-[var(--color-border)] hover:bg-[var(--color-border)]/20 text-xs font-semibold rounded-lg text-center transition"
              >
                Vaciar Carrito
              </button>
            </div>
          )}
        </div>
      </div>
    </SandboxLayout>
  );
}
