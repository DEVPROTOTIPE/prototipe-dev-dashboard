import React, { useState, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Recreación inline del componente real para aislamiento del Sandbox
function SelectorTallasColores({
  options = [],
  selectedSize = '',
  selectedColor = '',
  onChange,
  disabled = false
}) {
  const sizes = useMemo(() => {
    const set = new Set(options.map(o => o.size));
    return Array.from(set).filter(Boolean);
  }, [options]);

  const colors = useMemo(() => {
    const map = new Map();
    options.forEach(o => {
      if (o.color && !map.has(o.color)) {
        map.set(o.color, o.colorHex || '#cccccc');
      }
    });
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [options]);

  const isColorAvailable = (colorName) => {
    if (!selectedSize) {
      return options.some(o => o.color === colorName && o.stock > 0);
    }
    return options.some(o => o.color === colorName && o.size === selectedSize && o.stock > 0);
  };

  const isSizeAvailable = (sizeName) => {
    if (!selectedColor) {
      return options.some(o => o.size === sizeName && o.stock > 0);
    }
    return options.some(o => o.size === sizeName && o.color === selectedColor && o.stock > 0);
  };

  const currentVariant = useMemo(() => {
    if (!selectedSize || !selectedColor) return null;
    return options.find(o => o.size === selectedSize && o.color === selectedColor);
  }, [selectedSize, selectedColor, options]);

  return (
    <div className="space-y-5 w-full max-w-sm select-none">
      {colors.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
              Color: <span className="text-[var(--color-text)] normal-case font-bold">{selectedColor || 'No seleccionado'}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5 py-1">
            {colors.map(({ name, hex }) => {
              const available = isColorAvailable(name);
              const isSelected = selectedColor === name;

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => !disabled && onChange({ color: name, size: selectedSize })}
                  disabled={disabled}
                  className="relative p-0.5 rounded-full border border-transparent transition-all hover:scale-105 active:scale-95 group focus:outline-none cursor-pointer"
                  style={{
                    borderColor: isSelected ? 'var(--color-primary)' : 'transparent'
                  }}
                  title={name}
                >
                  <span
                    className="block w-6 h-6 rounded-full border border-black/10 relative shadow-sm"
                    style={{ backgroundColor: hex }}
                  >
                    <AnimatePresence>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center bg-black/25 rounded-full"
                        >
                          <Check size={12} className="text-white" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!available && (
                      <span className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
                        <span className="w-6 h-0.5 bg-red-500/70 rotate-45 transform absolute" />
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
              Talla: <span className="text-[var(--color-text)] normal-case font-bold">{selectedSize || 'No seleccionada'}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5 py-1">
            {sizes.map(name => {
              const available = isSizeAvailable(name);
              const isSelected = selectedSize === name;

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => !disabled && onChange({ color: selectedColor, size: name })}
                  disabled={disabled}
                  className={`relative px-3.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer focus:outline-none ${
                    isSelected
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg shadow-indigo-600/10'
                      : available
                      ? 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)] hover:scale-105 active:scale-95'
                      : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)]/50 text-[var(--color-text-muted)]/40 cursor-not-allowed line-through'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {selectedSize && selectedColor && currentVariant && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className={`border rounded-2xl p-3 flex items-start gap-2.5 ${
              currentVariant.stock === 0
                ? 'bg-red-500/5 border-red-500/20 text-red-400'
                : currentVariant.stock <= 3
                ? 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
            }`}
          >
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold block">
                {currentVariant.stock === 0
                  ? 'Agotado'
                  : currentVariant.stock <= 3
                  ? `¡Últimas unidades! (${currentVariant.stock} disponibles)`
                  : 'Disponible en tienda'}
              </span>
              <span className="text-[9px] text-[var(--color-text-muted)] block">
                Precio unitario: ${currentVariant.price.toLocaleString()} COP
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const sampleOptions = [
  { id: '1', size: 'S', color: 'Negro', colorHex: '#111111', stock: 5, price: 85000 },
  { id: '2', size: 'M', color: 'Negro', colorHex: '#111111', stock: 10, price: 85000 },
  { id: '3', size: 'L', color: 'Negro', colorHex: '#111111', stock: 0, price: 85000 },
  { id: '4', size: 'S', color: 'Rojo', colorHex: '#dc2626', stock: 2, price: 90000 },
  { id: '5', size: 'M', color: 'Rojo', colorHex: '#dc2626', stock: 8, price: 90000 },
  { id: '6', size: 'L', color: 'Rojo', colorHex: '#dc2626', stock: 4, price: 90000 },
  { id: '7', size: 'S', color: 'Blanco', colorHex: '#ffffff', stock: 0, price: 85000 },
  { id: '8', size: 'M', color: 'Blanco', colorHex: '#ffffff', stock: 0, price: 85000 },
  { id: '9', size: 'L', color: 'Blanco', colorHex: '#ffffff', stock: 12, price: 85000 },
];

export default function SelectorTallasColoresSandbox() {
  const [selectedSize, setSelectedSize] = useState('S');
  const [selectedColor, setSelectedColor] = useState('Negro');
  const [disabled, setDisabled] = useState(false);

  const handleVariantChange = ({ size, color }) => {
    setSelectedSize(size);
    setSelectedColor(color);
  };

  const controls = [
    {
      label: 'Deshabilitar',
      type: 'toggle',
      value: disabled,
      onChange: setDisabled
    },
    {
      label: 'Limpiar',
      type: 'toggle',
      value: !selectedSize && !selectedColor,
      onChange: (val) => {
        if (val) {
          setSelectedSize('');
          setSelectedColor('');
        } else {
          setSelectedSize('S');
          setSelectedColor('Negro');
        }
      },
      labels: ['Seleccionado', 'Vacio']
    }
  ];

  return (
    <SandboxLayout
      title="Selector de Tallas y Colores"
      description="Simulador interactivo del selector de variantes de prendas de marca blanca con control de stock e inventario dinámico."
      controls={controls}
    >
      <div className="flex flex-col items-center justify-center p-2 w-72">
        <SelectorTallasColores
          options={sampleOptions}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          onChange={handleVariantChange}
          disabled={disabled}
        />
      </div>
    </SandboxLayout>
  );
}
