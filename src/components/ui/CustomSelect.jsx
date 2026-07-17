import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'

export default function CustomSelect({ value, onChange, options = [], placeholder = 'Seleccionar...', icon: Icon, direction = 'down' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState(null)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)

  // Calcula la posición del panel en coordenadas de viewport (position: fixed)
  // a partir del botón disparador. Se renderiza en un portal a document.body
  // para que nunca quede recortado ni por detrás de otros elementos dentro de
  // contenedores con overflow-y-auto/hidden (modales, tarjetas, grids) — ver
  // component-library.md §5.13.
  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setCoords({ top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width })
  }, [])

  useLayoutEffect(() => {
    if (!isOpen) return
    updateCoords()
  }, [isOpen, updateCoords])

  useEffect(() => {
    if (!isOpen) return
    const handleOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }
    const handleReposition = () => updateCoords()
    document.addEventListener('mousedown', handleOutside)
    window.addEventListener('scroll', handleReposition, true)
    window.addEventListener('resize', handleReposition)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      window.removeEventListener('scroll', handleReposition, true)
      window.removeEventListener('resize', handleReposition)
    }
  }, [isOpen, updateCoords])

  const selectedOption = options.find(o => o.value === value)

  const panel = isOpen && options.length > 0 && coords ? createPortal(
    <div
      ref={panelRef}
      className="fixed z-[999] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl shadow-black/30 max-h-48 overflow-y-auto backdrop-blur-md animate-scale-up"
      style={{
        left: coords.left,
        width: coords.width,
        ...(direction === 'up'
          ? { bottom: window.innerHeight - coords.top + 6 }
          : { top: coords.bottom + 6 })
      }}
    >
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
    </div>,
    document.body
  ) : null

  return (
    <div ref={triggerRef} className="relative w-full">
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

      {panel}
    </div>
  )
}
