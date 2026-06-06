import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

export default function TarjetaProductoSandbox() {
  const [layout, setLayout] = useState('grid');
  const [isPromo, setIsPromo] = useState(false);
  const [outOfStock, setOutOfStock] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  const product = { name: 'Camiseta Premium Oversize', price: 89900, originalPrice: 120000, image: null };

  return (
    <SandboxLayout
      title="Tarjeta de Producto"
      description="Tarjeta adaptativa con layout grid/list, glow de neón para promociones, favoritos y estado de agotado."
      controls={[
        { label: 'Layout', type: 'select', value: layout, options: ['grid', 'list'], onChange: setLayout },
        { label: 'Promoción', type: 'toggle', value: isPromo, onChange: setIsPromo, labels: ['No', 'Sí'] },
        { label: 'Agotado', type: 'toggle', value: outOfStock, onChange: setOutOfStock, labels: ['No', 'Sí'] },
        { label: 'Skeleton', type: 'toggle', value: loading, onChange: setLoading, labels: ['Off', 'On'] },
      ]}
    >
      <div className="w-full text-left">
        {loading ? (
          /* Skeleton shimmer */
          <div className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden ${layout === 'list' ? 'flex gap-3 p-3' : 'p-0'}`}>
            <div className={`bg-slate-800/10 dark:bg-slate-800 animate-pulse ${layout === 'list' ? 'w-20 h-20 rounded-xl shrink-0' : 'w-full h-40 rounded-t-2xl'}`} />
            <div className={`space-y-2 ${layout === 'list' ? 'flex-1 py-1' : 'p-3'}`}>
              <div className="h-3 bg-slate-800/10 dark:bg-slate-800 rounded animate-pulse w-3/4" />
              <div className="h-2.5 bg-slate-800/10 dark:bg-slate-800 rounded animate-pulse w-1/2" />
              <div className="h-5 bg-slate-800/10 dark:bg-slate-800 rounded animate-pulse w-1/3" />
            </div>
          </div>
        ) : (
          <div className={`bg-[var(--color-surface)] border rounded-2xl overflow-hidden transition-all ${
            isPromo ? 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-[var(--color-border)]'
          } ${outOfStock ? 'grayscale opacity-70' : ''} ${layout === 'list' ? 'flex gap-3 p-3 items-center' : ''}`}>
            {/* Imagen */}
            <div className={`bg-gradient-to-br from-indigo-900/30 to-violet-900/30 flex items-center justify-center relative ${layout === 'list' ? 'w-20 h-20 rounded-xl shrink-0' : 'h-40'}`}>
              <span className="text-4xl">{outOfStock ? '😔' : isPromo ? '🔥' : '👕'}</span>
              {isPromo && !outOfStock && <span className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-lg">-25%</span>}
              <button onClick={() => setIsFav(!isFav)} className="absolute top-2 right-2 cursor-pointer border-none bg-transparent">
                <Star size={14} className={isFav ? 'text-amber-400 fill-amber-400' : 'text-slate-500'} />
              </button>
              {outOfStock && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><span className="text-[10px] font-black text-white bg-black/60 px-2 py-1 rounded-lg">AGOTADO</span></div>}
            </div>
            {/* Info */}
            <div className={`${layout === 'list' ? 'flex-1' : 'p-3'}`}>
              <p className="text-xs font-bold text-[var(--color-text)] line-clamp-1">{product.name}</p>
              {isPromo && <p className="text-[9px] text-[var(--color-text-muted)] line-through">${product.originalPrice.toLocaleString('es-CO')}</p>}
              <p className={`text-sm font-black mt-0.5 ${isPromo ? 'text-indigo-400' : 'text-[var(--color-text)]'}`}>
                ${product.price.toLocaleString('es-CO')}
              </p>
              {!outOfStock && layout !== 'list' && (
                <button className="mt-2 w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-xl cursor-pointer transition-all border-none">
                  Agregar al Carrito
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
