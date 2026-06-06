import React, { useState } from 'react';
import {
  Play, Sliders, Eye, AlertTriangle, Info, CheckCircle, X,
  Sun, Moon, Bell, ShoppingCart, Plus, Minus, Trash2, Star,
  ChevronDown, ChevronUp, Loader, Lock, User, Mail, Search,
  ToggleLeft, ToggleRight, Zap, Package, ArrowLeft
} from 'lucide-react';

// ─── Componentes Incrustados del Ecosistema ──────────────────────────────────

// DarkModeToggle (real, del ecosistema)
function SandboxDarkModeToggle({ isDark = false, onToggle = () => {}, className = '' }) {
  return (
    <button
      onClick={onToggle}
      className={`focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:scale-105 active:scale-95 p-2.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center ${
        isDark
          ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-amber-400'
          : 'bg-white hover:bg-slate-50 border-slate-200 text-indigo-600 shadow-sm'
      } ${className}`}
      title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
    >
      <div className="transition-transform duration-500" style={{ transform: isDark ? 'rotate(360deg)' : 'rotate(0deg)' }}>
        {isDark ? <Moon size={18} /> : <Sun size={18} />}
      </div>
    </button>
  );
}

// GuidedToast (real, del ecosistema)
function SandboxGuidedToast({ isVisible, message, type = 'info', onClose, onActionClick, actionText }) {
  if (!isVisible || !message) return null;
  const config = {
    success: { bg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400', icon: <CheckCircle size={18} className="text-emerald-400" /> },
    warning: { bg: 'bg-amber-500/10 border-amber-500/25 text-amber-400', icon: <AlertTriangle size={18} className="text-amber-400" /> },
    error: { bg: 'bg-red-500/10 border-red-500/25 text-red-400', icon: <AlertTriangle size={18} className="text-red-400" /> },
    info: { bg: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400', icon: <Info size={18} className="text-indigo-400" /> },
  }[type] || { bg: 'bg-slate-900/90 border-slate-800 text-slate-100', icon: <Info size={18} /> };

  return (
    <div className={`w-full border backdrop-blur-xl p-4 rounded-2xl flex items-start gap-3 ${config.bg}`}>
      <div className="shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-xs font-bold leading-relaxed">{message}</p>
        {onActionClick && actionText && (
          <button onClick={onActionClick} className="mt-2 text-[10px] font-black uppercase tracking-wider hover:underline cursor-pointer">{actionText}</button>
        )}
      </div>
      <button onClick={onClose} className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"><X size={14} /></button>
    </div>
  );
}

// ─── Playgrounds ─────────────────────────────────────────────────────────────

const SANDBOXES = {

  // ── DarkModeToggle ──────────────────────────────────────────────────────
  'dark_mode_toggle': () => {
    const [isDark, setIsDark] = useState(false);
    const [size, setSize] = useState('md');
    const sizes = { sm: 'p-1.5 rounded-lg', md: 'p-2.5 rounded-xl', lg: 'p-3.5 rounded-2xl' };
    return (
      <SandboxLayout
        title="DarkModeToggle"
        description="Interruptor de tema claro/oscuro con animación de rotación."
        controls={[
          { label: 'Estado', type: 'toggle', value: isDark, onChange: setIsDark, labels: ['Claro', 'Oscuro'] },
          { label: 'Tamaño', type: 'select', value: size, options: ['sm', 'md', 'lg'], onChange: setSize },
        ]}
      >
        <div className="flex flex-col items-center gap-6">
          <div className={`transition-all duration-500 ${isDark ? 'bg-slate-900 p-8 rounded-2xl' : 'bg-white p-8 rounded-2xl shadow-md'}`}>
            <SandboxDarkModeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} className={sizes[size]} />
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono">
            isDark: <span className={isDark ? 'text-amber-400' : 'text-indigo-400'}>{String(isDark)}</span>
          </p>
        </div>
      </SandboxLayout>
    );
  },

  // ── GuidedToast ─────────────────────────────────────────────────────────
  'guided_toast': () => {
    const [type, setType] = useState('success');
    const [message, setMessage] = useState('¡Operación completada exitosamente!');
    const [hasAction, setHasAction] = useState(false);
    const [visible, setVisible] = useState(true);
    return (
      <SandboxLayout
        title="GuidedToast"
        description="Notificación contextual con soporte para acciones y 4 variantes semánticas."
        controls={[
          { label: 'Tipo', type: 'select', value: type, options: ['success', 'error', 'warning', 'info'], onChange: setType },
          { label: 'Con Acción', type: 'toggle', value: hasAction, onChange: setHasAction, labels: ['No', 'Sí'] },
          { label: 'Mensaje', type: 'text', value: message, onChange: setMessage },
        ]}
      >
        <div className="space-y-4 w-full">
          <div className="flex justify-center gap-2 flex-wrap">
            {['success', 'error', 'warning', 'info'].map(t => (
              <button
                key={t}
                onClick={() => { setType(t); setVisible(true); }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all ${
                  type === t ? 'bg-indigo-600 text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]/80'
                }`}
              >{t}</button>
            ))}
          </div>
          {visible ? (
            <SandboxGuidedToast
              isVisible={true}
              message={message}
              type={type}
              onClose={() => setVisible(false)}
              onActionClick={hasAction ? () => alert('¡Acción ejecutada!') : null}
              actionText={hasAction ? 'Ver detalles →' : ''}
            />
          ) : (
            <div className="text-center py-6">
              <button
                onClick={() => setVisible(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                Mostrar Toast
              </button>
            </div>
          )}
        </div>
      </SandboxLayout>
    );
  },

  // ── Botón Premium (Átomo Genérico) ──────────────────────────────────────
  'boton_premium': () => {
    const [variant, setVariant] = useState('primary');
    const [size, setSize] = useState('md');
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [label, setLabel] = useState('Guardar Cambios');
    const [hasIcon, setHasIcon] = useState(true);

    const variants = {
      primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30',
      secondary: 'bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-2)]/80 text-[var(--color-text)] border border-[var(--color-border)]',
      danger: 'bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30',
      ghost: 'bg-transparent hover:bg-[var(--color-surface-2)]/40 text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
      gradient: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg',
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-[10px] rounded-lg gap-1',
      md: 'px-4 py-2.5 text-xs rounded-xl gap-1.5',
      lg: 'px-6 py-3.5 text-sm rounded-2xl gap-2',
    };

    return (
      <SandboxLayout
        title="Botón Premium"
        description="Átomo de botón con 5 variantes, 3 tamaños, estado loading/disabled e ícono opcional."
        controls={[
          { label: 'Variante', type: 'select', value: variant, options: Object.keys(variants), onChange: setVariant },
          { label: 'Tamaño', type: 'select', value: size, options: ['sm', 'md', 'lg'], onChange: setSize },
          { label: 'Con Ícono', type: 'toggle', value: hasIcon, onChange: setHasIcon, labels: ['No', 'Sí'] },
          { label: 'Loading', type: 'toggle', value: loading, onChange: setLoading, labels: ['Off', 'On'] },
          { label: 'Disabled', type: 'toggle', value: disabled, onChange: setDisabled, labels: ['Off', 'On'] },
          { label: 'Texto', type: 'text', value: label, onChange: setLabel },
        ]}
      >
        <div className="flex flex-col items-center gap-8">
          <button
            disabled={disabled || loading}
            className={`flex items-center font-bold transition-all duration-200 active:scale-95 cursor-pointer ${sizes[size]} ${variants[variant]} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
          >
            {loading
              ? <Loader size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} className="animate-spin" />
              : hasIcon && <Zap size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} />
            }
            {label}
          </button>
          <div className="flex gap-2 flex-wrap justify-center">
            {Object.keys(variants).map(v => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  variant === v ? 'bg-indigo-600 text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                }`}
              >{v}</button>
            ))}
          </div>
        </div>
      </SandboxLayout>
    );
  },

  // ── Modal de Confirmación ───────────────────────────────────────────────
  'modal_confirmacion': () => {
    const [isOpen, setIsOpen] = useState(false);
    const [variant, setVariant] = useState('danger');
    const [title, setTitle] = useState('Eliminar registro');
    const [body, setBody] = useState('Esta acción es irreversible. ¿Deseas continuar?');

    const variants = {
      danger: { icon: <Trash2 size={22} className="text-red-400" />, bg: 'bg-red-600', label: 'Eliminar', ring: 'ring-red-500/30' },
      warning: { icon: <AlertTriangle size={22} className="text-amber-400" />, bg: 'bg-amber-500', label: 'Continuar', ring: 'ring-amber-500/30' },
      info: { icon: <Info size={22} className="text-indigo-400" />, bg: 'bg-indigo-600', label: 'Confirmar', ring: 'ring-indigo-500/30' },
    };
    const v = variants[variant];

    return (
      <SandboxLayout
        title="Modal de Confirmación"
        description="Modal con overlay y 3 variantes semánticas (danger, warning, info) con focus trap simulado."
        controls={[
          { label: 'Variante', type: 'select', value: variant, options: Object.keys(variants), onChange: setVariant },
          { label: 'Título', type: 'text', value: title, onChange: setTitle },
          { label: 'Cuerpo', type: 'text', value: body, onChange: setBody },
        ]}
      >
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => setIsOpen(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
          >
            Abrir Modal
          </button>

          {isOpen && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
              onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}
            >
              <div className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-7 max-w-sm w-full mx-4 shadow-2xl ring-1 ${v.ring} animate-fade-in-up`}>
                <div className="flex items-start gap-4 mb-5">
                  <div className="p-3 bg-[var(--color-surface-2)] rounded-2xl shrink-0">{v.icon}</div>
                  <div>
                    <h3 className="font-black text-sm text-[var(--color-text)]">{title}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">{body}</p>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-2)]/80 text-[var(--color-text-muted)] text-xs font-bold rounded-xl cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`flex-1 py-2.5 ${v.bg} hover:opacity-90 text-white text-xs font-bold rounded-xl cursor-pointer transition-all`}
                  >
                    {v.label}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SandboxLayout>
    );
  },

  // ── Selector de Atributos ───────────────────────────────────────────────
  'selector_atributos': () => {
    const [selected, setSelected] = useState({});
    const [layout, setLayout] = useState('chips');
    const [multiSelect, setMultiSelect] = useState(false);
    const atributos = {
      Talla: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      Color: ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde'],
      Material: ['Algodón', 'Poliéster', 'Lana'],
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
        <div className="space-y-5 w-full">
          {Object.entries(atributos).map(([group, values]) => (
            <div key={group}>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">{group}</p>
              {layout === 'chips' ? (
                <div className="flex flex-wrap gap-1.5">
                  {values.map(v => (
                    <button
                      key={v}
                      onClick={() => handleSelect(group, v)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected(group, v)
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-indigo-500/50 hover:text-[var(--color-text)]'
                      }`}
                    >{v}</button>
                  ))}
                </div>
              ) : (
                <select
                  value={selected[group] || ''}
                  onChange={e => setSelected(p => ({ ...p, [group]: e.target.value || null }))}
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] text-xs rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Selecciona {group}</option>
                  {values.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              )}
            </div>
          ))}
          <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] font-mono text-[10px] text-indigo-400">
            {JSON.stringify(selected, null, 2)}
          </div>
        </div>
      </SandboxLayout>
    );
  },

  // ── Campo de Input Premium ──────────────────────────────────────────────
  'input_premium': () => {
    const [value, setValue] = useState('');
    const [type, setType] = useState('text');
    const [hasLabel, setHasLabel] = useState(true);
    const [hasIcon, setHasIcon] = useState(true);
    const [error, setError] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [placeholder, setPlaceholder] = useState('Escribe algo aquí...');

    const icons = { text: <User size={14} />, email: <Mail size={14} />, password: <Lock size={14} />, search: <Search size={14} /> };

    return (
      <SandboxLayout
        title="Input Premium"
        description="Campo de entrada con validación visual, ícono contextual y soporte para múltiples tipos."
        controls={[
          { label: 'Tipo', type: 'select', value: type, options: ['text', 'email', 'password', 'search'], onChange: setType },
          { label: 'Con Label', type: 'toggle', value: hasLabel, onChange: setHasLabel, labels: ['No', 'Sí'] },
          { label: 'Con Ícono', type: 'toggle', value: hasIcon, onChange: setHasIcon, labels: ['No', 'Sí'] },
          { label: 'Error', type: 'toggle', value: error, onChange: setError, labels: ['Off', 'On'] },
          { label: 'Disabled', type: 'toggle', value: disabled, onChange: setDisabled, labels: ['Off', 'On'] },
        ]}
      >
        <div className="w-full space-y-2">
          {hasLabel && <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Campo de entrada</label>}
          <div className={`flex items-center gap-2.5 bg-[var(--color-surface)] border rounded-xl px-3.5 py-2.5 transition-all ${
            error ? 'border-red-500/60 focus-within:ring-1 focus-within:ring-red-500/40' :
            disabled ? 'border-[var(--color-border)] opacity-50' :
            'border-[var(--color-border)] focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/20'
          }`}>
            {hasIcon && <span className="text-[var(--color-text-muted)] shrink-0">{icons[type]}</span>}
            <input
              type={type}
              value={value}
              onChange={e => setValue(e.target.value)}
              disabled={disabled}
              placeholder={placeholder}
              className="bg-transparent outline-none text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] w-full disabled:cursor-not-allowed"
            />
            {value && !disabled && (
              <button onClick={() => setValue('')} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"><X size={12} /></button>
            )}
          </div>
          {error && <p className="text-[10px] text-red-400 font-semibold">Este campo es requerido.</p>}
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono">value: "{value}"</p>
        </div>
      </SandboxLayout>
    );
  },

  // ── Contador de Cantidad ────────────────────────────────────────────────
  'contador_cantidad': () => {
    const [qty, setQty] = useState(1);
    const [min, setMin] = useState(1);
    const [max, setMax] = useState(10);
    const [size, setSize] = useState('md');

    const sizes = { sm: 'p-1', md: 'p-2', lg: 'p-3' };
    const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

    const increment = () => setQty(q => Math.min(q + 1, max));
    const decrement = () => setQty(q => Math.max(q - 1, min));

    return (
      <SandboxLayout
        title="Contador de Cantidad"
        description="Selector numérico con límites min/max, validación y 3 tamaños. Usado en carrito y pedidos."
        controls={[
          { label: 'Mínimo', type: 'number', value: min, onChange: v => { setMin(Number(v)); if (qty < Number(v)) setQty(Number(v)); } },
          { label: 'Máximo', type: 'number', value: max, onChange: v => { setMax(Number(v)); if (qty > Number(v)) setQty(Number(v)); } },
          { label: 'Tamaño', type: 'select', value: size, options: ['sm', 'md', 'lg'], onChange: setSize },
        ]}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={decrement}
              disabled={qty <= min}
              className={`${sizes[size]} px-3 hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-[var(--color-text)]`}
            ><Minus size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} /></button>
            <span className={`${textSizes[size]} font-black text-[var(--color-text)] px-4 tabular-nums min-w-[3ch] text-center`}>{qty}</span>
            <button
              onClick={increment}
              disabled={qty >= max}
              className={`${sizes[size]} px-3 hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-[var(--color-text)]`}
            ><Plus size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} /></button>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-mono text-[var(--color-text-muted)]">qty: <span className="text-indigo-400 font-bold">{qty}</span></p>
            <div className="flex gap-1 justify-center">
              {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(n => (
                <div key={n} className={`w-1.5 h-1.5 rounded-full transition-all ${n <= qty ? 'bg-indigo-500' : 'bg-[var(--color-surface-2)]'}`} />
              ))}
            </div>
          </div>
        </div>
      </SandboxLayout>
    );
  },

  // ── Stepper de Seguimiento de Pedidos ──────────────────────────────────
  'stepper_pedidos': () => {
    const STEPS = [
      { id: 0, label: 'Recibido', icon: '📥', desc: 'Pedido registrado en el sistema.' },
      { id: 1, label: 'Alistamiento', icon: '📦', desc: 'Preparando los productos del pedido.' },
      { id: 2, label: 'En Ruta', icon: '🚚', desc: 'El pedido está en camino al cliente.' },
      { id: 3, label: 'Entregado', icon: '✅', desc: 'Entrega confirmada exitosamente.' },
    ];
    const [active, setActive] = useState(1);
    const [cancelled, setCancelled] = useState(false);

    return (
      <SandboxLayout
        title="Stepper de Seguimiento de Pedidos"
        description="Línea de tiempo reactiva de 4 hitos operativos. Soporta cancelaciones y microanimaciones."
        controls={[
          { label: 'Paso activo', type: 'select', value: String(active), options: ['0', '1', '2', '3'], onChange: v => { setActive(Number(v)); setCancelled(false); } },
          { label: 'Cancelado', type: 'toggle', value: cancelled, onChange: v => { setCancelled(v); if (v) setActive(0); }, labels: ['No', 'Sí'] },
        ]}
      >
        <div className="w-full space-y-4">
          {/* Timeline visual */}
          <div className="flex items-center w-full">
            {STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base border-2 transition-all ${
                    cancelled && idx === 0 ? 'border-red-500 bg-red-500/10 text-red-400' :
                    idx < active ? 'border-indigo-500 bg-indigo-600 text-white' :
                    idx === active ? 'border-indigo-500 bg-indigo-600/20 text-indigo-400 ring-2 ring-indigo-500/30' :
                    'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                  }`}>
                    {cancelled && idx === 0 ? '❌' : step.icon}
                  </div>
                  <span className={`text-[9px] font-bold text-center leading-tight ${
                    idx === active && !cancelled ? 'text-indigo-400' : 'text-[var(--color-text-muted)]'
                  }`}>{cancelled && idx === 0 ? 'Cancelado' : step.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${
                    cancelled ? 'bg-red-500/20' :
                    idx < active ? 'bg-indigo-500' : 'bg-[var(--color-border)]'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          {/* Descripción del paso activo */}
          {!cancelled && (
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
              <p className="text-[10px] font-semibold text-indigo-400">{STEPS[active]?.desc}</p>
            </div>
          )}
          {cancelled && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-[10px] font-semibold text-red-400">Pedido cancelado por el administrador.</p>
            </div>
          )}
          {/* Navegación rápida */}
          <div className="flex gap-2 justify-center">
            <button onClick={() => { setActive(a => Math.max(0, a - 1)); setCancelled(false); }} disabled={active <= 0 || cancelled}
              className="px-3 py-1.5 text-[10px] font-bold bg-[var(--color-surface-2)] text-[var(--color-text-muted)] rounded-xl cursor-pointer disabled:opacity-30 hover:bg-[var(--color-surface-2)]/80 transition-all">
              ← Atrás
            </button>
            <button onClick={() => { setActive(a => Math.min(3, a + 1)); setCancelled(false); }} disabled={active >= 3 || cancelled}
              className="px-3 py-1.5 text-[10px] font-bold bg-indigo-600 text-white rounded-xl cursor-pointer disabled:opacity-30 hover:bg-indigo-500 transition-all">
              Siguiente →
            </button>
          </div>
        </div>
      </SandboxLayout>
    );
  },

  // ── Paginación ──────────────────────────────────────────────────────────
  'paginacion': () => {
    const [page, setPage] = useState(3);
    const [total, setTotal] = useState(10);
    const [showEllipsis, setShowEllipsis] = useState(true);

    const getPages = () => {
      const pages = [];
      const delta = 1;
      for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= page - delta && i <= page + delta)) {
          pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
          if (showEllipsis) pages.push('...');
        }
      }
      return pages;
    };

    return (
      <SandboxLayout
        title="Paginación Fluida"
        description="Paginador adaptativo con elipsis y navegación por página. Responsive a cualquier total."
        controls={[
          { label: 'Total págs.', type: 'number', value: total, onChange: v => { setTotal(Math.max(1, Number(v))); setPage(1); } },
          { label: 'Página', type: 'number', value: page, onChange: v => setPage(Math.min(Math.max(1, Number(v)), total)) },
          { label: 'Elipsis', type: 'toggle', value: showEllipsis, onChange: setShowEllipsis, labels: ['No', 'Sí'] },
        ]}
      >
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-center gap-1 flex-wrap">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-2.5 py-1.5 text-[10px] font-bold bg-[var(--color-surface-2)] text-[var(--color-text-muted)] rounded-lg cursor-pointer disabled:opacity-30 hover:bg-[var(--color-surface-2)]/80 transition-all">
              ‹
            </button>
            {getPages().map((p, idx) => (
              p === '...'
                ? <span key={`el-${idx}`} className="px-1 text-[10px] text-[var(--color-text-muted)]">…</span>
                : <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                      p === page ? 'bg-indigo-600 text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]/80'
                    }`}>
                    {p}
                  </button>
            ))}
            <button onClick={() => setPage(p => Math.min(total, p + 1))} disabled={page === total}
              className="px-2.5 py-1.5 text-[10px] font-bold bg-[var(--color-surface-2)] text-[var(--color-text-muted)] rounded-lg cursor-pointer disabled:opacity-30 hover:bg-[var(--color-surface-2)]/80 transition-all">
              ›
            </button>
          </div>
          <p className="text-center text-[10px] text-[var(--color-text-muted)] font-mono">
            Página <span className="text-indigo-400 font-bold">{page}</span> de <span className="text-indigo-400 font-bold">{total}</span>
          </p>
        </div>
      </SandboxLayout>
    );
  },

  // ── Tarjeta de Producto ─────────────────────────────────────────────────
  'tarjeta_producto': () => {
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
        {loading ? (
          // Skeleton shimmer
          <div className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden ${layout === 'list' ? 'flex gap-3 p-3' : 'p-0'}`}>
            <div className={`bg-slate-800 animate-pulse ${layout === 'list' ? 'w-20 h-20 rounded-xl shrink-0' : 'w-full h-40 rounded-t-2xl'}`} />
            <div className={`space-y-2 ${layout === 'list' ? 'flex-1 py-1' : 'p-3'}`}>
              <div className="h-3 bg-slate-800 rounded animate-pulse w-3/4" />
              <div className="h-2.5 bg-slate-800 rounded animate-pulse w-1/2" />
              <div className="h-5 bg-slate-800 rounded animate-pulse w-1/3" />
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
              <button onClick={() => setIsFav(!isFav)} className="absolute top-2 right-2 cursor-pointer">
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
                <button className="mt-2 w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-xl cursor-pointer transition-all">
                  Agregar al Carrito
                </button>
              )}
            </div>
          </div>
        )}
      </SandboxLayout>
    );
  },

  // ── Tarjeta de Pedido Admin ─────────────────────────────────────────────
  'tarjeta_pedido_admin': () => {
    const [status, setStatus] = useState('pendiente');
    const [expanded, setExpanded] = useState(false);

    const statuses = {
      pendiente: { label: 'Pendiente', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
      en_preparacion: { label: 'En Preparación', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
      en_ruta: { label: 'En Ruta', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
      entregado: { label: 'Entregado', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
      cancelado: { label: 'Cancelado', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
    };
    const st = statuses[status];

    return (
      <SandboxLayout
        title="Tarjeta de Pedido Admin"
        description="Tarjeta colapsable para gestión de pedidos en panel admin. Incluye chip de estado y acciones rápidas."
        controls={[
          { label: 'Estado', type: 'select', value: status, options: Object.keys(statuses), onChange: setStatus },
          { label: 'Expandida', type: 'toggle', value: expanded, onChange: setExpanded, labels: ['No', 'Sí'] },
        ]}
      >
        <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
          {/* Header colapsable */}
          <button onClick={() => setExpanded(!expanded)} className="w-full p-3 flex items-center justify-between gap-2 hover:bg-[var(--color-surface-2)]/40 transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600/20 rounded-xl flex items-center justify-center text-sm font-black text-indigo-400">#</div>
              <div className="text-left">
                <p className="text-xs font-bold text-[var(--color-text)]">Pedido #A1B2C</p>
                <p className="text-[9px] text-[var(--color-text-muted)]">Carlos Gómez · 3 items</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${st.color}`}>{st.label}</span>
              <ChevronDown size={12} className={`text-[var(--color-text-muted)] transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {/* Panel expandido */}
          {expanded && (
            <div className="border-t border-[var(--color-border)] p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div><p className="text-[var(--color-text-muted)]">Total</p><p className="font-bold text-[var(--color-text)]">$125.000</p></div>
                <div><p className="text-[var(--color-text-muted)]">Dirección</p><p className="font-bold text-[var(--color-text)]">Cra 15 #45-23</p></div>
              </div>
              <div className="flex gap-1.5">
                <button className="flex-1 py-1.5 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold rounded-xl cursor-pointer hover:bg-emerald-600/20 transition-all">✓ Completar</button>
                <button className="flex-1 py-1.5 bg-red-600/10 border border-red-500/30 text-red-400 text-[9px] font-bold rounded-xl cursor-pointer hover:bg-red-600/20 transition-all">✕ Cancelar</button>
                <button className="px-2.5 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-[9px] font-bold rounded-xl cursor-pointer hover:bg-[var(--color-surface-2)]/80 transition-all">📱 WA</button>
              </div>
            </div>
          )}
        </div>
      </SandboxLayout>
    );
  },

  // ── Carrusel de Anuncios ────────────────────────────────────────────────
  'carrusel_anuncios': () => {
    const [active, setActive] = useState(0);
    const [autoPlay, setAutoPlay] = useState(false);
    const [mode, setMode] = useState('gradient');

    const banners = [
      { title: '🔥 Sale de Temporada', desc: 'Hasta 40% de descuento en toda la tienda', color: 'from-indigo-600 to-violet-600' },
      { title: '🚚 Envío Gratis', desc: 'En pedidos mayores a $80.000', color: 'from-emerald-600 to-teal-600' },
      { title: '⭐ Nuevos Productos', desc: 'Descubre lo último de nuestra colección', color: 'from-amber-500 to-orange-600' },
    ];

    React.useEffect(() => {
      if (!autoPlay) return;
      const t = setInterval(() => setActive(a => (a + 1) % banners.length), 2000);
      return () => clearInterval(t);
    }, [autoPlay]);

    const b = banners[active];

    return (
      <SandboxLayout
        title="Carrusel de Anuncios Promocionales"
        description="Hero banner con auto-rotación, glow pulsante, 3 modos de fondo y navegación por dots y flechas."
        controls={[
          { label: 'Auto-play', type: 'toggle', value: autoPlay, onChange: setAutoPlay, labels: ['Off', 'On'] },
          { label: 'Modo', type: 'select', value: mode, options: ['gradient', 'dark', 'light'], onChange: setMode },
        ]}
      >
        <div className="w-full space-y-3">
          {/* Banner */}
          <div className={`relative rounded-2xl overflow-hidden h-28 flex items-center px-5 transition-all duration-500 ${
            mode === 'gradient' ? `bg-gradient-to-r ${b.color}` :
            mode === 'dark' ? 'bg-slate-900 border border-slate-800' :
            'bg-white border border-slate-200'
          }`}>
            <div className="relative z-10">
              <p className={`text-sm font-black ${mode === 'light' ? 'text-slate-900' : 'text-white'}`}>{b.title}</p>
              <p className={`text-[10px] mt-0.5 ${mode === 'light' ? 'text-slate-600' : 'text-white/75'}`}>{b.desc}</p>
              <button className={`mt-2 px-3 py-1 text-[10px] font-black rounded-xl cursor-pointer transition-all ${
                mode === 'light' ? 'bg-indigo-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}>Ver más</button>
            </div>
            {/* Decoración */}
            {mode === 'gradient' && <div className="absolute right-5 text-5xl opacity-30">🛍️</div>}
          </div>
          {/* Navegación */}
          <div className="flex items-center justify-between">
            <button onClick={() => setActive(a => (a - 1 + banners.length) % banners.length)}
              className="p-1.5 bg-[var(--color-surface-2)] rounded-lg text-[var(--color-text-muted)] cursor-pointer hover:bg-[var(--color-surface-2)]/80 text-xs">‹</button>
            <div className="flex gap-1.5">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`rounded-full cursor-pointer transition-all ${active === i ? 'w-5 h-2 bg-indigo-500' : 'w-2 h-2 bg-[var(--color-border)] hover:bg-indigo-400/50'}`} />
              ))}
            </div>
            <button onClick={() => setActive(a => (a + 1) % banners.length)}
              className="p-1.5 bg-[var(--color-surface-2)] rounded-lg text-[var(--color-text-muted)] cursor-pointer hover:bg-[var(--color-surface-2)]/80 text-xs">›</button>
          </div>
        </div>
      </SandboxLayout>
    );
  },

};


// ─── Control Panel ────────────────────────────────────────────────────────────

function ControlPanel({ controls }) {
  if (!controls || controls.length === 0) return null;
  return (
    <div className="bg-[var(--color-bg)]/60 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Sliders size={11} className="text-indigo-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Controles</span>
      </div>
      {controls.map((ctrl, idx) => (
        <div key={idx} className="flex items-center justify-between gap-3">
          <label className="text-[10px] font-semibold text-[var(--color-text-muted)] shrink-0 w-20">{ctrl.label}</label>
          {ctrl.type === 'toggle' && (
            <button
              onClick={() => ctrl.onChange(!ctrl.value)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                ctrl.value ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-400' : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}
            >
              {ctrl.value ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
              {ctrl.value ? (ctrl.labels?.[1] || 'On') : (ctrl.labels?.[0] || 'Off')}
            </button>
          )}
          {ctrl.type === 'select' && (
            <select
              value={ctrl.value}
              onChange={e => ctrl.onChange(e.target.value)}
              className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] text-[10px] rounded-xl px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
            >
              {ctrl.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          {(ctrl.type === 'text' || ctrl.type === 'number') && (
            <input
              type={ctrl.type}
              value={ctrl.value}
              onChange={e => ctrl.onChange(e.target.value)}
              className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] text-[10px] rounded-xl px-2 py-1 flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 min-w-0"
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Layout del Sandbox ──────────────────────────────────────────────────────

function SandboxLayout({ title, description, controls, children }) {
  return (
    <div className="space-y-4 h-full">
      <div>
        <h4 className="text-xs font-black text-[var(--color-text)]">{title}</h4>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="flex flex-col gap-4 h-full">
        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center min-h-[180px] bg-[var(--color-bg)]/40 border border-dashed border-[var(--color-border)] rounded-2xl p-6 relative">
          <div className="absolute top-2 left-3">
            <span className="text-[8px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">preview</span>
          </div>
          <div className="w-full max-w-xs">{children}</div>
        </div>
        {/* Controls */}
        <ControlPanel controls={controls} />
      </div>
    </div>
  );
}

// ─── Componente Principal: ComponentSandbox ──────────────────────────────────

// ─── Metadatos para componentes SIN playground (estado informativo) ───────────
// Clasifica el componente por tipo para mostrar un mensaje honesto y útil
const COMPONENT_META = {
  // ── Servicios / Firebase (no renderizables) ──
  'sincronización de firestore en tiempo real': { type: 'hook', label: 'Hook Firebase', color: 'amber', note: 'Hook reactivo. Requiere conexión a Firestore y un proyecto Firebase activo para ejecutarse.' },
  'sistema de transacciones atómicas de inventario': { type: 'service', label: 'Servicio', color: 'amber', note: 'Servicio puro JS. Orquesta runTransaction en Firestore. No tiene UI propia.' },
  'motor dinámico de cupones': { type: 'service', label: 'Servicio', color: 'amber', note: 'Lógica CRUD sobre Firestore. Sin interfaz visual propia. Se integra en el Checkout.' },
  'omnicanalidad whatsapp': { type: 'service', label: 'Servicio', color: 'amber', note: 'Módulo de redirección a WhatsApp. Sin UI propia, se llama desde botones de acción.' },
  'generación pdf': { type: 'service', label: 'Servicio', color: 'amber', note: 'Utilidad de generación de PDF con jsPDF. Sin UI renderizable de forma aislada.' },
  'exportador centralizado pdf': { type: 'service', label: 'Servicio', color: 'amber', note: 'Módulo de generación de PDF. Sin UI propia.' },
  'servicio unificado de whatsapp': { type: 'service', label: 'Servicio', color: 'amber', note: 'Módulo JS puro de sanitización y redirección. Sin interfaz visual.' },
  // ── Hooks (lógica pura) ──
  'hook de control de inactividad': { type: 'hook', label: 'Custom Hook', color: 'violet', note: 'Hook puro de React. Detecta inactividad vía eventos del DOM. Integrar en el componente padre.' },
  'hook de copiado al portapapeles': { type: 'hook', label: 'Custom Hook', color: 'violet', note: 'Custom hook para gestionar copiado al portapapeles con reset temporizado.' },
  'hook de ubicación guardada': { type: 'hook', label: 'Custom Hook', color: 'violet', note: 'Hook reactivo con estado persistido en localStorage y Firestore.' },
  'alertas y confirmaciones globales': { type: 'hook', label: 'Context + Hook', color: 'violet', note: 'Provider de Context React con modal promesificado. Debe envolverse en el árbol de componentes.' },
  // ── Páginas completas (demasiado scope para sandbox) ──
  'página de login híbrida': { type: 'page', label: 'Página Completa', color: 'blue', note: 'Vista completa de login con autenticación Firebase. Requiere Firebase Auth configurado.' },
  'seguimiento de pedido público': { type: 'page', label: 'Página Completa', color: 'blue', note: 'Vista pública con consulta de pedidos por token. Requiere Firestore con datos reales.' },
  // ── Componentes complejos con dependencias externas ──
  'mapa interactivo': { type: 'complex', label: 'Dependencia Externa', color: 'teal', note: 'Requiere Leaflet.js y Nominatim. No renderizable en sandbox sin las librerías cargadas.' },
  'mapa desplegable': { type: 'complex', label: 'Dependencia Externa', color: 'teal', note: 'Wrapper animado del LeafletMapPicker. Requiere Leaflet y Framer Motion.' },
  'carrito de compras completo': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Store Zustand + CartDrawer con Framer Motion. Requiere store inicializado y productos reales.' },
  'modal de checkout multipaso': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Wizard de 3 pasos con validaciones, cupones y Firestore. Requiere store de carrito activo.' },
  'sistema de temas dinámicos': { type: 'complex', label: 'Sistema CSS', color: 'teal', note: 'Inyecta variables CSS en :root. Su efecto es global y ya está activo en todo el dashboard.' },
  'restaurador de aplicación a fábrica': { type: 'complex', label: 'Herramienta Destructiva', color: 'red', note: '⚠️ Borra datos de Firestore en lotes. Solo se ejecuta con confirmación explícita del admin.' },
  'compra rápida por código qr': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Vista pública con lógica de variantes y carrito. Requiere datos de producto de Firestore.' },
  'sistema integral de monetización del desarrollador v2.0': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Sistema de 3 sub-componentes con Firestore y lógica de comisiones. Integración compleja.' },
  'facturación comisional del desarrollador': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Panel con canvas de firma digital, cálculo de comisiones y exportación PDF.' },
  'consola de diagnóstico de desarrollador': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Panel de diagnóstico en tiempo real con code-splitting. Ya disponible en el dashboard.' },
  'formulario de producto con ia': { type: 'complex', label: 'Dependencia IA', color: 'teal', note: 'Formulario con integración de Gemini API para sugerencias automáticas.' },
  'creador de filtros de catálogo': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Extrae atributos dinámicamente de una colección de Firestore.' },
  'panel de filtros de catálogo': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Bottom sheet con filtros extraídos de productos reales. Requiere datos de catálogo.' },
  'banner de instalación pwa': { type: 'complex', label: 'API del Navegador', color: 'teal', note: 'Usa el evento beforeinstallprompt del navegador. Solo se activa en contexto real de PWA.' },
};

// Mapa: nombre en minúsculas → clave de playground
export const COMPONENT_SANDBOX_MAP = {
  // ── DarkModeToggle ──
  'switch de modo oscuro (darkmodetoggle)': 'dark_mode_toggle',
  'darkmodetoggle': 'dark_mode_toggle',
  'switch de modo oscuro': 'dark_mode_toggle',
  'dark_mode_toggle': 'dark_mode_toggle',
  'modo oscuro': 'dark_mode_toggle',
  // ── GuidedToast ──
  'notificación toast interactiva (guidedtoast)': 'guided_toast',
  'guidedtoast': 'guided_toast',
  'notificación toast interactiva': 'guided_toast',
  'guided_toast': 'guided_toast',
  'toast guiado': 'guided_toast',
  // ── Botón / BackButton ──
  'boton premium': 'boton_premium',
  'boton_premium': 'boton_premium',
  'botón premium': 'boton_premium',
  'botón de regreso (backbutton)': 'boton_premium',
  'botón de regreso': 'boton_premium',
  'backbutton': 'boton_premium',
  // ── Modal Base ──
  'modal base premium (portals & scroll lock)': 'modal_confirmacion',
  'modal base premium': 'modal_confirmacion',
  'modal_base': 'modal_confirmacion',
  'modal de confirmación': 'modal_confirmacion',
  'modal confirmacion': 'modal_confirmacion',
  'modal base': 'modal_confirmacion',
  // ── Selector de Variantes / Categorías ──
  'selector de categorías (categorymanager)': 'selector_atributos',
  'selector de categorías': 'selector_atributos',
  'selector_categorias': 'selector_atributos',
  'selector de variantes de producto (variantselector)': 'selector_atributos',
  'selector de variantes de producto': 'selector_atributos',
  'selector de variantes': 'selector_atributos',
  'selector desplegable premium (customselect)': 'selector_atributos',
  'selector desplegable premium': 'selector_atributos',
  'selector desplegable': 'selector_atributos',
  // ── Input ──
  'input premium': 'input_premium',
  'input_premium': 'input_premium',
  'campo de texto': 'input_premium',
  // ── Contador / Cantidad ──
  'selector de cantidad (quantityselector)': 'contador_cantidad',
  'selector de cantidad': 'contador_cantidad',
  'quantityselector': 'contador_cantidad',
  'contador': 'contador_cantidad',
  'cantidad': 'contador_cantidad',
  // ── Stepper de pedidos ──
  'stepper de seguimiento de pedidos (ordertracingtimeline)': 'stepper_pedidos',
  'stepper de seguimiento de pedidos (ordertrackingtimeline)': 'stepper_pedidos',
  'stepper de seguimiento de pedidos': 'stepper_pedidos',
  'stepper pedidos': 'stepper_pedidos',
  // ── Paginación ──
  'paginación fluida (pagination)': 'paginacion',
  'paginación fluida': 'paginacion',
  'paginación': 'paginacion',
  'pagination': 'paginacion',
  // ── Tarjeta de Producto ──
  'tarjeta de producto adaptativa y skeleton shimmer (productcard)': 'tarjeta_producto',
  'tarjeta de producto adaptativa y skeleton shimmer': 'tarjeta_producto',
  'tarjeta de producto': 'tarjeta_producto',
  'productcard': 'tarjeta_producto',
  // ── Tarjeta de Pedido Admin ──
  'tarjeta de pedido admin (ordercard)': 'tarjeta_pedido_admin',
  'tarjeta de pedido admin': 'tarjeta_pedido_admin',
  'ordercard': 'tarjeta_pedido_admin',
  // ── Carrusel de Anuncios ──
  'carrusel de anuncios promocionales (catalogbanner)': 'carrusel_anuncios',
  'carrusel de anuncios promocionales': 'carrusel_anuncios',
  'catalogbanner': 'carrusel_anuncios',
};

export default function ComponentSandbox({ componentName = '' }) {
  const normalizedName = componentName.toLowerCase().trim();
  const sandboxKey = COMPONENT_SANDBOX_MAP[normalizedName] || null;
  const SandboxComponent = sandboxKey ? SANDBOXES[sandboxKey] : null;
  const meta = COMPONENT_META[normalizedName] || null;

  if (!SandboxComponent) {
    // Detectar color del tipo
    const colorMap = {
      amber: { badge: 'bg-amber-500/10 border-amber-500/25 text-amber-400', icon: '⚙️', pill: 'bg-amber-500/15 text-amber-400' },
      violet: { badge: 'bg-violet-500/10 border-violet-500/25 text-violet-400', icon: '🪝', pill: 'bg-violet-500/15 text-violet-400' },
      blue: { badge: 'bg-blue-500/10 border-blue-500/25 text-blue-400', icon: '📄', pill: 'bg-blue-500/15 text-blue-400' },
      teal: { badge: 'bg-teal-500/10 border-teal-500/25 text-teal-400', icon: '🧩', pill: 'bg-teal-500/15 text-teal-400' },
      red: { badge: 'bg-red-500/10 border-red-500/25 text-red-400', icon: '⚠️', pill: 'bg-red-500/15 text-red-400' },
      default: { badge: 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)]', icon: '📦', pill: 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]' },
    };
    const c = meta ? (colorMap[meta.color] || colorMap.default) : colorMap.default;

    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[360px] p-6 space-y-5">
        {/* Ícono y badge de tipo */}
        <div className="flex flex-col items-center gap-3">
          <div className={`p-5 border rounded-3xl text-3xl ${c.badge}`}>
            {c.icon}
          </div>
          {meta && (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${c.pill}`}>
              {meta.label}
            </span>
          )}
        </div>

        {/* Mensaje principal */}
        <div className="text-center max-w-[320px] space-y-2">
          <p className="text-sm font-bold text-[var(--color-text)]">
            {meta ? 'Sandbox No Aplicable' : 'Playground No Configurado'}
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
            {meta
              ? meta.note
              : 'Este componente aún no tiene un playground interactivo asignado. Consulta la pestaña Documentación para ver el código completo y los casos de uso.'}
          </p>
        </div>

        {/* Sugerencia de acción */}
        <div className={`w-full max-w-sm p-3.5 rounded-2xl border text-center ${c.badge}`}>
          <p className="text-[10px] font-bold leading-relaxed">
            {meta?.type === 'hook' && '→ Importa el hook en tu componente y pásale los parámetros de configuración.'}
            {meta?.type === 'service' && '→ Importa el servicio como módulo JS y llama sus funciones directamente.'}
            {meta?.type === 'page' && '→ Registra esta vista como ruta en tu router y pásale las props requeridas.'}
            {meta?.type === 'complex' && '→ Instala las dependencias indicadas en la documentación antes de integrar.'}
            {!meta && '→ Revisa la pestaña Documentación para ver el código completo y copiarlo.'}
          </p>
        </div>

        {/* Playgrounds disponibles */}
        <div className="w-full max-w-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] text-center mb-2">Playgrounds disponibles</p>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.keys(SANDBOXES).map(k => (
              <div key={k} className="px-2.5 py-1.5 bg-indigo-600/8 border border-indigo-500/15 rounded-xl text-[9px] text-indigo-400/70 font-mono text-center">
                {k.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <SandboxComponent />
    </div>
  );
}
