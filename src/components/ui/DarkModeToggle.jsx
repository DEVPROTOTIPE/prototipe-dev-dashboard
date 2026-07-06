import React from 'react'
import { Sun, Moon } from 'lucide-react'

export default function DarkModeToggle({
  isDark = false,
  onToggle = () => {},
  className = ""
}) {
  return (
    <button
      onClick={onToggle}
      className={`
        focus:outline-none focus:ring-2 focus:ring-indigo-500/20
        hover:scale-105 active:scale-95
        p-2.5 rounded-xl border transition-all duration-300 cursor-pointer
        flex items-center justify-center
        ${isDark 
          ? 'bg-[var(--color-surface-2)]/80 hover:bg-[var(--color-surface-2)] border-[var(--color-border)] text-amber-400' 
          : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-primary)] shadow-sm'}
        ${className}
      `}
      title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
    >
      <div 
        className="transition-transform duration-500 ease-out"
        style={{
          transform: isDark ? 'rotate(360deg)' : 'rotate(0deg)'
        }}
      >
        {isDark ? <Moon size={18} /> : <Sun size={18} />}
      </div>
    </button>
  )
}
