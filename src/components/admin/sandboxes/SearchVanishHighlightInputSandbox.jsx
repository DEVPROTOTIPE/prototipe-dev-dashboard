import React, { useState, useEffect, useRef } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

// Componente Local para simulación autónoma en el sandbox
function LocalSearchVanishHighlightInput({
  value,
  onChange,
  placeholders = ['Buscar por nombre...', 'Buscar categoría...', 'Escribe un término...'],
  rotationInterval = 4000,
  className = ''
}) {
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isFocused || value) return;
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, rotationInterval);
    return () => clearInterval(interval);
  }, [placeholders.length, rotationInterval, isFocused, value]);

  const handleClear = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className={`flex items-center w-full min-h-[44px] px-3.5 rounded-xl border transition-all duration-300 bg-[var(--color-surface)] ${
          isFocused
            ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-md shadow-[var(--color-primary)]/5'
            : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]/50'
        }`}
      >
        <Search className="w-5 h-5 text-[var(--color-text-muted)] shrink-0 mr-2.5" />
        
        <div className="relative flex-1 min-w-0 h-full flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full h-10 bg-transparent text-[var(--color-text)] focus:outline-none placeholder-transparent text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <AnimatePresence>
            {!value && (
              <motion.span
                key={currentPlaceholderIndex}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 0.5 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute left-0 pointer-events-none text-sm text-[var(--color-text-muted)] select-none truncate pr-4"
              >
                {placeholders[currentPlaceholderIndex]}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Utilidad local para resaltar coincidencias
function LocalSearchHighlight({ text = '', query = '' }) {
  if (!query.trim()) return <span>{text}</span>;
  
  const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-semibold rounded px-0.5 animate-pulse"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

const MOCK_ITEMS = [
  { id: 1, name: 'Chaqueta de Cuero Vintage', category: 'Moda y Ropa', price: '$ 280.000' },
  { id: 2, name: 'Camiseta Básica de Algodón Orgánico', category: 'Moda y Ropa', price: '$ 45.000' },
  { id: 3, name: 'Tenis Running Pro H5', category: 'Calzado Deportivo', price: '$ 320.000' },
  { id: 4, name: 'Pantalón Chino Slim Fit', category: 'Moda y Ropa', price: '$ 115.000' },
  { id: 5, name: 'Bolso de Mano Elegante Negro', category: 'Accesorios', price: '$ 180.000' },
  { id: 6, name: 'Gorra Deportiva Ajustable', category: 'Accesorios', price: '$ 35.000' }
];

export default function SearchVanishHighlightInputSandbox() {
  const [query, setQuery] = useState('');
  const [rotationSpeed, setRotationSpeed] = useState('4000');

  const filteredItems = MOCK_ITEMS.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SandboxLayout
      title="SearchVanishHighlightInput"
      description="Input de búsqueda premium con placeholders dinámicos rotativos y resaltado en caliente de coincidencias mediante marcas CSS HSL."
      controls={
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
              Velocidad de Rotación
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['2000', '4000', '6000'].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setRotationSpeed(speed)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    rotationSpeed === speed
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-surface-3)]'
                  }`}
                >
                  {speed}ms
                </button>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            Buscador Premium
          </label>
          <LocalSearchVanishHighlightInput
            value={query}
            onChange={setQuery}
            placeholders={['Buscar chaqueta...', 'Buscar calzado...', 'Prueba "Moda"...']}
            rotationInterval={parseInt(rotationSpeed)}
          />
        </div>

        <div className="space-y-3 bg-[var(--color-surface-2)] p-4 rounded-xl border border-[var(--color-border)]">
          <div className="flex justify-between items-center pb-2 border-b border-[var(--color-border)]">
            <span className="text-xs font-bold text-[var(--color-text-muted)]">
              Resultados ({filteredItems.length})
            </span>
            {query && (
              <span className="text-[10px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium px-2 py-0.5 rounded-full animate-pulse">
                Buscando: "{query}"
              </span>
            )}
          </div>

          {filteredItems.length > 0 ? (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 hover:shadow-sm transition-all"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                      <LocalSearchHighlight text={item.name} query={query} />
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      <LocalSearchHighlight text={item.category} query={query} />
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[var(--color-text)] shrink-0">
                    {item.price}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[var(--color-text-muted)]">
              No se encontraron coincidencias para tu búsqueda.
            </div>
          )}
        </div>
      </div>
    </SandboxLayout>
  );
}
