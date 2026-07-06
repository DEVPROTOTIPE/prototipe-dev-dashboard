import React, { useState, useRef, useEffect } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X } from 'lucide-react';

// Componente Local para simulación autónoma en el sandbox
function LocalAnimatedSearchDropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Selecciona una opción...',
  searchPlaceholder = 'Filtrar opciones...',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Botón Trigger Principal */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full min-h-[44px] px-3.5 rounded-xl border bg-[var(--color-surface)] transition-all duration-300 ${
          isOpen
            ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-md'
            : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]/50'
        }`}
      >
        <span className={`text-sm ${selectedOption ? 'text-[var(--color-text)] font-medium' : 'text-[var(--color-text-muted)]'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--color-primary)]' : ''}`} />
      </button>

      {/* Menú Desplegable Flotante */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 w-full mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden"
          >
            {/* Buscador Interno */}
            <div className="flex items-center px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
              <Search className="w-4 h-4 text-[var(--color-text-muted)] mr-2 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs text-[var(--color-text)] focus:outline-none placeholder-[var(--color-text-muted)]/60"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="p-0.5 rounded text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Listado de Opciones */}
            <div className="max-h-[200px] overflow-y-auto scrollbar-thin py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`flex items-center justify-between w-full px-3.5 py-2 text-xs text-left transition-colors ${
                        isSelected
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold'
                          : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                      }`}
                    >
                      <span>{opt.label}</span>
                    </button>
                  );
                })
              ) : (
                <div className="px-3.5 py-4 text-center text-xs text-[var(--color-text-muted)]">
                  No se encontraron resultados
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const VERTICALES_OPCIONES = [
  { value: 'retail_clothing', label: '🛍️ Ropa y Retail Tradicional' },
  { value: 'technical_services', label: '⚙️ Tornerías y Mecanizado' },
  { value: 'refrigeration_ac', label: '❄️ Refrigeración y Climatización' },
  { value: 'contractors', label: '📐 Contratistas y Construcción' },
  { value: 'machinery_rental', label: '🚜 Alquiler de Maquinaria' },
  { value: 'carpentry', label: '🪚 Carpinterías y Muebles' },
  { value: 'laundry', label: '🧺 Lavanderías y Tintorerías' },
  { value: 'furniture_repair', label: '🛋️ Restauración de Muebles' },
  { value: 'wellness_podology', label: '💆 Estética y Podología' },
  { value: 'grocery_food', label: '🍎 Minimarkets y Alimentos' }
];

export default function AnimatedSearchDropdownSandbox() {
  const [selectedVertical, setSelectedVertical] = useState('');

  return (
    <SandboxLayout
      title="AnimatedSearchDropdown"
      description="Selector de opciones premium con filtrado en tiempo real para listas muy extensas de elementos."
      controls={
        <div className="space-y-4">
          <div className="p-3 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] space-y-1">
            <span className="font-semibold text-[var(--color-text)]">Valor Seleccionado:</span>
            <p className="font-mono">{selectedVertical || 'Ninguno'}</p>
          </div>
        </div>
      }
    >
      <div className="w-full max-w-md mx-auto space-y-4 min-h-[300px]">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            Nicho / Vertical de Negocio
          </label>
          <LocalAnimatedSearchDropdown
            options={VERTICALES_OPCIONES}
            value={selectedVertical}
            onChange={setSelectedVertical}
            placeholder="Selecciona la vertical..."
            searchPlaceholder="Filtrar por palabra clave..."
          />
        </div>

        <div className="p-3 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
          <strong className="text-[var(--color-text)]">Comportamiento esperado:</strong> El menú flotante se proyecta por encima de otras tarjetas mediante un control exacto de <span className="font-semibold">z-index</span>, y se colapsa instantáneamente si haces click fuera de su caja contenedora.
        </div>
      </div>
    </SandboxLayout>
  );
}
