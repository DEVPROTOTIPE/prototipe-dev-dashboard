import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Save, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  AlertCircle 
} from 'lucide-react';
import { useAlertConfirm } from '../common/AlertConfirmContext';
import CustomSelect from '../ui/CustomSelect';
import { CLI_URL } from '../../config';

export default function NichesManagerPanel({ showToast, onNichesUpdated, cliUrl = CLI_URL }) {
  const { showConfirm } = useAlertConfirm();
  const [niches, setNiches] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNiche, setExpandedNiche] = useState(null);

  // Estados del Formulario (Crear / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [nicheId, setNicheId] = useState('');
  const [nicheName, setNicheName] = useState('');
  const [nicheEmoji, setNicheEmoji] = useState('💼');
  const [nicheAttributes, setNicheAttributes] = useState([]);

  // Estados para añadir atributo al nicho actual
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrLabel, setNewAttrLabel] = useState('');
  const [newAttrType, setNewAttrType] = useState('text');
  const [newAttrOptions, setNewAttrOptions] = useState('');
  const [newAttrPlaceholder, setNewAttrPlaceholder] = useState('');

  useEffect(() => {
    loadNiches();
  }, []);

  const loadNiches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${cliUrl}/api/niches`);
      if (res.ok) {
        const data = await res.json();
        setNiches(data);
        if (onNichesUpdated) onNichesUpdated();
      } else {
        showToast('Error al cargar la lista de nichos.', { type: 'error' });
      }
    } catch (err) {
      showToast('No se pudo conectar con el servidor CLI.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setNicheId('');
    setNicheName('');
    setNicheEmoji('💼');
    setNicheAttributes([]);
    resetAttributeForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (id, data) => {
    setIsEditing(true);
    setEditingId(id);
    setNicheId(id);
    setNicheName(data.name);
    setNicheEmoji(data.emoji || '💼');
    setNicheAttributes([...(data.attributes || [])]);
    resetAttributeForm();
    setIsModalOpen(true);
  };

  const resetAttributeForm = () => {
    setNewAttrName('');
    setNewAttrLabel('');
    setNewAttrType('text');
    setNewAttrOptions('');
    setNewAttrPlaceholder('');
  };

  const handleAddAttribute = () => {
    if (!newAttrName || !newAttrLabel) {
      showToast('El nombre técnico y etiqueta son obligatorios.', { type: 'warning' });
      return;
    }
    const cleanName = newAttrName.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    
    // Validar duplicados
    if (nicheAttributes.some(attr => attr.name === cleanName)) {
      showToast('Ya existe un atributo con ese nombre técnico.', { type: 'warning' });
      return;
    }

    const newAttr = {
      name: cleanName,
      label: newAttrLabel,
      type: newAttrType
    };

    if (newAttrType === 'select') {
      newAttr.options = newAttrOptions.split(',').map(o => o.trim()).filter(Boolean);
    } else {
      if (newAttrPlaceholder) {
        newAttr.placeholder = newAttrPlaceholder;
      }
    }

    setNicheAttributes([...nicheAttributes, newAttr]);
    resetAttributeForm();
  };

  const handleRemoveAttribute = (index) => {
    setNicheAttributes(nicheAttributes.filter((_, idx) => idx !== index));
  };

  const handleSaveNiche = async () => {
    if (!nicheId || !nicheName) {
      showToast('El ID y nombre son obligatorios.', { type: 'warning' });
      return;
    }

    const cleanId = nicheId.toLowerCase().replace(/[^a-z0-9_-]/g, '');

    const payload = {
      id: cleanId,
      name: nicheName,
      emoji: nicheEmoji,
      attributes: nicheAttributes
    };

    try {
      const url = isEditing ? `${cliUrl}/api/niches/${editingId}` : `${cliUrl}/api/niches`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(isEditing ? 'Nicho actualizado con éxito' : 'Nicho creado con éxito', { type: 'success' });
        setIsModalOpen(false);
        loadNiches();
      } else {
        const err = await res.json();
        showToast(err.error || 'Error al guardar el nicho.', { type: 'error' });
      }
    } catch (e) {
      showToast('Fallo en la comunicación de red.', { type: 'error' });
    }
  };

  const handleDeleteNiche = (id, name) => {
    showConfirm({
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar la vertical de negocio "${name}" (${id})? Esta acción es irreversible y podría causar discrepancias en clientes configurados con este nicho.`,
      variant: 'error',
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          const res = await fetch(`${cliUrl}/api/niches/${id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('Nicho eliminado correctamente.', { type: 'success' });
            loadNiches();
          } else {
            showToast('No se pudo eliminar el nicho.', { type: 'error' });
          }
        } catch (e) {
          showToast('Error de red al intentar eliminar.', { type: 'error' });
        }
      }
    });
  };

  const filteredNicheKeys = Object.keys(niches).filter(key => {
    const data = niches[key];
    const query = searchQuery.toLowerCase();
    return (
      key.toLowerCase().includes(query) ||
      data.name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Cabecera & Barra de Búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 flex items-center justify-center">
            <Store size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--color-text)]">Gestión de Verticales de Negocio</h3>
            <p className="text-[10px] text-[var(--color-text-muted)] font-medium">Administra los nichos comerciales configurados en el CLI Bridge (`niches.json` / `niches_metadata.json`).</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Campo de Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" size={14} />
            <input
              type="text"
              placeholder="Buscar nicho..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-56 text-xs rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
            />
          </div>

          {/* Botón Agregar */}
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/10 hover:shadow-md text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border border-indigo-500/20"
          >
            <Plus size={14} />
            <span>Agregar Nicho</span>
          </button>
        </div>
      </div>

      {/* Grid de Nichos */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl text-[var(--color-text-muted)] font-semibold text-xs gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Cargando configuraciones de nichos...</span>
        </div>
      ) : filteredNicheKeys.length === 0 ? (
        <div className="p-12 text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl text-[var(--color-text-muted)] font-semibold text-xs">
          No se encontraron verticales de negocio registradas o coincidentes.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredNicheKeys.map(key => {
            const data = niches[key];
            const isExpanded = expandedNiche === key;
            const attrCount = (data.attributes || []).length;

            return (
              <div 
                key={key} 
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:border-[var(--color-primary)]/20 hover:shadow-md transition-all duration-300 relative overflow-hidden"
              >
                <div>
                  {/* Encabezado del Nicho */}
                  <div className="flex items-start justify-between gap-2 border-b border-[var(--color-border)] pb-3.5 mb-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0 select-none">{data.emoji || '💼'}</span>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-[var(--color-text)] truncate">{data.name}</h4>
                        <span className="text-[9px] font-mono font-bold text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded-lg border border-[var(--color-border)]">
                          {key}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(key, data)}
                        title="Editar nicho"
                        className="p-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/30 hover:text-indigo-400 rounded-lg text-[var(--color-text-muted)] transition-colors cursor-pointer"
                      >
                        <Edit3 size={11} />
                      </button>
                      <button
                        onClick={() => handleDeleteNiche(key, data.name)}
                        title="Eliminar nicho"
                        className="p-1.5 bg-red-500/5 border border-red-500/10 hover:border-red-500/30 hover:text-red-400 rounded-lg text-[var(--color-text-muted)] transition-colors cursor-pointer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Detalle colapsable de atributos */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                      <span>Atributos / Propiedades ({attrCount})</span>
                      <button
                        onClick={() => setExpandedNiche(isExpanded ? null : key)}
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                      >
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>

                    {isExpanded ? (
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 py-1 scrollbar-thin">
                        {(data.attributes || []).map((attr, idx) => (
                          <div 
                            key={idx} 
                            className="p-2.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] font-bold flex flex-col gap-0.5 text-[var(--color-text)]"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-indigo-400">{attr.label}</span>
                              <span className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[8px] border border-[var(--color-border)] font-mono uppercase">
                                {attr.type}
                              </span>
                            </div>
                            <span className="text-[8px] font-mono text-[var(--color-text-muted)]">Clave: {attr.name}</span>
                            {attr.type === 'select' && (
                              <span className="text-[8px] font-mono text-[var(--color-text-muted)] truncate">Opciones: {attr.options?.join(', ')}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {(data.attributes || []).slice(0, 3).map((attr, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[9px] font-bold text-[var(--color-text-muted)]"
                          >
                            {attr.label}
                          </span>
                        ))}
                        {attrCount > 3 && (
                          <span className="px-2 py-0.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[9px] font-bold text-indigo-400">
                            +{attrCount - 3}
                          </span>
                        )}
                        {attrCount === 0 && (
                          <span className="text-[9px] text-[var(--color-text-muted)] italic font-semibold">Sin atributos</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CREAR / EDITAR NICHO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <span className="text-2xl select-none">{nicheEmoji}</span>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--color-text)]">
                    {isEditing ? 'Editar Vertical de Negocio' : 'Nueva Vertical de Negocio'}
                  </h3>
                  <p className="text-[9px] text-[var(--color-text-muted)] font-semibold">Configura la clave, nombre y los atributos dinámicos del nicho.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-red-500/20 hover:text-red-400 rounded-xl transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
              {/* Bloque Identidad */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 border-b border-[var(--color-border)] pb-5">
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Emoji</label>
                  <input
                    type="text"
                    value={nicheEmoji}
                    onChange={(e) => setNicheEmoji(e.target.value)}
                    maxLength={2}
                    className="w-full text-center py-2.5 text-lg rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-indigo-500/50 font-semibold"
                  />
                </div>

                <div className="sm:col-span-5 space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">ID / Clave Técnica</label>
                  <input
                    type="text"
                    value={nicheId}
                    onChange={(e) => setNicheId(e.target.value)}
                    disabled={isEditing}
                    placeholder="ej: restaurantes_gourmet"
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-indigo-500/50 disabled:opacity-50 font-semibold font-mono"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Nombre para el Select</label>
                  <input
                    type="text"
                    value={nicheName}
                    onChange={(e) => setNicheName(e.target.value)}
                    placeholder="ej: Restaurante Gourmet"
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-indigo-500/50 font-semibold"
                  />
                </div>
              </div>

              {/* Subformulario: Añadir Atributos */}
              <div className="space-y-3 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl p-4">
                <h4 className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                  <Layers size={14} className="text-indigo-400" />
                  <span>Añadir Atributo a la Ficha de Catálogo</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Nombre Técnico (Sin espacios/tildes)</label>
                    <input
                      type="text"
                      placeholder="ej: tipo_queso"
                      value={newAttrName}
                      onChange={(e) => setNewAttrName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-indigo-500/50 font-semibold font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Etiqueta Visual (Label)</label>
                    <input
                      type="text"
                      placeholder="ej: Tipo de Queso"
                      value={newAttrLabel}
                      onChange={(e) => setNewAttrLabel(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-indigo-500/50 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Tipo de Input</label>
                    <CustomSelect
                      value={newAttrType}
                      onChange={(v) => setNewAttrType(v)}
                      options={[
                        { value: 'text', label: 'Texto libre (Input)' },
                        { value: 'select', label: 'Lista Desplegable (Dropdown)' }
                      ]}
                    />
                  </div>

                  {newAttrType === 'select' ? (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Opciones (Separadas por comas)</label>
                      <input
                        type="text"
                        placeholder="ej: Mozzarella, Cheddar, Parmesano"
                        value={newAttrOptions}
                        onChange={(e) => setNewAttrOptions(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-indigo-500/50 font-semibold"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Texto Sugerido (Placeholder)</label>
                      <input
                        type="text"
                        placeholder="ej: Escriba el tipo de queso..."
                        value={newAttrPlaceholder}
                        onChange={(e) => setNewAttrPlaceholder(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-indigo-500/50 font-semibold"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleAddAttribute}
                    className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer active:scale-95"
                  >
                    Añadir Atributo
                  </button>
                </div>
              </div>

              {/* Lista de Atributos del Nicho */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                  Atributos Actuales del Nicho ({nicheAttributes.length})
                </label>
                
                {nicheAttributes.length === 0 ? (
                  <div className="p-4 text-center bg-[var(--color-surface-2)]/30 border border-dashed border-[var(--color-border)] rounded-2xl text-[var(--color-text-muted)] font-semibold text-[10px]">
                    No se han añadido atributos. El catálogo para este nicho será de campos fijos genéricos.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto scrollbar-thin pr-1">
                    {nicheAttributes.map((attr, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 rounded-2xl bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] text-xs font-bold text-[var(--color-text)] flex justify-between items-start gap-2"
                      >
                        <div className="min-w-0">
                          <span className="text-indigo-400 text-[11px] block truncate">{attr.label}</span>
                          <span className="text-[8px] font-mono text-[var(--color-text-muted)] block">Clave: {attr.name}</span>
                          <span className="text-[8px] font-mono text-[var(--color-text-muted)] block uppercase">Tipo: {attr.type}</span>
                          {attr.type === 'select' && (
                            <span className="text-[8px] font-mono text-[var(--color-text-muted)] block truncate mt-0.5">
                              Opciones: {attr.options?.join(', ')}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveAttribute(idx)}
                          className="text-[var(--color-text-muted)] hover:text-red-400 p-1 rounded-lg hover:bg-red-500/5 transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-2)]/40 flex justify-end gap-3.5">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNiche}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={14} />
                <span>{isEditing ? 'Guardar Cambios' : 'Crear Nicho'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
