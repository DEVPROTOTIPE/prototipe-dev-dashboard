import React, { useState, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Search, Delete, CornerDownLeft, Plus, Check, HelpCircle, Apple, ShoppingCart, Trash2 } from 'lucide-react';

const PLU_DATABASE = [
  { plu: '4011', name: 'Banano Maduro', price: 2900, category: 'Frutas' },
  { plu: '4131', name: 'Manzana Gala Importada', price: 9200, category: 'Frutas' },
  { plu: '4022', name: 'Uva Roja Sin Semilla', price: 14500, category: 'Frutas' },
  { plu: '4799', name: 'Tomate Chonto Primera', price: 4500, category: 'Vegetales' },
  { plu: '4062', name: 'Pepino Cohombro', price: 2200, category: 'Vegetales' },
  { plu: '4070', name: 'Cebolla Cabezona Blanca', price: 3400, category: 'Vegetales' },
  { plu: '4889', name: 'Cilantro Atado Fresco', price: 1500, category: 'Hierbas' },
  { plu: '4901', name: 'Perejil Liso Atado', price: 1800, category: 'Hierbas' },
  { plu: '3284', name: 'Aguacate Hass Premium', price: 11000, category: 'Frutas' },
  { plu: '4512', name: 'Papa Pastusa Lavada', price: 2800, category: 'Vegetales' }
];

function BuscadorCodigoPLU({
  onSelectProduct = () => {},
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [pluInput, setPluInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('TODOS');

  const filteredProducts = useMemo(() => {
    return PLU_DATABASE.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.plu.includes(searchQuery);
      const matchesCategory = activeCategory === 'TODOS' || item.category.toUpperCase() === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const activeMatchedProduct = useMemo(() => {
    if (pluInput.length < 4) return null;
    return PLU_DATABASE.find(item => item.plu === pluInput) || null;
  }, [pluInput]);

  const handleKeyPress = (num) => {
    if (pluInput.length < 4) setPluInput(prev => prev + num);
  };

  const handleBackspace = () => {
    setPluInput(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPluInput('');
  };

  const handleEnterCode = () => {
    if (activeMatchedProduct) {
      onSelectProduct(activeMatchedProduct);
      setPluInput('');
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl w-full p-6 text-[var(--color-text)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)]">
            <Apple className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Buscador y Directorio de Códigos PLU</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Ingresa códigos de 4 dígitos para pesar a granel</p>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--color-text-muted)]" />
          <input 
            type="text"
            placeholder="Buscar por PLU o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['TODOS', 'FRUTAS', 'VEGETALES', 'HIERBAS'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${activeCategory === cat ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-border)]/20'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 2xl:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-[var(--color-text-muted)]">
                <HelpCircle className="w-10 h-10 mx-auto stroke-1 mb-2" />
                <p className="text-xs">No se encontraron productos con esos criterios</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <div
                  key={product.plu}
                  onClick={() => onSelectProduct(product)}
                  className="p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)]/60 hover:border-[var(--color-primary)] rounded-xl cursor-pointer transition flex flex-col justify-between h-28"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-extrabold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded">
                      #{product.plu}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{product.category}</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs truncate mb-1">{product.name}</h5>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-medium">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(product.price)} / kg
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="xl:col-span-4 bg-[var(--color-surface-2)] border border-[var(--color-border)]/60 rounded-xl p-5 flex flex-col gap-4 self-start">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Digitador PLU Directo</span>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 mt-2 flex items-center justify-between min-h-[52px]">
              <span className="text-2xl font-extrabold tracking-widest text-[var(--color-text)]">
                {pluInput || <span className="text-[var(--color-text-muted)]/30">----</span>}
              </span>
              {pluInput && (
                <button onClick={handleBackspace} className="p-1 hover:bg-[var(--color-border)]/30 rounded text-[var(--color-text-muted)]">
                  <Delete className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="min-h-[70px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 text-xs flex flex-col justify-center">
            {activeMatchedProduct ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs">{activeMatchedProduct.name}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(activeMatchedProduct.price)} / kg
                  </p>
                </div>
                <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500 border border-emerald-500/30">
                  <Check className="w-4 h-4" />
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-[var(--color-text-muted)] text-center">
                {pluInput.length === 4 ? 'Código PLU no registrado' : 'Digita los 4 números del código PLU'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                className="py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)]/20 active:bg-[var(--color-primary)] active:text-white font-extrabold text-sm rounded-xl transition"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs rounded-xl transition"
            >
              C
            </button>
            <button
              onClick={() => handleKeyPress('0')}
              className="py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)]/20 font-extrabold text-sm rounded-xl transition"
            >
              0
            </button>
            <button
              onClick={handleEnterCode}
              disabled={!activeMatchedProduct}
              className={`py-2.5 flex items-center justify-center rounded-xl font-bold text-xs transition ${activeMatchedProduct ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 shadow' : 'bg-[var(--color-border)]/40 text-[var(--color-text-muted)]/50 cursor-not-allowed'}`}
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BuscadorCodigoPLUSandbox() {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelectProduct = (product) => {
    setSelectedItems(prev => {
      const exists = prev.find(item => item.plu === product.plu);
      if (exists) {
        return prev.map(item => item.plu === product.plu ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleRemove = (plu) => {
    setSelectedItems(prev => prev.filter(item => item.plu !== plu));
  };

  const totalCost = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCostFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalCost);

  return (
    <SandboxLayout
      title="Buscador de Código PLU"
      description="Teclado numérico y catálogo predictivo para cobro rápido de productos sin código de barras"
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full max-w-5xl mx-auto">
        <div className="xl:col-span-8">
          <BuscadorCodigoPLU onSelectProduct={handleSelectProduct} />
        </div>
        
        {/* Ticket de Compra Simulado */}
        <div className="xl:col-span-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow p-5 flex flex-col justify-between max-h-[500px]">
          <div>
            <h4 className="font-bold text-sm border-b border-[var(--color-border)] pb-3 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[var(--color-primary)]" />
              Bolsa de Compra
            </h4>
            <div className="flex flex-col gap-2.5 py-4 overflow-y-auto max-h-[300px] min-h-[200px]">
              {selectedItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-[var(--color-text-muted)] text-xs">
                  <Apple className="w-8 h-8 stroke-1 mb-2" />
                  <p>Ningún artículo seleccionado</p>
                  <p className="mt-1">Toca una tarjeta del catálogo o digita un PLU en el teclado.</p>
                </div>
              ) : (
                selectedItems.map(item => (
                  <div key={item.plu} className="flex justify-between items-center text-xs p-2.5 bg-[var(--color-surface-2)] rounded-lg">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">PLU #{item.plu} • {item.quantity} kg</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--color-primary)]">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(item.price * item.quantity)}
                      </span>
                      <button onClick={() => handleRemove(item.plu)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="border-t border-[var(--color-border)] pt-3 flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-[var(--color-text-muted)]">Total:</span>
                <span className="text-xl font-extrabold text-[var(--color-primary)] !text-[var(--color-primary)]">{totalCostFormatted}</span>
              </div>
              <button 
                onClick={() => setSelectedItems([])}
                className="w-full py-2 border border-[var(--color-border)] hover:bg-[var(--color-border)]/20 text-xs font-semibold rounded-lg text-center transition"
              >
                Vaciar Bolsa
              </button>
            </div>
          )}
        </div>
      </div>
    </SandboxLayout>
  );
}
