import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import * as Icons from '../../ui/BrandIcons';

export default function BrandIconsSandbox() {
  const [iconSize, setIconSize] = useState('w-8 h-8');
  const [iconColor, setIconColor] = useState('text-indigo-400');
  const [searchFilter, setSearchFilter] = useState('');

  const sizes = [
    { label: 'Pequeño (16px)', value: 'w-4 h-4' },
    { label: 'Mediano (24px)', value: 'w-6 h-6' },
    { label: 'Grande (32px)', value: 'w-8 h-8' },
    { label: 'Gigante (48px)', value: 'w-12 h-12' }
  ];

  const colors = [
    { label: 'Tema / Slate', value: 'text-slate-200' },
    { label: 'Indigo', value: 'text-indigo-400' },
    { label: 'Esmeralda', value: 'text-emerald-400' },
    { label: 'Púrpura', value: 'text-purple-400' },
    { label: 'Ámbar', value: 'text-amber-400' },
    { label: 'Rojo', value: 'text-red-400' }
  ];

  const iconList = Object.keys(Icons).map(name => ({
    name,
    Component: Icons[name]
  }));

  const filteredIcons = iconList.filter(icon => 
    icon.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <SandboxLayout
      title="Hub de Iconos Atómicos de Marca (BrandIcons)"
      description="Playground interactivo para simular el comportamiento visual de los iconos SVG inline de marca blanca."
      controls={
        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Buscar Icono</label>
            <input 
              type="text" 
              placeholder="Ej: Github..." 
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
            />
          </div>

          {/* Tamaño */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Tamaño</label>
            <div className="grid grid-cols-2 gap-2">
              {sizes.map(s => (
                <button
                  key={s.value}
                  onClick={() => setIconSize(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer truncate ${
                    iconSize === s.value
                      ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Color</label>
            <div className="grid grid-cols-2 gap-2">
              {colors.map(c => (
                <button
                  key={c.value}
                  onClick={() => setIconColor(c.value)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer truncate ${
                    iconColor === c.value
                      ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] min-h-[300px]">
        {filteredIcons.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-slate-500 text-xs italic">
            No se encontraron iconos coincidentes con "{searchFilter}".
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredIcons.map(({ name, Component }) => (
              <div 
                key={name} 
                className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl p-4 flex flex-col items-center justify-center gap-3 hover:border-indigo-500/30 transition-all group"
              >
                <div className={`${iconColor} transition-colors group-hover:scale-110 transition-transform duration-300`}>
                  <Component className={iconSize} />
                </div>
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] font-semibold text-center select-all">
                  {name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
