import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import { Filter, X, Sliders, Check } from 'lucide-react';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Tenis Run Max', size: '38', color: 'Azul', price: 180000, category: 'Calzado' },
  { id: 2, name: 'Camiseta DryFit', size: 'M', color: 'Negro', price: 65000, category: 'Ropa' },
  { id: 3, name: 'Sudadera Algodón', size: 'L', color: 'Gris', price: 120000, category: 'Ropa' },
  { id: 4, name: 'Tenis Trail Pro', size: '40', color: 'Negro', price: 210000, category: 'Calzado' },
  { id: 5, name: 'Gorra Deportiva', size: 'S', color: 'Azul', price: 45000, category: 'Accesorios' },
  { id: 6, name: 'Medias Térmicas', size: 'M', color: 'Gris', price: 25000, category: 'Ropa' }
];

export default function CatalogFiltersSandbox() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Obtener opciones únicas
  const categories = ['All', ...new Set(MOCK_PRODUCTS.map(p => p.category))];
  const colors = ['All', ...new Set(MOCK_PRODUCTS.map(p => p.color))];
  const sizes = ['All', ...new Set(MOCK_PRODUCTS.map(p => p.size))];

  // Filtrar productos
  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchCol = selectedColor === 'All' || p.color === selectedColor;
    const matchSize = selectedSize === 'All' || p.size === selectedSize;
    return matchCat && matchCol && matchSize;
  });

  const handleReset = () => {
    setSelectedCategory('All');
    setSelectedColor('All');
    setSelectedSize('All');
  };

  const isFiltered = selectedCategory !== 'All' || selectedColor !== 'All' || selectedSize !== 'All';

  return (
    <SandboxLayout
      title="Filtros de Catálogo y Bottom Sheet (Simulador de Filtros)"
      description="Visualiza e interactúa con el creador y panel deslizable inferior de filtros cruzados de atributos comerciales en un catálogo de prueba local."
    >
      <div className="space-y-4 max-w-lg mx-auto bg-surface border border-app rounded-3xl p-6 shadow-xl relative min-h-[400px]">
        {/* Barra superior de filtros del catálogo */}
        <div className="flex items-center justify-between border-b border-app pb-3">
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-indigo-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text)]">Catálogo Comercial</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilterDrawer(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-550 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <Sliders size={11} />
              Filtrar ({filteredProducts.length})
            </button>
            {isFiltered && (
              <button
                onClick={handleReset}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/60 text-slate-300 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Listado de Productos filtrados */}
        <div className="grid grid-cols-2 gap-2">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(p => (
              <div key={p.id} className="p-3 bg-surface-2 border border-app rounded-2xl flex flex-col justify-between space-y-2">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black uppercase tracking-wider text-indigo-400">{p.category}</span>
                  <p className="text-[11px] font-bold text-[var(--color-text)]">{p.name}</p>
                </div>
                <div className="flex items-center justify-between text-[9px] text-[var(--color-text-muted)] border-t border-app/60 pt-1.5">
                  <span>Talla: {p.size} · {p.color}</span>
                  <span className="font-bold text-indigo-400">${p.price.toLocaleString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-8 text-center text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">
              Ningún artículo coincide con los filtros.
            </div>
          )}
        </div>

        {/* Drawer inferior simulado deslizable */}
        {showFilterDrawer && (
          <div className="absolute inset-0 bg-black/60 rounded-3xl flex flex-col justify-end overflow-hidden z-20">
            {/* Tap-shield */}
            <div className="absolute inset-0 -z-10" onClick={() => setShowFilterDrawer(false)} />
            
            <div className="bg-surface border-t border-app rounded-t-3xl p-5 space-y-5 animate-slide-up max-h-[90%] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-app pb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-text)]">Filtros del Catálogo</h4>
                <button
                  onClick={() => setShowFilterDrawer(false)}
                  className="w-7 h-7 rounded-lg bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Categorías */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Línea/Categoría</p>
                <div className="flex flex-wrap gap-1">
                  {categories.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`px-2.5 py-1 rounded-xl text-[9px] font-bold transition-all cursor-pointer ${
                        selectedCategory === c
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-surface-2 hover:bg-surface-3 text-[var(--color-text-muted)]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colores */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Color</p>
                <div className="flex flex-wrap gap-1">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-2.5 py-1 rounded-xl text-[9px] font-bold transition-all cursor-pointer ${
                        selectedColor === c
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-surface-2 hover:bg-surface-3 text-[var(--color-text-muted)]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tallas */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Talla/Medida</p>
                <div className="flex flex-wrap gap-1">
                  {sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-2.5 py-1 rounded-xl text-[9px] font-bold transition-all cursor-pointer ${
                        selectedSize === s
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-surface-2 hover:bg-surface-3 text-[var(--color-text-muted)]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowFilterDrawer(false)}
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-550 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
