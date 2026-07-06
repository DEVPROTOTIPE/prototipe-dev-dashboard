import React from 'react'
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

export default function GuidedToast({
  isVisible = false,
  message = "",
  type = "info", // 'info', 'success', 'warning', 'error'
  onClose = () => {},
  onActionClick = null,
  actionText = ""
}) {
  if (!isVisible || !message) return null

  // Colores y diseño basados en el tipo de Toast
  const config = {
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/20 text-red-400',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />
    },
    info: {
      bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      glow: 'shadow-[0_0_20px_rgba(99,102,241,0.15)]',
      icon: <Info className="w-5 h-5 text-indigo-400" />
    }
  }[type] || {
    bg: 'bg-slate-900/90 border-slate-800 text-slate-100',
    glow: 'shadow-lg',
    icon: <Info className="w-5 h-5 text-slate-400" />
  }

  return (
    <div className={`fixed bottom-6 left-4 right-4 md:left-auto md:right-6 z-[9999] w-auto md:w-full md:max-w-sm border backdrop-blur-xl p-4.5 rounded-2xl flex items-start gap-3.5 transition-all duration-300 animate-slide-in-right ${config.bg} ${config.glow}`}>
      {/* Icono de Tipo */}
      <div className="shrink-0 mt-0.5">
        {config.icon}
      </div>

      {/* Mensaje */}
      <div className="flex-1 min-w-0 pr-3.5">
        <p className="text-xs font-bold leading-relaxed">{message}</p>
        
        {/* Acción opcional */}
        {onActionClick && actionText && (
          <button
            onClick={onActionClick}
            className="mt-2 text-[10px] font-black uppercase tracking-wider text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            {actionText}
          </button>
        )}
      </div>

      {/* Botón de Cerrar */}
      <button
        onClick={onClose}
        className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded-lg hover:bg-white/5 cursor-pointer"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
