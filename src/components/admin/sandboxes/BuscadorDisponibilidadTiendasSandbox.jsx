import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente real inline para el Sandbox
function BuscadorDisponibilidadTiendas({
  selectedSize = 'M',
  stores,
  onSelectStore
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStores = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return stores;
    return stores.filter(store => 
      store.name.toLowerCase().includes(query) || 
      store.city.toLowerCase().includes(query) ||
      store.address.toLowerCase().includes(query)
    );
  }, [searchQuery, stores]);

  const getStockBadge = (stockQty) => {
    if (stockQty === 0) {
      return {
        label: 'Agotado',
        classes: 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20'
      };
    }
    if (stockQty <= 3) {
      return {
        label: `Últimas ${stockQty} uds.`,
        classes: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20'
      };
    }
    return {
      label: 'Disponible',
      classes: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20'
    };
  };

  return (
    <div 
      id="buscador-disponibilidad-tiendas-container"
      className="w-full max-w-sm p-5 rounded-2xl bg-[var(--color-surface)]/20 border border-[var(--color-border)] text-[var(--color-text)] shadow-xl backdrop-blur-xl animate-fade-in"
    >
      <div className="mb-4">
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400">Verificar Stock en Tienda</span>
        <h3 className="text-sm font-bold text-[var(--color-text)] mt-0.5">Disponibilidad para Talla {selectedSize}</h3>
      </div>

      {/* Input de Búsqueda */}
      <div className="relative mb-4" id="search-input-wrapper">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          id="store-search-field"
          type="text"
          placeholder="Buscar ciudad o centro comercial..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2 pl-9 pr-8 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)]/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/35 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Listado de Locales */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin" id="stores-results-list">
        {filteredStores.length > 0 ? (
          filteredStores.map(store => {
            const stockQty = store.stock[selectedSize] ?? 0;
            const badge = getStockBadge(stockQty);
            const isClickAndCollectAvailable = stockQty > 0;

            return (
              <div 
                key={store.id}
                className="p-4 bg-[var(--color-bg)]/80 border border-[var(--color-border)] rounded-2xl flex flex-col justify-between gap-3 hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <span className="text-[12px] font-bold text-[var(--color-text)] block leading-tight">{store.name}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)] block mt-1 leading-normal">{store.address}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${badge.classes} shrink-0`}>
                    {badge.label}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[var(--color-text-muted)] border-t border-[var(--color-border)]/40 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {store.hours}
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2 border-t border-[var(--color-border)]/20 mt-1">
                  <a
                    href={store.coords}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] text-[11px] font-bold py-2 rounded-xl text-center flex items-center justify-center gap-1.5 transition-all text-[var(--color-text)]"
                  >
                    Mapa
                  </a>
                  {isClickAndCollectAvailable && onSelectStore && (
                    <button
                      type="button"
                      onClick={() => onSelectStore(store)}
                      className="flex-1 bg-indigo-650 hover:bg-indigo-550 !text-white text-[11px] font-bold py-2 px-3 rounded-xl shadow-lg shadow-indigo-650/10 active:scale-98 transition-all cursor-pointer"
                    >
                      Retirar en local
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 bg-[var(--color-surface-2)]/30 border border-dashed border-[var(--color-border)] rounded-2xl">
            <span className="text-xs text-[var(--color-text-muted)] block font-semibold">No hay sucursales</span>
          </div>
        )}
      </div>
    </div>
  );
}

const STORES_DEFAULT = [
  {
    id: 'store-1',
    name: 'CC Andino - Bogotá',
    city: 'Bogotá',
    address: 'Carrera 11 # 82-71, Local 102',
    phone: '+57 311 000 0001',
    hours: 'Lun - Sáb: 10AM - 8PM',
    stock: { 'S': 5, 'M': 8, 'L': 0, 'XL': 3 },
    coords: 'https://maps.google.com/?q=CC+Andino+Bogota'
  },
  {
    id: 'store-2',
    name: 'Unicentro - Bogotá',
    city: 'Bogotá',
    address: 'Avenida 15 # 124-30, Local 345',
    phone: '+57 311 000 0002',
    hours: 'Lun - Dom: 10AM - 9PM',
    stock: { 'S': 0, 'M': 2, 'L': 4, 'XL': 0 },
    coords: 'https://maps.google.com/?q=Unicentro+Bogota'
  },
  {
    id: 'store-3',
    name: 'El Tesoro - Medellín',
    city: 'Medellín',
    address: 'Carrera 25A # 1A Sur-45, Local 410',
    phone: '+57 311 000 0003',
    hours: 'Lun - Sáb: 10AM - 9PM',
    stock: { 'S': 12, 'M': 15, 'L': 7, 'XL': 8 },
    coords: 'https://maps.google.com/?q=Parque+Comercial+El+Tesoro+Medellin'
  }
];

export default function BuscadorDisponibilidadTiendasSandbox() {
  const [size, setSize] = useState('M');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSelectStore = (store) => {
    setSuccessMsg(`Reserva Click & Collect en: ${store.name} (Talla: ${size})`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const controls = [
    {
      label: 'Talla de Prueba',
      type: 'select',
      value: size,
      onChange: setSize,
      options: ['S', 'M', 'L', 'XL']
    }
  ];

  return (
    <SandboxLayout
      title="Disponibilidad en Tiendas"
      description="Simulador del buscador O2O de stock en sucursales físicas con soporte de Click & Collect."
      controls={controls}
    >
      <div className="flex flex-col items-center justify-center p-2 w-80">
        <BuscadorDisponibilidadTiendas
          selectedSize={size}
          stores={STORES_DEFAULT}
          onSelectStore={handleSelectStore}
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
