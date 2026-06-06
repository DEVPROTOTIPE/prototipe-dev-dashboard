import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SandboxLayout } from './SandboxLayout';

export default function SelectorAtributosSandbox() {
  const [selected, setSelected] = useState({});
  const [layout, setLayout] = useState('chips');
  const [multiSelect, setMultiSelect] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  
  const atributos = {
    Talla: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    Color: ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde'],
    Material: ['Algodón', 'Poliéster', 'Lana'],
  };

  const colorMap = {
    'Negro': '#1e293b', // slate-800
    'Blanco': '#ffffff',
    'Azul': '#3b82f6',
    'Rojo': '#ef4444',
    'Verde': '#10b981',
  };

  const handleSelect = (group, value) => {
    setSelected(prev => {
      if (multiSelect) {
        const curr = prev[group] || [];
        const exists = curr.includes(value);
        return { ...prev, [group]: exists ? curr.filter(v => v !== value) : [...curr, value] };
      }
      return { ...prev, [group]: prev[group] === value ? null : value };
    });
  };

  const isSelected = (group, value) => {
    const s = selected[group];
    return Array.isArray(s) ? s.includes(value) : s === value;
  };

  return (
    <SandboxLayout
      title="Selector de Atributos"
      description="Selector dinámico de variantes de producto (tallas, colores, materiales). Modo chips o dropdown."
      controls={[
        { label: 'Layout', type: 'select', value: layout, options: ['chips', 'dropdown'], onChange: setLayout },
        { label: 'Multi-select', type: 'toggle', value: multiSelect, onChange: setMultiSelect, labels: ['Off', 'On'] },
      ]}
    >
      <div className="space-y-5 w-full text-left">
        {Object.entries(atributos).map(([group, values]) => (
          <div key={group}>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">{group}</p>
            {layout === 'chips' ? (
              <div className="flex flex-wrap gap-2 items-center">
                {values.map(v => {
                  const isColor = group === 'Color';
                  if (isColor) {
                    const active = isSelected(group, v);
                    const colorHex = colorMap[v];
                    return (
                      <button
                        key={v}
                        onClick={() => handleSelect(group, v)}
                        className={`w-9 h-9 rounded-full border transition-all duration-300 cursor-pointer flex items-center justify-center relative ${
                          active
                            ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/10 bg-indigo-500/5'
                            : 'border-[var(--color-border)] hover:border-indigo-500/40 hover:scale-105 bg-transparent'
                        }`}
                        title={v}
                      >
                        <span
                          style={{ backgroundColor: colorHex }}
                          className={`w-6 h-6 rounded-full border border-black/5 block transition-transform duration-300 ${
                            active ? 'scale-100' : 'scale-90 hover:scale-95'
                          }`}
                        />
                        {active && (
                          <motion.span
                            layoutId="activeColorBorder"
                            className="absolute inset-0 rounded-full border-2 border-indigo-500"
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          />
                        )}
                      </button>
                    );
                  }
                  return (
                    <button
                      key={v}
                      onClick={() => handleSelect(group, v)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected(group, v)
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-indigo-500/50 hover:text-[var(--color-text)]'
                      }`}
                    >{v}</button>
                  );
                })}
              </div>
            ) : (
              <div className="relative w-full" style={{ zIndex: openGroup === group ? 50 : 'auto' }}>
                {/* Botón Disparador */}
                <button
                  type="button"
                  onClick={() => setOpenGroup(current => current === group ? null : group)}
                  className="w-full h-11 pl-4 pr-10 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer flex items-center justify-between relative hover:border-indigo-500/50"
                  style={{ borderColor: openGroup === group ? 'var(--color-primary, #6366f1)' : undefined }}
                >
                  <span className="flex items-center gap-2">
                    {group === 'Color' && selected[group] ? (
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: colorMap[selected[group]] }} />
                        <span className="font-semibold">{selected[group]}</span>
                      </div>
                    ) : (
                      <span className={selected[group] ? 'text-[var(--color-text)] font-semibold' : 'text-[var(--color-text-muted)]'}>
                        {selected[group] || `Selecciona ${group}`}
                      </span>
                    )}
                  </span>
                  <span className={`absolute right-3 text-[var(--color-text-muted)] transition-transform duration-200 ${openGroup === group ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} />
                  </span>
                </button>

                {/* Menú Animado Flotante */}
                <AnimatePresence>
                  {openGroup === group && (
                    <>
                      {/* Tap-shield para capturar clics exteriores y cerrar */}
                      <div 
                        className="fixed inset-0 bg-transparent cursor-default z-[48]" 
                        onClick={() => setOpenGroup(null)} 
                      />
                      
                      {/* Lista Desplegable */}
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.12, ease: 'easeOut' }}
                        className="absolute left-0 right-0 mt-1.5 rounded-xl border border-[var(--color-border)] overflow-hidden shadow-xl z-[49] bg-[var(--color-surface)]"
                      >
                        <button
                          type="button"
                          onClick={() => { setSelected(p => ({ ...p, [group]: null })); setOpenGroup(null) }}
                          className="w-full px-4 py-2.5 text-left text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors border-b border-[var(--color-border)]/20 cursor-pointer"
                        >
                          Selecciona {group}
                        </button>
                        
                        {values.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => { setSelected(p => ({ ...p, [group]: v })); setOpenGroup(null) }}
                            className={`w-full px-4 py-2.5 text-left text-xs transition-colors flex items-center justify-between cursor-pointer
                              ${selected[group] === v
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                              }
                            `}
                          >
                            {group === 'Color' ? (
                              <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: colorMap[v] }} />
                                <span className={selected[group] === v ? 'text-white' : 'text-[var(--color-text)]'}>{v}</span>
                              </div>
                            ) : (
                              <span>{v}</span>
                            )}
                            {selected[group] === v && <Check size={14} className="text-white" />}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        ))}
        <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] font-mono text-[10px] text-indigo-400">
          {JSON.stringify(selected, null, 2)}
        </div>
      </div>
    </SandboxLayout>
  );
}
