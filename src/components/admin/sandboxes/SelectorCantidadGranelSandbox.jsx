import React, { useState, useEffect } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Scale, Plus, Minus, AlertTriangle, ShoppingCart, Info, Trash2 } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

function SelectorCantidadGranel({
  productName = "Tomate Chonto Orgánico",
  pricePerKg = 4500,
  maxCapacityKg = 15,
  onAdd = () => {},
}) {
  const [unit, setUnit] = useState('kg');
  const [quantity, setQuantity] = useState(1.0);
  const [subtotal, setSubtotal] = useState(0);

  const getPricePerUnit = () => {
    switch (unit) {
      case 'lb': return pricePerKg / 2;
      case 'g': return pricePerKg / 1000;
      case 'und': return pricePerKg / 5;
      default: return pricePerKg;
    }
  };

  const getStep = () => {
    switch (unit) {
      case 'g': return 50;
      case 'und': return 1;
      default: return 0.05;
    }
  };

  const getMaxLimit = () => {
    switch (unit) {
      case 'lb': return maxCapacityKg * 2;
      case 'g': return maxCapacityKg * 1000;
      case 'und': return maxCapacityKg * 5;
      default: return maxCapacityKg;
    }
  };

  useEffect(() => {
    setSubtotal(quantity * getPricePerUnit());
  }, [quantity, unit, pricePerKg]);

  const handleUnitChange = (val) => {
    const oldUnit = unit;
    setUnit(val);
    if (oldUnit === 'kg' && val === 'lb') setQuantity(q => Math.min(q * 2, maxCapacityKg * 2));
    else if (oldUnit === 'lb' && val === 'kg') setQuantity(q => Math.min(q / 2, maxCapacityKg));
    else if (oldUnit === 'kg' && val === 'g') setQuantity(q => Math.min(q * 1000, maxCapacityKg * 1000));
    else if (oldUnit === 'g' && val === 'kg') setQuantity(q => Math.min(q / 1000, maxCapacityKg));
    else if (val === 'und') setQuantity(5);
    else setQuantity(1.0);
  };

  const handleIncrement = () => {
    setQuantity(prev => Math.min(prev + getStep(), getMaxLimit()));
  };

  const handleDecrement = () => {
    setQuantity(prev => Math.max(prev - getStep(), unit === 'g' ? 50 : (unit === 'und' ? 1 : 0.05)));
  };

  const priceFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(getPricePerUnit());
  const subtotalFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(subtotal);
  const basePriceFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(pricePerKg);

  const isNearingLimit = quantity >= getMaxLimit() * 0.9;

  return (
    <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl w-full max-w-md mx-auto text-[var(--color-text)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)]">
          <Scale className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{productName}</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Base: {basePriceFormatted} / kg</p>
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
          Unidad de Medida
        </label>
        <CustomSelect 
          value={unit}
          onChange={handleUnitChange}
          options={[
            { value: 'kg', label: 'Kilogramos (kg)' },
            { value: 'lb', label: 'Libras (lb)' },
            { value: 'g', label: 'Gramos (g)' },
            { value: 'und', label: 'Unidades (und)' }
          ]}
        />
      </div>

      <div className="bg-[var(--color-surface-2)] p-4 rounded-xl border border-[var(--color-border)]/50 mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-[var(--color-text-muted)]">Cantidad</span>
          <span className="text-xs font-semibold text-[var(--color-primary)]">{priceFormatted} por {unit}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button 
            type="button"
            onClick={handleDecrement}
            className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)]/20 rounded-xl transition duration-200"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <div className="flex-1 flex items-center justify-center gap-1">
            <input 
              type="number" 
              value={quantity === 0 ? '' : Number(quantity.toFixed(2))}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val >= 0) setQuantity(Math.min(val, getMaxLimit()));
                else if (e.target.value === '') setQuantity(0);
              }}
              className="w-24 text-center bg-transparent font-bold text-2xl focus:outline-none"
            />
            <span className="font-semibold text-lg text-[var(--color-text-muted)]">{unit}</span>
          </div>

          <button 
            type="button"
            onClick={handleIncrement}
            className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)]/20 rounded-xl transition duration-200"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5">
          <input 
            type="range"
            min={unit === 'g' ? 50 : (unit === 'und' ? 1 : 0.1)}
            max={getMaxLimit()}
            step={getStep()}
            value={quantity}
            onChange={(e) => setQuantity(parseFloat(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[var(--color-border)] accent-[var(--color-primary)]"
          />
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-1">
            <span>Mín: {unit === 'g' ? '50g' : (unit === 'und' ? '1 und' : `0.1${unit}`)}</span>
            <span>Máx: {getMaxLimit()} {unit}</span>
          </div>
        </div>
      </div>

      {isNearingLimit && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 p-3 rounded-xl mb-4 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Capacidad recomendada para una bolsa simple casi al límite ({getMaxLimit()} {unit}).</span>
        </div>
      )}

      <div className="border-t border-[var(--color-border)] pt-4 flex flex-col gap-3">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">Subtotal Estimado:</span>
          <span className="text-2xl font-extrabold text-[var(--color-primary)] !text-[var(--color-primary)]">{subtotalFormatted}</span>
        </div>

        <button
          type="button"
          onClick={() => onAdd({ productName, unit, quantity, subtotal })}
          className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 py-3 rounded-xl font-semibold shadow-lg transition duration-200"
        >
          <ShoppingCart className="w-4 h-4" />
          Agregar al Pesaje
        </button>
      </div>
    </div>
  );
}

export default function SelectorCantidadGranelSandbox() {
  const [items, setItems] = useState([]);
  const [productName, setProductName] = useState("Manzana Roja Royal");
  const [pricePerKg, setPricePerKg] = useState(8500);

  const handleAddItem = (item) => {
    setItems(prev => [...prev, { ...item, id: Date.now() }]);
  };

  const handleRemoveItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const totalCost = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalCostFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalCost);

  return (
    <SandboxLayout
      title="Selector de Cantidad a Granel"
      description="Simulador interactivo de pesaje y cálculo de subtotales para venta asistida"
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full max-w-5xl mx-auto">
        {/* Panel Izquierdo: Configuración y Selector */}
        <div className="xl:col-span-6 flex flex-col gap-6">
          <div className="p-6 bg-[var(--color-surface-2)] border border-[var(--color-border)]/50 rounded-2xl">
            <h4 className="font-semibold mb-4 flex items-center gap-2 text-sm text-[var(--color-text-muted)] uppercase tracking-wider">
              <Info className="w-4 h-4 text-[var(--color-primary)]" />
              Configurar Producto Activo
            </h4>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Nombre del Producto</label>
                <input 
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Precio por Kilogramo (COP)</label>
                <input 
                  type="number"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <SelectorCantidadGranel 
            productName={productName}
            pricePerKg={pricePerKg}
            onAdd={handleAddItem}
          />
        </div>

        {/* Panel Derecho: Ticket de Pesaje */}
        <div className="lg:col-span-6 flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-md p-6 max-h-[600px]">
          <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
            <h4 className="font-bold text-lg flex items-center gap-2">
              <Scale className="w-5 h-5 text-[var(--color-primary)]" />
              Balanza de Pesaje
            </h4>
            <span className="text-xs px-2.5 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold rounded-full">
              {items.length} ítems
            </span>
          </div>

          <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3 min-h-[250px]">
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[var(--color-text-muted)]">
                <Scale className="w-12 h-12 stroke-1 mb-3" />
                <p className="text-sm font-medium">Balanza vacía</p>
                <p className="text-xs mt-1">Usa el selector para añadir ítems pesados al ticket temporal.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3.5 bg-[var(--color-surface-2)] border border-[var(--color-border)]/50 rounded-xl transition hover:border-[var(--color-border)]">
                  <div>
                    <p className="font-semibold text-sm">{item.productName}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {item.quantity.toFixed(2)} {item.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-[var(--color-primary)]">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(item.subtotal)}
                    </span>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 hover:bg-red-500/10 text-red-500 hover:text-red-600 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-[var(--color-border)] pt-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm text-[var(--color-text-muted)]">Total Acumulado:</span>
                <span className="font-extrabold text-2xl text-[var(--color-primary)] !text-[var(--color-primary)]">{totalCostFormatted}</span>
              </div>
              <button 
                onClick={() => setItems([])}
                className="w-full py-2.5 border border-[var(--color-border)] hover:bg-[var(--color-border)]/20 text-xs font-semibold rounded-xl text-center transition"
              >
                Limpiar Balanza
              </button>
            </div>
          )}
        </div>
      </div>
    </SandboxLayout>
  );
}
