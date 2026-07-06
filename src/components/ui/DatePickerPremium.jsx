import React, { useState, useMemo, useRef, useEffect } from 'react';

// Iconos SVG en línea para portabilidad autónoma
const ChevronLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PRESETS = [
  { id: 'today', label: 'Hoy' },
  { id: 'yesterday', label: 'Ayer' },
  { id: 'last7', label: 'Últimos 7 días' },
  { id: 'thisMonth', label: 'Este mes' },
  { id: 'lastMonth', label: 'Mes anterior' },
];

export default function DatePickerPremium({
  mode = 'single', // 'single' | 'range'
  value, // Date (para single) o { start: Date, end: Date } (para range)
  onChange,
  disabledPast = false,
  minDate = null,
  maxDate = null,
  placeholder = 'Selecciona una fecha...',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  
  // Mes y Año en visualización
  const [currentDate, setCurrentDate] = useState(() => {
    if (mode === 'single' && value instanceof Date) return new Date(value);
    if (mode === 'range' && value?.start instanceof Date) return new Date(value.start);
    return new Date();
  });

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const DAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Días del mes anterior para rellenar
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, totalDaysInPrevMonth - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(currentYear, currentMonth, i);
      days.push({ date: d, isCurrentMonth: true });
    }

    // Días del mes siguiente para rellenar la última fila de la rejilla
    const totalSlots = 42;
    const nextMonthSlots = totalSlots - days.length;
    for (let i = 1; i <= nextMonthSlots; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  }, [currentMonth, currentYear]);

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    if (disabledPast && d < today) return true;
    if (minDate && d < new Date(minDate).setHours(0, 0, 0, 0)) return true;
    if (maxDate && d > new Date(maxDate).setHours(0, 0, 0, 0)) return true;

    return false;
  };

  const formatDateString = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const displayValue = useMemo(() => {
    if (mode === 'single') {
      return value instanceof Date ? formatDateString(value) : '';
    } else {
      if (value?.start instanceof Date && value?.end instanceof Date) {
        return `${formatDateString(value.start)} - ${formatDateString(value.end)}`;
      }
      if (value?.start instanceof Date) {
        return `${formatDateString(value.start)} - ...`;
      }
      return '';
    }
  }, [value, mode]);

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;

    if (mode === 'single') {
      onChange(new Date(date));
      setIsOpen(false);
    } else {
      if (!value?.start || (value.start && value.end)) {
        onChange({ start: new Date(date), end: null });
      } else {
        const start = new Date(value.start);
        const end = new Date(date);
        
        if (end < start) {
          onChange({ start: end, end: start });
        } else {
          onChange({ start, end });
        }
      }
    }
  };

  const isDateSelected = (date) => {
    const d = new Date(date).setHours(0,0,0,0);

    if (mode === 'single') {
      return value instanceof Date && new Date(value).setHours(0,0,0,0) === d;
    } else {
      const start = value?.start instanceof Date ? new Date(value.start).setHours(0,0,0,0) : null;
      const end = value?.end instanceof Date ? new Date(value.end).setHours(0,0,0,0) : null;
      return (start && start === d) || (end && end === d);
    }
  };

  const isDateInRange = (date) => {
    if (mode !== 'range' || !value?.start || !value?.end) return false;
    const d = new Date(date).setHours(0,0,0,0);
    const start = new Date(value.start).setHours(0,0,0,0);
    const end = new Date(value.end).setHours(0,0,0,0);
    return d > start && d < end;
  };

  const applyPreset = (presetId) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    let start, end;

    switch (presetId) {
      case 'today':
        start = new Date(today);
        end = new Date(today);
        break;
      case 'yesterday':
        start = new Date(today);
        start.setDate(today.getDate() - 1);
        end = new Date(start);
        break;
      case 'last7':
        start = new Date(today);
        start.setDate(today.getDate() - 6);
        end = new Date(today);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }

    onChange({ start, end });
    setCurrentDate(new Date(start));
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-left bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-primary)]/50 outline-none transition-all cursor-pointer shadow-sm min-h-[36px]"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-[var(--color-text-muted)] shrink-0"><CalendarIcon /></span>
          <span className={displayValue ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]/60'}>
            {displayValue || placeholder}
          </span>
        </div>
        <span className="text-[var(--color-text-muted)] transition-transform duration-200 shrink-0" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[999] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row max-w-[500px]">
          {mode === 'range' && (
            <div className="p-3 bg-[var(--color-surface-2)]/60 border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible shrink-0 md:w-32">
              <span className="hidden md:block text-[8px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2 px-1">Atajos rápidos</span>
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className="px-2 py-1.5 text-left rounded-lg text-[9px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors shrink-0 whitespace-nowrap"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          <div className="p-4 flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-[var(--color-text)]">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg cursor-pointer transition-colors"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg cursor-pointer transition-colors"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAY_LABELS.map(day => (
                <span key={day} className="text-[9px] font-black uppercase text-[var(--color-text-muted)] py-0.5">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((item, idx) => {
                const isSelected = isDateSelected(item.date);
                const isInRange = isDateInRange(item.date);
                const isDisabled = isDateDisabled(item.date);
                const isCurrentMonth = item.isCurrentMonth;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDateClick(item.date)}
                    className={`relative aspect-square flex items-center justify-center text-[10px] rounded-lg cursor-pointer select-none font-bold transition-all focus:outline-none ${
                      !isCurrentMonth ? 'text-[var(--color-text-muted)] opacity-35' : 'text-[var(--color-text)]'
                    } ${
                      isSelected
                        ? 'bg-[var(--color-primary)] text-white shadow-md hover:bg-[var(--color-primary-hover)] rounded-lg scale-105 z-10'
                        : isInRange
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-none'
                          : 'hover:bg-[var(--color-surface-2)]'
                    } ${
                      isDisabled ? 'opacity-20 pointer-events-none cross-through' : ''
                    }`}
                  >
                    <span>{item.date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
