import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Scale, Info, Weight, ChevronRight, Check } from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';

const ALAMBRE_TIPOS = [
  {
    id: 'puas',
    name: 'Alambre de Púas',
    description: 'Cercados ganaderos y seguridad perimetral.',
    icon: Shield,
    color: 'from-amber-500/20 to-orange-500/20',
    borderClass: 'border-orange-500/30',
    basePricePerMeter: 450, // COP
    densityPerMeter: 0.085, // kg
    calibres: [
      { value: '12.5', label: 'Calibre 12.5 (2.51 mm) - Alta Tensión', multPrice: 1.2, resistance: '400 kgf' },
      { value: '14', label: 'Calibre 14 (2.03 mm) - Tradicional', multPrice: 1.0, resistance: '350 kgf' },
      { value: '16', label: 'Calibre 16 (1.65 mm) - Suave/Manejable', multPrice: 0.85, resistance: '280 kgf' }
    ]
  },
  {
    id: 'galvanizado',
    name: 'Alambre Galvanizado',
    description: 'Cercados lisos, viñedos, tutorado y amarres.',
    icon: Sparkles,
    color: 'from-blue-500/20 to-indigo-500/20',
    borderClass: 'border-indigo-500/30',
    basePricePerMeter: 380, // COP
    densityPerMeter: 0.065, // kg
    calibres: [
      { value: '10', label: 'Calibre 10 (3.40 mm) - Industrial', multPrice: 1.4, resistance: '520 kgf' },
      { value: '12', label: 'Calibre 12 (2.77 mm) - Estructural', multPrice: 1.15, resistance: '450 kgf' },
      { value: '14', label: 'Calibre 14 (2.03 mm) - Multipropósito', multPrice: 0.95, resistance: '380 kgf' },
      { value: '16', label: 'Calibre 16 (1.65 mm) - Amarre y Mallas', multPrice: 0.8, resistance: '290 kgf' }
    ]
  },
  {
    id: 'concertina',
    name: 'Alambre Concertina (Cuchillas)',
    description: 'Máxima seguridad militar y residencial.',
    icon: Scale,
    color: 'from-rose-500/20 to-red-500/20',
    borderClass: 'border-rose-500/30',
    basePricePerMeter: 1200, // COP
    densityPerMeter: 0.12, // kg
    calibres: [
      { value: '12', label: 'Calibre 12 (2.77 mm) + Cuchilla Galvanizada', multPrice: 1.3, resistance: '650 kgf' },
      { value: '14', label: 'Calibre 14 (2.03 mm) + Cuchilla de Acero', multPrice: 1.0, resistance: '580 kgf' }
    ]
  }
];

export default function SelectorCalibreAlambre({
  onConfirm,
  currencySymbol = '$',
  className = ''
}) {
  const [selectedTipoId, setSelectedTipoId] = useState('puas');
  const [length, setLength] = useState(100); // longitud por defecto
  
  // Buscar tipo seleccionado
  const selectedTipo = useMemo(() => {
    return ALAMBRE_TIPOS.find(t => t.id === selectedTipoId) || ALAMBRE_TIPOS[0];
  }, [selectedTipoId]);

  // Calibre seleccionado
  const [selectedCalibreVal, setSelectedCalibreVal] = useState(selectedTipo.calibres[0].value);

  // Asegurar que al cambiar de tipo, el calibre sea válido para el nuevo tipo
  React.useEffect(() => {
    const isValValid = selectedTipo.calibres.some(c => c.value === selectedCalibreVal);
    if (!isValValid) {
      setSelectedCalibreVal(selectedTipo.calibres[0].value);
    }
  }, [selectedTipo, selectedCalibreVal]);

  const selectedCalibre = useMemo(() => {
    return selectedTipo.calibres.find(c => c.value === selectedCalibreVal) || selectedTipo.calibres[0];
  }, [selectedTipo, selectedCalibreVal]);

  // Cálculos dinámicos
  const calculations = useMemo(() => {
    const basePrice = selectedTipo.basePricePerMeter;
    const mult = selectedCalibre.multPrice;
    const pricePerMeter = Math.round(basePrice * mult);
    const totalPrice = pricePerMeter * length;
    const totalWeight = parseFloat((selectedTipo.densityPerMeter * (12.5 / parseFloat(selectedCalibre.value)) * length).toFixed(2));
    
    return {
      pricePerMeter,
      totalPrice,
      totalWeight
    };
  }, [selectedTipo, selectedCalibre, length]);

  // Opciones de calibres formateadas para el CustomSelect
  const calibreOptions = useMemo(() => {
    return selectedTipo.calibres.map(c => ({
      value: c.value,
      label: c.label
    }));
  }, [selectedTipo]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm({
        tipo: selectedTipo.name,
        tipoId: selectedTipo.id,
        calibre: selectedCalibre.value,
        calibreLabel: selectedCalibre.label,
        longitud: length,
        pesoEstimadoKg: calculations.totalWeight,
        precioTotal: calculations.totalPrice,
        resistencia: selectedCalibre.resistance
      });
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-2xl ${className}`}>
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border-b border-[var(--color-border)]">
        <h3 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <Shield className="w-6 h-6 text-violet-500" />
          Configurador de Calibre y Alambre Rural
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Selecciona el tipo de cercado, calibre y longitud para obtener el desglose técnico y cotización estimada.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left column - Selectors */}
        <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-[var(--color-border)] space-y-6">
          {/* Tipo de Alambre */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-3">
              1. Tipo de Alambre Cercado
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ALAMBRE_TIPOS.map(tipo => {
                const IconComponent = tipo.icon;
                const isSelected = selectedTipoId === tipo.id;
                return (
                  <button
                    key={tipo.id}
                    onClick={() => {
                      setSelectedTipoId(tipo.id);
                      setSelectedCalibreVal(tipo.calibres[0].value);
                    }}
                    className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 relative group cursor-pointer h-auto min-h-[140px] ${
                      isSelected
                        ? `bg-gradient-to-br ${tipo.color} border-violet-500 shadow-md ring-1 ring-violet-500`
                        : 'bg-[var(--color-surface-2)] border-[var(--color-border)] hover:bg-[var(--color-surface-3)]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className={`p-2 rounded-xl bg-[var(--color-surface)] border ${tipo.borderClass}`}>
                        <IconComponent className="w-5 h-5 text-violet-500" />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-sm text-[var(--color-text)] mt-2">
                      {tipo.name}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] mt-1 leading-snug line-clamp-2">
                      {tipo.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calibre (Uso de CustomSelect según estándar) */}
          <div>
            <div className="flex items-end h-8 mb-2 leading-tight">
              <label className="block text-sm font-semibold text-[var(--color-text)]">
                2. Calibre del Alambre (Diámetro)
              </label>
            </div>
            <CustomSelect
              value={selectedCalibreVal}
              onChange={setSelectedCalibreVal}
              options={calibreOptions}
            />
            <div className="mt-2.5 p-3 rounded-xl bg-violet-500/5 border border-violet-500/10 flex items-start gap-2">
              <Info className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                <span className="font-semibold text-violet-400">Especificación:</span> Resistencia promedio a la tracción de esta configuración es de aproximadamente <span className="font-semibold text-[var(--color-text)]">{selectedCalibre.resistance}</span>. A menor calibre (número AWG), mayor es el grosor del alambre y su durabilidad.
              </p>
            </div>
          </div>

          {/* Longitud */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-[var(--color-text)]">
                3. Longitud del Cercado
              </label>
              <div className="flex items-center gap-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-1.5">
                <input
                  type="number"
                  value={length}
                  onChange={(e) => {
                    const val = Math.max(10, Math.min(5000, Number(e.target.value)));
                    setLength(val);
                  }}
                  className="w-16 bg-transparent border-0 outline-none text-right font-bold text-[var(--color-text)] p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs font-semibold text-[var(--color-text-muted)] border-l border-[var(--color-border)] pl-2">
                  metros
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-2 bg-[var(--color-surface-3)] rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
            </div>
            <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] font-mono">
              <span>20 m</span>
              <span>250 m</span>
              <span>500 m</span>
              <span>750 m</span>
              <span>1000 m</span>
            </div>
          </div>
        </div>

        {/* Right column - Summary & Calculation */}
        <div className="lg:col-span-5 p-6 bg-[var(--color-surface-2)] flex flex-col justify-between">
          <div className="space-y-6">
            <label className="block text-sm font-semibold text-[var(--color-text)]">
              Desglose Técnico Estimado
            </label>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 space-y-4">
              {/* Peso Estimado */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-2">
                  <Weight className="w-4 h-4 text-violet-500 shrink-0" />
                  <div>
                    <span className="text-xs text-[var(--color-text-muted)] block">Peso Total Estimado</span>
                    <span className="text-xs text-[var(--color-text-muted)] block font-mono text-[10px]">Carga para transporte</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[var(--color-text)] whitespace-nowrap">
                    {calculations.totalWeight} kg
                  </span>
                </div>
              </div>

              {/* Resistencia */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-500 shrink-0" />
                  <div>
                    <span className="text-xs text-[var(--color-text-muted)] block">Resistencia Ruptura</span>
                    <span className="text-xs text-[var(--color-text-muted)] block font-mono text-[10px]">Tensión mecánica</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-violet-400">
                    {selectedCalibre.resistance}
                  </span>
                </div>
              </div>

              {/* Precio por metro */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-violet-500 shrink-0" />
                  <div>
                    <span className="text-xs text-[var(--color-text-muted)] block">Precio por Metro</span>
                    <span className="text-xs text-[var(--color-text-muted)] block font-mono text-[10px]">Configuración activa</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-[var(--color-text)] whitespace-nowrap">
                    {currencySymbol} {calculations.pricePerMeter.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 rounded-2xl p-4">
              <span className="text-xs text-violet-400 block font-medium">Cotización Total Proyectada</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-[var(--color-text)]">
                  {currencySymbol} {calculations.totalPrice.toLocaleString('es-CO')}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">COP</span>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-2 leading-relaxed">
                *Los precios son de referencia comercial. Pueden variar según el fabricante, tipo de recubrimiento de zinc (Clase I o III) y cantidad de rollos solicitados.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleConfirm}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 !text-white font-semibold rounded-xl shadow-lg shadow-violet-600/20 transition-all duration-200 cursor-pointer"
            >
              Confirmar Selección Técnica
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
