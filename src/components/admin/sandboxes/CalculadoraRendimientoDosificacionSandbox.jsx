import React, { useState, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Sparkles, Trash2, ShoppingCart, HelpCircle, Check, ShoppingBag } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

const PRODUCTOS_AGRO = [
  { value: 'p-01', label: 'Fertilizante Triple 15 (Saco 50Kg)', dosePerHa: 200, pricePerUnit: 110000, unitName: 'Saco 50Kg' },
  { value: 'p-02', label: 'Cal Dolomita Mineral (Saco 40Kg)', dosePerHa: 500, pricePerUnit: 35000, unitName: 'Saco 40Kg' },
  { value: 'p-03', label: 'Abono Orgánico Compost (Saco 25Kg)', dosePerHa: 800, pricePerUnit: 25000, unitName: 'Saco 25Kg' },
  { value: 'p-04', label: 'Urea Activada Nitrógeno (Saco 50Kg)', dosePerHa: 150, pricePerUnit: 145000, unitName: 'Saco 50Kg' }
];

const UNIDADES_AREA = [
  { value: 'ha', label: 'Hectáreas (Ha)' },
  { value: 'm2', label: 'Metros Cuadrados (m²)' }
];

function CalculadoraRendimientoDosificacion({ onAddProduct }) {
  const [selectedProductVal, setSelectedProductVal] = useState(PRODUCTOS_AGRO[0].value);
  const [areaInput, setAreaInput] = useState(1);
  const [unitVal, setUnitVal] = useState('ha');
  const [results, setResults] = useState(null);
  const [toast, setToast] = useState('');

  const selectedProduct = useMemo(() => {
    return PRODUCTOS_AGRO.find(p => p.value === selectedProductVal) || PRODUCTOS_AGRO[0];
  }, [selectedProductVal]);

  const handleCalculate = () => {
    if (areaInput <= 0 || isNaN(areaInput)) return;

    const areaInHa = unitVal === 'm2' ? areaInput / 10000 : areaInput;
    const totalDoseKg = Math.round(areaInHa * selectedProduct.dosePerHa * 10) / 10;
    const sacoWeight = selectedProduct.unitName.includes('50Kg') ? 50 : selectedProduct.unitName.includes('40Kg') ? 40 : 25;
    const unitsRequired = Math.max(1, Math.ceil(totalDoseKg / sacoWeight));
    const totalCost = unitsRequired * selectedProduct.pricePerUnit;

    setResults({
      doseKg: totalDoseKg,
      units: unitsRequired,
      cost: totalCost,
      productName: selectedProduct.label,
      unitName: selectedProduct.unitName
    });
  };

  const handleAdd = () => {
    if (!results || !onAddProduct) return;
    onAddProduct({
      id: selectedProduct.value + '-' + Date.now(),
      nombre: results.productName,
      precio: selectedProduct.pricePerUnit,
      cant: results.units
    });

    setToast(`Agregados ${results.units} sacos al pedido`);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="w-full bg-[var(--color-surface)] text-[var(--color-text)] rounded-2xl border border-[var(--color-border)] shadow-xl p-4 sm:p-5 relative min-w-0">
      
      {/* Toast */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 whitespace-nowrap">
          <Check className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 border-b border-[var(--color-border)] pb-4 flex items-center gap-3">
        <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)]">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-base">Calculadora de Rendimiento y Dosis</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Estima los insumos necesarios para tu lote de cultivo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Formulario Inputs */}
        <div className="space-y-4 flex flex-col">
          {/* Producto */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Seleccionar Producto
            </label>
            <CustomSelect
              options={PRODUCTOS_AGRO}
              value={selectedProductVal}
              onChange={(val) => {
                setSelectedProductVal(val);
                setResults(null);
              }}
            />
          </div>

          {/* Área del lote */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-end text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 h-8 leading-tight">
                Área de Lote
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={areaInput}
                onChange={(e) => {
                  setAreaInput(parseFloat(e.target.value) || 0);
                  setResults(null);
                }}
                className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
              />
            </div>
            <div>
              <label className="flex items-end text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 h-8 leading-tight">
                Unidad de Medida
              </label>
              <CustomSelect
                options={UNIDADES_AREA}
                value={unitVal}
                onChange={(val) => {
                  setUnitVal(val);
                  setResults(null);
                }}
              />
            </div>
          </div>

          {/* Botón de Cálculo */}
          <button
            onClick={handleCalculate}
            disabled={areaInput <= 0}
            className="w-full mt-auto bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-xs font-bold py-2.5 rounded-xl border border-[var(--color-border)] transition-colors text-[var(--color-text)]"
          >
            Calcular Dosis Recomendada
          </button>
        </div>

        {/* Panel de Resultados */}
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col justify-between">
          {results ? (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-2">
                Resultados de Dosificación
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[var(--color-text-muted)]">Dosis Requerida:</span>
                  <span className="font-bold text-sm text-[var(--color-text)]">{results.doseKg.toLocaleString()} Kg total</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[var(--color-text-muted)]">Empaques Sugeridos:</span>
                  <span className="font-bold text-sm text-[var(--color-text)]">{results.units} saco{results.units > 1 && 's'}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[var(--color-text-muted)] font-semibold">Costo Total:</span>
                  <span className="font-extrabold text-lg text-[var(--color-primary)]">${results.cost.toLocaleString()}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-4 border-t border-[var(--color-border)]">
                <button
                  onClick={handleAdd}
                  className="w-full bg-[var(--color-primary)] text-white hover:opacity-95 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all !text-white"
                >
                  <ShoppingCart className="w-4 h-4 text-white" />
                  Añadir Tratamiento al Pedido
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-[var(--color-text-muted)]">
              <HelpCircle className="w-8 h-8 stroke-1 mb-2" />
              <p className="text-xs font-semibold">Calculadora Lista</p>
              <p className="text-[10px] mt-1 max-w-[200px]">Ingresa los datos de tu terreno y presiona "Calcular Dosis Recomendada" para estimar el pedido.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CalculadoraRendimientoDosificacionSandbox() {
  const [pedidoList, setPedidoList] = useState([]);

  const handleAddProduct = (product) => {
    setPedidoList(prev => [...prev, product]);
  };

  const handleRemove = (id) => {
    setPedidoList(prev => prev.filter(item => item.id !== id));
  };

  const totalCost = useMemo(() => {
    return pedidoList.reduce((sum, item) => sum + (item.precio * item.cant), 0);
  }, [pedidoList]);

  return (
    <SandboxLayout
      title="Calculadora de Rendimiento y Dosificación"
      description="Simulador de dosificación agrícola con cálculo dinámico de sacos y cotización por lote"
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full max-w-5xl mx-auto">
        <div className="xl:col-span-8">
          <CalculadoraRendimientoDosificacion onAddProduct={handleAddProduct} />
        </div>

        {/* Canasta de Pedido */}
        <div className="xl:col-span-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow p-5 flex flex-col justify-between max-h-[500px]">
          <div>
            <h4 className="font-bold text-sm border-b border-[var(--color-border)] pb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[var(--color-primary)]" />
              Insumos Calculados
            </h4>
            <div className="flex flex-col gap-2.5 py-4 overflow-y-auto max-h-[300px] min-h-[200px]">
              {pedidoList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-[var(--color-text-muted)] text-xs">
                  <ShoppingBag className="w-8 h-8 stroke-1 mb-2 text-[var(--color-text-muted)]" />
                  <p>Ningún cálculo guardado</p>
                  <p className="mt-1">Calcula la dosis de un producto y agrégalo para ver su coste acumulado.</p>
                </div>
              ) : (
                pedidoList.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs p-3 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold truncate text-[var(--color-text)]">{item.nombre}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                        {item.cant} saco{item.cant > 1 && 's'} x ${item.precio.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--color-primary)] whitespace-nowrap">
                        ${(item.precio * item.cant).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {pedidoList.length > 0 && (
            <div className="border-t border-[var(--color-border)] pt-3 flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-[var(--color-text-muted)]">Valor Total:</span>
                <span className="text-lg font-extrabold text-[var(--color-primary)]">${totalCost.toLocaleString()}</span>
              </div>
              <button
                onClick={() => setPedidoList([])}
                className="w-full py-2 border border-[var(--color-border)] hover:bg-[var(--color-border)]/20 text-xs font-semibold rounded-lg text-center transition-colors text-[var(--color-text)]"
              >
                Vaciar Pedidos
              </button>
            </div>
          )}
        </div>
      </div>
    </SandboxLayout>
  );
}
