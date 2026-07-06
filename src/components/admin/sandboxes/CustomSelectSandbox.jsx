import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SandboxLayout } from './SandboxLayout';

// ── CustomSelect incrustado (auto-contenido en el sandbox) ──────────────────
function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Selecciona una opción...',
  disabled = false,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative w-full" style={{ zIndex: open ? 50 : 'auto' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full h-11 pl-4 pr-10 rounded-xl border text-sm focus:outline-none transition-colors appearance-none cursor-pointer flex items-center justify-between relative
          ${disabled
            ? 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)]/50 border-[var(--color-border)] cursor-not-allowed'
            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
          }
          ${className}`}
        style={{ borderColor: open ? 'var(--color-primary)' : undefined }}
      >
        <span className={selected ? 'text-[var(--color-text)] font-medium' : 'text-[var(--color-text-muted)]'}>
          {selected ? selected.label : placeholder}
        </span>
        <span
          className={`absolute right-3 text-[var(--color-text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 bg-transparent cursor-default"
              style={{ zIndex: 48 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className="absolute left-0 right-0 mt-1.5 rounded-xl border border-[var(--color-border)] overflow-hidden shadow-xl"
              style={{ zIndex: 49, background: 'var(--color-surface)' }}
            >
              {placeholder && (
                <button
                  type="button"
                  onClick={() => { onChange(''); setOpen(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors border-b border-[var(--color-border)]/30"
                >
                  {placeholder}
                </button>
              )}
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between
                    ${opt.value === value
                      ? 'bg-[var(--color-primary)] !text-white font-bold'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                    }`}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      className="!text-white">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Datos de ejemplo para los escenarios del sandbox ───────────────────────
const DEMO_SETS = {
  categorias: [
    { value: 'electronics', label: '💻 Electrónica' },
    { value: 'ropa', label: '👗 Ropa y Moda' },
    { value: 'hogar', label: '🏠 Hogar y Jardín' },
    { value: 'deportes', label: '⚽ Deportes' },
    { value: 'libros', label: '📚 Libros y Educación' },
    { value: 'juguetes', label: '🧸 Juguetes y Bebés' },
  ],
  tallas: [
    { value: 'xs', label: 'XS — Extra Small' },
    { value: 's', label: 'S — Small' },
    { value: 'm', label: 'M — Medium' },
    { value: 'l', label: 'L — Large' },
    { value: 'xl', label: 'XL — Extra Large' },
    { value: 'xxl', label: 'XXL — Double Extra Large' },
  ],
  estados: [
    { value: 'pendiente', label: '🟡 Pendiente' },
    { value: 'en_proceso', label: '🔵 En Proceso' },
    { value: 'completado', label: '🟢 Completado' },
    { value: 'cancelado', label: '🔴 Cancelado' },
    { value: 'devuelto', label: '⚫ Devuelto' },
  ],
  paises: [
    { value: 'co', label: '🇨🇴 Colombia' },
    { value: 'mx', label: '🇲🇽 México' },
    { value: 'ar', label: '🇦🇷 Argentina' },
    { value: 've', label: '🇻🇪 Venezuela' },
    { value: 'ec', label: '🇪🇨 Ecuador' },
    { value: 'pe', label: '🇵🇪 Perú' },
  ],
};

// ── Sandbox principal ───────────────────────────────────────────────────────
export default function CustomSelectSandbox() {
  const [demoSet, setDemoSet] = useState('categorias');
  const [disabled, setDisabled] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [placeholderText, setPlaceholderText] = useState('Selecciona una opción...');
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [val3, setVal3] = useState('');

  const currentOptions = DEMO_SETS[demoSet] || DEMO_SETS.categorias;

  const controls = [
    {
      type: 'select',
      label: 'Dataset de opciones',
      value: demoSet,
      onChange: (v) => { setDemoSet(v); setVal1(''); setVal2(''); setVal3(''); },
      options: [
        { value: 'categorias', label: 'Categorías de Producto' },
        { value: 'tallas', label: 'Tallas de Ropa' },
        { value: 'estados', label: 'Estados de Pedido' },
        { value: 'paises', label: 'Países' },
      ],
    },
    {
      type: 'toggle',
      label: 'Deshabilitado',
      value: disabled,
      onChange: setDisabled,
    },
    {
      type: 'toggle',
      label: 'Mostrar placeholder',
      value: showPlaceholder,
      onChange: setShowPlaceholder,
    },
    {
      type: 'text',
      label: 'Texto del placeholder',
      value: placeholderText,
      onChange: setPlaceholderText,
    },
  ];

  return (
    <SandboxLayout
      title="CustomSelect"
      description="Selector desplegable animado premium con componente propio. Evita el control nativo del navegador y soporta íconos, z-index inteligente, tap-shield y animaciones Framer Motion."
      controls={controls}
    >
      <div className="w-full max-w-md mx-auto space-y-8 py-4">

        {/* Instancia 1 */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
            Instancia A — Básica
          </p>
          <CustomSelect
            value={val1}
            onChange={setVal1}
            options={currentOptions}
            placeholder={showPlaceholder ? placeholderText : undefined}
            disabled={disabled}
          />
          {val1 && (
            <p className="text-[11px] text-[var(--color-primary)] font-mono">
              onChange → <strong>"{val1}"</strong>
            </p>
          )}
        </div>

        {/* Instancia 2 — Valor pre-seleccionado */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
            Instancia B — Con valor inicial
          </p>
          <CustomSelect
            value={val2 || currentOptions[1]?.value}
            onChange={setVal2}
            options={currentOptions}
            placeholder={showPlaceholder ? placeholderText : undefined}
            disabled={disabled}
          />
          <p className="text-[11px] text-[var(--color-text-muted)] font-mono">
            Valor controlado: <strong>"{val2 || currentOptions[1]?.value}"</strong>
          </p>
        </div>

        {/* Instancia 3 — Dentro de un formulario */}
        <div className="space-y-3 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
            Instancia C — En formulario
          </p>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">
              Selecciona tu opción
            </label>
            <CustomSelect
              value={val3}
              onChange={setVal3}
              options={currentOptions}
              placeholder={showPlaceholder ? placeholderText : undefined}
              disabled={disabled}
            />
          </div>
          <button
            type="button"
            disabled={!val3}
            className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] !text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
          >
            {val3 ? `Confirmar: ${currentOptions.find(o => o.value === val3)?.label}` : 'Selecciona para continuar'}
          </button>
        </div>

        {/* Estado vacío y resumen */}
        <div className="p-3 rounded-xl bg-[var(--color-surface-2)]/20 border border-[var(--color-border)]/40 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Resumen de estado</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'A', val: val1 },
              { label: 'B', val: val2 || currentOptions[1]?.value },
              { label: 'C', val: val3 },
            ].map(({ label, val }) => (
              <div key={label} className="text-center p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <p className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase">Inst. {label}</p>
                <p className="text-[11px] text-[var(--color-primary)] font-mono mt-1 truncate">
                  {val || <span className="text-[var(--color-text-muted)] italic">vacío</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SandboxLayout>
  );
}
