import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export default function CustomSelect({ value, onChange, options = [], placeholder = 'Seleccionar...', icon: Icon, direction = 'down' }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  const selectedOption = options.find(o => o.value === value)

  return (
    <div ref={dropdownRef} className={`relative w-full ${isOpen ? 'z-40' : 'z-0'}`}>
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className={`w-full flex items-center justify-between bg-[var(--color-surface-2)]/60 border rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer select-none ${
          isOpen
            ? 'border-indigo-500/40 text-[var(--color-text)] bg-[var(--color-surface-2)]'
            : 'border-[var(--color-border)] text-[var(--color-text)] hover:border-indigo-500/30'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={12} className="text-indigo-400 shrink-0" />}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={12}
          className={`text-[var(--color-text-muted)] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && options.length > 0 && (
        <div className={`absolute left-0 right-0 z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl shadow-black/30 max-h-48 overflow-y-auto backdrop-blur-md animate-scale-up ${
          direction === 'up' ? 'bottom-full mb-1.5 origin-bottom' : 'top-full mt-1.5 origin-top'
        }`}>
          {options.map(o => {
            const isActive = o.value === value
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setIsOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-left transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-300'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-indigo-400' : 'bg-[var(--color-border)]'}`} />
                <span className="truncate">{o.label}</span>
                {isActive && <Check size={11} className="ml-auto text-indigo-400" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
