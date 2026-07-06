import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente real inline para el Sandbox
function CarruselCompletaLook({
  mainProduct,
  relatedProducts,
  discountPercentage = 15,
  onAddLookToCart
}) {
  const [selectedIds, setSelectedIds] = useState([mainProduct.id, ...relatedProducts.map(p => p.id)]);
  
  const [selectedSizes, setSelectedSizes] = useState(() => {
    const initial = { [mainProduct.id]: mainProduct.sizes[0] || 'M' };
    relatedProducts.forEach(p => {
      initial[p.id] = p.sizes[0] || '32';
    });
    return initial;
  });

  const toggleProductSelect = (id) => {
    if (id === mainProduct.id) return;
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSizeChange = (productId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size
    }));
  };

  const totals = React.useMemo(() => {
    let originalTotal = 0;
    if (selectedIds.includes(mainProduct.id)) {
      originalTotal += mainProduct.price;
    }
    relatedProducts.forEach(p => {
      if (selectedIds.includes(p.id)) {
        originalTotal += p.price;
      }
    });

    const hasBundleDiscount = selectedIds.length >= 2;
    const discountAmount = hasBundleDiscount ? Math.round(originalTotal * (discountPercentage / 100)) : 0;
    const finalPrice = originalTotal - discountAmount;

    return {
      original: originalTotal,
      discount: discountAmount,
      final: finalPrice,
      hasDiscount: hasBundleDiscount
    };
  }, [selectedIds, mainProduct, relatedProducts, discountPercentage]);

  const handleBuyBundle = () => {
    const bundleItems = [];
    if (selectedIds.includes(mainProduct.id)) {
      bundleItems.push({
        ...mainProduct,
        selectedSize: selectedSizes[mainProduct.id]
      });
    }
    relatedProducts.forEach(p => {
      if (selectedIds.includes(p.id)) {
        bundleItems.push({
          ...p,
          selectedSize: selectedSizes[p.id]
        });
      }
    });
    if (onAddLookToCart) {
      onAddLookToCart(bundleItems, totals.final);
    }
  };

  return (
    <div 
      id="carrusel-completa-look-container"
      className="w-full max-w-xl p-5 rounded-2xl bg-[var(--color-surface)]/20 border border-[var(--color-border)] text-[var(--color-text)] shadow-xl backdrop-blur-xl animate-fade-in"
    >
      <div className="mb-4">
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400">Oferta Especial Outfit</span>
        <h3 className="text-sm font-bold text-[var(--color-text)]">Completa el Look & Ahorra {discountPercentage}%</h3>
      </div>

      <div className="flex flex-col gap-4">
        
        {/* Productos */}
        <div className="flex flex-wrap gap-3.5 items-center justify-center py-1">
          {/* Card Principal */}
          <div className="flex gap-3 p-3 bg-[var(--color-bg)]/80 border border-[var(--color-border)] rounded-2xl w-52 shrink-0 relative">
            <div className="absolute top-2 left-2 bg-indigo-650 text-[9px] font-black text-white px-2 py-0.5 rounded-lg shadow-md uppercase">
              Base
            </div>
            <img 
              src={mainProduct.image} 
              alt={mainProduct.name} 
              className="w-12 h-12 rounded-xl object-cover bg-[var(--color-surface-2)]"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <span className="text-xs font-bold text-[var(--color-text)] block truncate leading-tight">{mainProduct.name}</span>
              <span className="text-[11px] font-black text-indigo-500 dark:text-indigo-400 block mt-0.5">${mainProduct.price.toLocaleString()}</span>
              
              {/* Tallas en Botones Premium */}
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {mainProduct.sizes.map(s => {
                  const isSelected = selectedSizes[mainProduct.id] === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSizeChange(mainProduct.id, s)}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                          : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-indigo-500/50'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-[var(--color-text-muted)] font-bold text-sm">+</div>

          {/* Relacionados */}
          {relatedProducts.map(p => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <div 
                key={p.id}
                onClick={() => toggleProductSelect(p.id)}
                className={`flex gap-3 p-3 rounded-2xl w-52 shrink-0 border cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? 'bg-[var(--color-bg)]/90 border-indigo-500 shadow-md shadow-indigo-500/5' 
                    : 'bg-[var(--color-bg)]/40 border-[var(--color-border)] opacity-60 hover:opacity-85'
                }`}
              >
                <div className="relative">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-12 h-12 rounded-xl object-cover bg-[var(--color-surface-2)]"
                  />
                  <div className={`absolute -top-1.5 -left-1.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'
                  }`}>
                    {isSelected && (
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                <div 
                  className="flex-1 min-w-0 flex flex-col justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs font-bold text-[var(--color-text)] block truncate leading-tight">{p.name}</span>
                  <span className="text-[11px] font-black text-indigo-500 dark:text-indigo-400 block mt-0.5">${p.price.toLocaleString()}</span>
                  
                  {/* Tallas en Botones Premium */}
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {p.sizes.map(s => {
                      const isSelectedSize = selectedSizes[p.id] === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleSizeChange(p.id, s)}
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                            isSelectedSize 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                              : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-indigo-500/50'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totales y Compra */}
        <div className="flex flex-col justify-center items-center text-center bg-[var(--color-surface-2)]/30 p-4 rounded-2xl border border-[var(--color-border)] mt-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Total Outfit</span>
          
          <div className="flex items-baseline gap-2 my-1">
            {totals.hasDiscount && (
              <span className="text-xs text-[var(--color-text-muted)] line-through">
                ${totals.original.toLocaleString()}
              </span>
            )}
            <span className="text-base font-black text-[var(--color-text)]">
              ${totals.final.toLocaleString()} COP
            </span>
          </div>

          {totals.hasDiscount && (
            <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold block mb-3 bg-emerald-500/5 px-2.5 py-0.5 rounded-lg border border-emerald-500/10">
              Ahorras ${totals.discount.toLocaleString()} COP
            </span>
          )}

          <button
            type="button"
            onClick={handleBuyBundle}
            className="w-full bg-indigo-600 hover:bg-indigo-550 !text-white text-xs font-bold py-2.5 px-3 rounded-xl active:scale-98 transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            Llevar Outfit Completo
          </button>
        </div>

      </div>
    </div>
  );
}

const mainMock = {
  id: 'main-1',
  name: 'Chaqueta Denim Premium',
  price: 180000,
  image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=200&auto=format&fit=crop&q=80',
  sizes: ['S', 'M', 'L']
};

const relatedMock = [
  {
    id: 'rel-1',
    name: 'Jeans Slim Fit Dark',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&auto=format&fit=crop&q=80',
    sizes: ['30', '32', '34']
  },
  {
    id: 'rel-2',
    name: 'Camiseta Básica Pima',
    price: 60000,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L']
  }
];

export default function CarruselCompletaLookSandbox() {
  const [discount, setDiscount] = useState(15);
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddLook = (items, total) => {
    setSuccessMsg(`¡Look Completo Añadido! (${items.length} prendas, Total: $${total.toLocaleString()} COP)`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const controls = [
    {
      label: 'Aumentar Descuento a 25%',
      type: 'toggle',
      value: discount === 25,
      onChange: (val) => setDiscount(val ? 25 : 15)
    }
  ];

  return (
    <SandboxLayout
      title="Carrusel Completa el Look"
      description="Simulador del carrusel de cross-selling con cálculo de descuento por lote y adición masiva al carrito."
      controls={controls}
    >
      <div className="flex flex-col items-center justify-center p-2 w-80">
        <CarruselCompletaLook
          mainProduct={mainMock}
          relatedProducts={relatedMock}
          discountPercentage={discount}
          onAddLookToCart={handleAddLook}
        />
        {successMsg && (
          <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-bold rounded-xl text-center animate-fade-in w-full">
            {successMsg}
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
