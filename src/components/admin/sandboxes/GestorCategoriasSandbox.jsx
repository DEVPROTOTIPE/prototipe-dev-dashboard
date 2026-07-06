import React, { useState, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';

export default function GestorCategoriasSandbox() {
  // Diccionario de íconos SVG autocontenidos
  const SVG_ICONS = {
    Plus: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    Trash2: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    ),
    Edit2: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
    ),
    Search: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    Tag: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    Shirt: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20.38 3.46L16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a2 2 0 0 0 .99 1.42L7 12v7a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-7l3.15-1.42a2 2 0 0 0 .99-1.42l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      </svg>
    ),
    Footprints: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4 16v-2.38C4 11.5 5.88 9.85 6 7.07l.09-2.13A1.91 1.91 0 0 1 8.18 3.2a1.91 1.91 0 0 1 2 1.62l.6 5.1c.14 1.2-.3 2.45-1.2 3.32L8 15" />
        <path d="M12 11.5V9.12c0-2.13 1.88-3.78 2-6.56l.09-2.13A1.91 1.91 0 0 1 16.18-1.3c1 .09 1.91 1.62 2 1.62l.6 5.1c.14 1.2-.3 2.45-1.2 3.32L16 10.5" />
      </svg>
    ),
    Gem: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M6 3h12l4 6-10 12L2 9z" />
        <path d="M11 3 8 9l4 12 4-12-3-6" />
        <path d="M2 9h20" />
      </svg>
    )
  };

  const CATEGORY_ICONS = [
    { name: 'Shirt', label: 'Moda y Ropa', tags: ['ropa', 'camisa', 'moda', 'vestir'] },
    { name: 'Footprints', label: 'Calzado', tags: ['zapatos', 'tenis', 'botas', 'calzado'] },
    { name: 'Gem', label: 'Joyas y Accesorios', tags: ['joyas', 'accesorios', 'gema'] },
    { name: 'Tag', label: 'General / Oferta', tags: ['etiqueta', 'descuento', 'general'] }
  ];

  const [categories, setCategories] = useState([
    { id: '1', nombre: 'Calzado', iconName: 'Footprints' },
    { id: '2', nombre: 'Camisetas', iconName: 'Shirt' },
    { id: '3', nombre: 'Accesorios', iconName: 'Gem' }
  ]);

  const [nombre, setNombre] = useState('');
  const [iconName, setIconName] = useState('Tag');
  const [editingId, setEditingId] = useState(null);
  const [searchTermIcon, setSearchTermIcon] = useState('');

  const filteredIcons = useMemo(() => {
    const term = searchTermIcon.toLowerCase().trim();
    if (!term) return CATEGORY_ICONS;
    return CATEGORY_ICONS.filter(icon => 
      icon.name.toLowerCase().includes(term) ||
      icon.label.toLowerCase().includes(term) ||
      icon.tags.some(tag => tag.includes(term))
    );
  }, [searchTermIcon]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (editingId) {
      setCategories(prev => prev.map(cat => cat.id === editingId ? { ...cat, nombre: nombre.trim(), iconName } : cat));
      setEditingId(null);
    } else {
      setCategories(prev => [...prev, { id: String(Date.now()), nombre: nombre.trim(), iconName }]);
    }
    setNombre('');
    setIconName('Tag');
    setSearchTermIcon('');
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setNombre(cat.nombre);
    setIconName(cat.iconName || 'Tag');
  };

  const handleDelete = (id) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setNombre('');
      setIconName('Tag');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setNombre('');
    setIconName('Tag');
    setSearchTermIcon('');
  };

  const TagIcon = SVG_ICONS.Tag;
  const SearchIcon = SVG_ICONS.Search;
  const PlusIcon = SVG_ICONS.Plus;

  return (
    <SandboxLayout
      title="Gestor de Categorías (CategoryManager)"
      description="Administrador interactivo de categorías con selector integrado de iconos SVG nativos."
      controls={[
        { label: 'Total Cat.', type: 'number', value: String(categories.length), onChange: () => {} }
      ]}
    >
      <div className="bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-border)] shadow-sm space-y-4 w-full text-left">
        <h2 className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
          <TagIcon className="w-4 h-4 text-indigo-500" /> Categorías del Catálogo
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex gap-1.5">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Camisetas, Jeans..."
              className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 h-9 text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500 transition-colors placeholder-[var(--color-text-muted)]/50"
            />
            {editingId ? (
              <div className="flex gap-1">
                <button type="submit" className="h-9 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all text-[10px] cursor-pointer">Guardar</button>
                <button type="button" onClick={handleCancel} className="h-9 px-3 bg-[var(--color-surface-2)] text-[var(--color-text)] rounded-xl font-bold transition-all text-[10px] cursor-pointer">X</button>
              </div>
            ) : (
              <button type="submit" disabled={!nombre.trim()} className="h-9 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-1 transition-all text-[10px] disabled:opacity-50 cursor-pointer">
                <PlusIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Icono de la Categoría</label>
              <span className="text-[8px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full">
                {CATEGORY_ICONS.find(i => i.name === iconName)?.label || iconName}
              </span>
            </div>

            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={searchTermIcon}
                onChange={(e) => setSearchTermIcon(e.target.value)}
                placeholder="Buscar ícono..."
                className="w-full h-7 pl-7 pr-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-4 gap-1 p-1.5 bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] max-h-24 overflow-y-auto no-scrollbar">
              {filteredIcons.map(({ name, label }) => {
                const IconComp = SVG_ICONS[name] || SVG_ICONS.Tag;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setIconName(name)}
                    className={`h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                      iconName === name
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-indigo-500/40'
                    }`}
                    title={label}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
          {categories.map(cat => {
            const IconComp = SVG_ICONS[cat.iconName] || SVG_ICONS.Tag;
            return (
              <div key={cat.id} className="flex items-center justify-between p-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-surface)] flex items-center justify-center text-indigo-500 border border-[var(--color-border)]">
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-[var(--color-text)] text-xs truncate">{cat.nombre}</span>
                </div>
                <div className="flex gap-0.5">
                  <button onClick={() => handleEdit(cat)} className="w-6 h-6 rounded flex items-center justify-center text-[var(--color-text-muted)] hover:text-indigo-400 cursor-pointer">
                    <SVG_ICONS.Edit2 className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="w-6 h-6 rounded flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-400 cursor-pointer">
                    <SVG_ICONS.Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SandboxLayout>
  );
}
