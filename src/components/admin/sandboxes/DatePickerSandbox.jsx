import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

const DAYS_ES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function DatePickerPortal({ value, onChange, open, setOpen }) {
  const today = new Date();
  const selected = value ? new Date(value + 'T12:00:00') : null;

  const [viewYear, setViewYear] = useState(selected ? selected.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected ? selected.getMonth() : today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectDay = (d) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const isSelected = (d) => selected &&
    selected.getDate() === d && selected.getMonth() === viewMonth && selected.getFullYear() === viewYear;
  const isToday = (d) =>
    today.getDate() === d && today.getMonth() === viewMonth && today.getFullYear() === viewYear;

  if (!open) return null;

  const calendar = (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        onClick={() => setOpen(false)}
        className="fixed inset-0 bg-black/35 z-[9998]"
      />
      
      <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="pointer-events-auto w-[min(320px,calc(100vw-32px))] bg-[var(--color-surface)] rounded-[1.25rem] border border-[var(--color-border)] shadow-2xl p-5"
        >
          <div className="text-center mb-1">
            <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Seleccionar fecha</p>
          </div>

          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-surface-2)] transition-all active:scale-90 cursor-pointer hover:bg-[var(--color-surface-3)]"
            >
              <ChevronDown size={18} className="rotate-90" />
            </button>
            <span className="text-sm font-bold text-[var(--color-text)]">
              {MONTHS_ES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-surface-2)] transition-all active:scale-90 cursor-pointer hover:bg-[var(--color-surface-3)]"
            >
              <ChevronDown size={18} className="-rotate-90" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS_ES.map(d => (
              <div key={d} className="text-center text-[11px] font-bold text-[var(--color-text-muted)] py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((d, i) => (
              <div key={i} className="flex items-center justify-center">
                {d ? (
                  <button
                    type="button"
                    onClick={() => selectDay(d)}
                    className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all active:scale-90 cursor-pointer flex items-center justify-center
                      ${isSelected(d)
                        ? 'bg-indigo-600 text-white shadow-md font-bold'
                        : isToday(d)
                        ? 'font-bold ring-2 ring-indigo-500/40 text-indigo-400 bg-indigo-500/10'
                        : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                      }
                    `}
                  >
                    {d}
                  </button>
                ) : <div />}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] font-medium px-3 py-1.5 rounded-lg transition-colors active:scale-95 cursor-pointer"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => {
                const t = new Date();
                const mm = String(t.getMonth()+1).padStart(2,'0');
                const dd = String(t.getDate()).padStart(2,'0');
                onChange(`${t.getFullYear()}-${mm}-${dd}`);
                setOpen(false);
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition-all active:scale-95 cursor-pointer"
            >
              Hoy
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );

  return ReactDOM.createPortal(calendar, document.body);
}

function DatePicker({ value, onChange, placeholder = 'Seleccionar fecha' }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  const selected = value ? new Date(value + 'T12:00:00') : null;
  const display = selected
    ? `${String(selected.getDate()).padStart(2,'0')}/${String(selected.getMonth()+1).padStart(2,'0')}/${selected.getFullYear()}`
    : '';

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full h-11 pl-4 pr-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium flex items-center transition-colors cursor-pointer relative"
        style={{
          color: display ? 'var(--color-text)' : 'var(--color-text-muted)',
          borderColor: open ? 'var(--color-primary)' : undefined
        }}
      >
        {display || <span className="text-[var(--color-text-muted)]">{placeholder}</span>}
        <span className={`absolute right-3 transition-colors ${open ? 'text-indigo-500' : 'text-[var(--color-text-muted)]'}`}>
          <CalendarDays size={16} />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <DatePickerPortal
            value={value}
            onChange={(dateVal) => onChange({ target: { value: dateVal } })}
            open={open}
            setOpen={setOpen}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DatePickerSandbox() {
  const [value, setValue] = useState('2026-06-06');
  const [placeholder, setPlaceholder] = useState('Selecciona fecha...');

  return (
    <SandboxLayout
      title="Date Picker"
      description="Selector de fecha individual autocontenido con Portal de React y soporte de atajos rápidos."
      controls={[
        { label: 'Placeholder', type: 'text', value: placeholder, onChange: setPlaceholder },
      ]}
    >
      <div className="w-full space-y-3 text-left">
        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Fecha Operativa</label>
        
        <DatePicker
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
        />

        <div className="flex justify-between items-center bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl p-3 text-[10px] mt-2">
          <span className="font-semibold text-[var(--color-text-muted)]">Fecha de Reporte (Padre):</span>
          <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {value ? value : '"" (sin seleccionar)'}
          </span>
        </div>
      </div>
    </SandboxLayout>
  );
}
