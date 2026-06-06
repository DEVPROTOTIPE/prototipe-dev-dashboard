import React, { useState } from 'react';
import { X, ChevronRight, Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAlertConfirm } from '../../common/AlertConfirmContext';

export default function SistemaNotificacionesSandbox() {
  const { showAlert } = useAlertConfirm();
  const [toastType, setToastType] = useState('success');
  const [toastTitle, setToastTitle] = useState('Pedido confirmado');
  const [toastMessage, setToastMessage] = useState('Tu pedido #1234 fue procesado exitosamente.');
  const [duration, setDuration] = useState('4500');
  const [showProgress, setShowProgress] = useState(true);
  const [pauseOnHover, setPauseOnHover] = useState(true);
  const [hasAction, setHasAction] = useState(false);
  const [actionLabel, setActionLabel] = useState('Ver pedido');
  const [addToHistory, setAddToHistory] = useState(true);

  const [liveToasts, setLiveToasts] = useState([]);
  const [history, setHistory] = useState([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [trayOpen, setTrayOpen] = useState(false);

  const removeToast = (id) => setLiveToasts(prev => prev.filter(t => t.id !== id));

  const fireToast = () => {
    const id = `toast-${Date.now()}`;
    const toast = {
      id, type: toastType, title: toastTitle,
      message: toastMessage,
      duration: Number(duration),
      showProgress, pauseOnHover,
      action: hasAction ? { label: actionLabel, onClick: () => {} } : null,
      createdAt: Date.now(),
    };
    setLiveToasts(prev => [...prev.slice(-4), toast]);
    if (addToHistory) {
      setHistory(prev => [{ ...toast, read: false }, ...prev].slice(0, 20));
      setBadgeCount(c => c + 1);
    }
    if (Number(duration) > 0) {
      setTimeout(() => removeToast(id), Number(duration));
    }
  };

  const TYPES = ['success', 'error', 'warning', 'info', 'event', 'mention'];
  const TYPE_CONFIG = {
    success: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500', border: 'border-emerald-500/40', label: 'Éxito ✓' },
    error:   { color: 'text-red-400',     bg: 'bg-red-500/10',     bar: 'bg-red-500',     border: 'border-red-500/40',     label: 'Error ✕' },
    warning: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   bar: 'bg-amber-500',   border: 'border-amber-500/40',   label: 'Alerta ⚠' },
    info:    { color: 'text-blue-400',    bg: 'bg-blue-500/10',    bar: 'bg-blue-500',    border: 'border-blue-500/40',    label: 'Info ℹ' },
    event:   { color: 'text-purple-400',  bg: 'bg-purple-500/10',  bar: 'bg-purple-500',  border: 'border-purple-500/40',  label: 'Evento 🛒' },
    mention: { color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    bar: 'bg-cyan-500',    border: 'border-cyan-500/40',    label: 'Mención @' },
  };

  const cfg = TYPE_CONFIG[toastType] || TYPE_CONFIG.info;

  const generatedCode = `notify.${toastType}(
  "${toastTitle}",
  "${toastMessage}",
  {
    duration: ${duration},
    showProgress: ${showProgress},
    pauseOnHover: ${pauseOnHover},${hasAction ? `\n    action: { label: "${actionLabel}", onClick: () => navigate('/orders') },` : ''}
  }
);`;

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-xs font-black text-[var(--color-text)]">Sistema de Notificaciones Premium</h4>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
          Configura cada parámetro en vivo. El código generado debajo es el que debes usar con el cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Columna izquierda: Configurador */}
        <div className="space-y-4">
          {/* Tipo de Toast */}
          <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-wider">1. Tipo de notificación</p>
            <div className="grid grid-cols-3 gap-1.5">
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setToastType(t);
                    const presets = {
                      success: { title: 'Operación exitosa', message: 'Los cambios fueron guardados correctamente.' },
                      error:   { title: 'Error al procesar', message: 'No se pudo completar la acción. Intenta de nuevo.' },
                      warning: { title: 'Atención requerida', message: 'Esta acción no se puede deshacer. ¿Continuar?' },
                      info:    { title: 'Actualización disponible', message: 'Una nueva versión del sistema está lista.' },
                      event:   { title: 'Nuevo pedido #4821', message: 'Mesa 3 acaba de realizar un pedido.' },
                      mention: { title: 'Te mencionaron', message: 'Carlos: "@usuario revisa el inventario"' },
                    };
                    setToastTitle(presets[t].title);
                    setToastMessage(presets[t].message);
                  }}
                  className={`px-2 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                    toastType === t
                      ? `${TYPE_CONFIG[t].bg} ${TYPE_CONFIG[t].border} ${TYPE_CONFIG[t].color}`
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]'
                  }`}
                >
                  {TYPE_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido */}
          <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-wider">2. Contenido</p>
            <div className="space-y-2">
              <div>
                <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Título</label>
                <input
                  value={toastTitle}
                  onChange={e => setToastTitle(e.target.value)}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-[11px] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                  placeholder="Título del toast..."
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Mensaje</label>
                <textarea
                  value={toastMessage}
                  onChange={e => setToastMessage(e.target.value)}
                  rows={2}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-[11px] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none"
                  placeholder="Descripción del evento..."
                />
              </div>
            </div>
          </div>

          {/* Comportamiento */}
          <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-wider">3. Comportamiento</p>
            <div className="space-y-2.5">
              {/* Duración */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-[var(--color-text)]">Auto-descarte</p>
                  <p className="text-[9px] text-[var(--color-text-muted)]">0 = permanente hasta X</p>
                </div>
                <div className="flex gap-1">
                  {[['0', 'Perm.'], ['3000', '3s'], ['4500', '4.5s'], ['7000', '7s']].map(([val, lbl]) => (
                    <button
                      key={val}
                      onClick={() => setDuration(val)}
                      className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                        duration === val
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-indigo-400/40'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle: Barra de progreso */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-[var(--color-text)]">Barra de progreso</p>
                <button
                  onClick={() => setShowProgress(v => !v)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-200 ease-in-out cursor-pointer outline-none focus:outline-none ${
                    showProgress ? 'bg-indigo-600 border-indigo-500' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ml-0.5 ${showProgress ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Toggle: Pausar en hover */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-[var(--color-text)]">Pausar al hacer hover</p>
                <button
                  onClick={() => setPauseOnHover(v => !v)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-200 ease-in-out cursor-pointer outline-none focus:outline-none ${
                    pauseOnHover ? 'bg-indigo-600 border-indigo-500' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ml-0.5 ${pauseOnHover ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Toggle: Guardar en historial */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-[var(--color-text)]">Guardar en historial (bandeja)</p>
                <button
                  onClick={() => setAddToHistory(v => !v)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-200 ease-in-out cursor-pointer outline-none focus:outline-none ${
                    addToHistory ? 'bg-indigo-600 border-indigo-500' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ml-0.5 ${addToHistory ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Toggle: Botón de acción */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-[var(--color-text)]">Botón de acción clickeable</p>
                  <button
                    onClick={() => setHasAction(v => !v)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-200 ease-in-out cursor-pointer outline-none focus:outline-none ${
                      hasAction ? 'bg-indigo-600 border-indigo-500' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ml-0.5 ${hasAction ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
                <AnimatePresence>
                  {hasAction && (
                    <motion.input
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      value={actionLabel}
                      onChange={e => setActionLabel(e.target.value)}
                      className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-[11px] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                      placeholder="Texto del botón (ej: Ver pedido)"
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Código generado */}
          <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-4 space-y-2">
            <p className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-wider">4. Código generado</p>
            <pre className="text-[10px] font-mono text-emerald-400 bg-[var(--color-bg)]/60 rounded-xl p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap">{generatedCode}</pre>
          </div>
        </div>

        {/* Columna derecha: Preview + Campana + Historial */}
        <div className="flex flex-col gap-4">
          {/* Preview del toast */}
          <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-wider">Preview en vivo</p>

            <div className={`rounded-2xl border-l-[3px] ${cfg.border} bg-[var(--color-surface)] shadow-xl overflow-hidden`}>
              {showProgress && Number(duration) > 0 && (
                <div className="h-0.5 bg-[var(--color-border)]">
                  <div className={`h-full ${cfg.bar} w-[60%] transition-all`} />
                </div>
              )}
              <div className="flex items-start gap-3 p-3.5 pt-4">
                <div className={`p-1.5 rounded-xl shrink-0 ${cfg.bg}`}>
                  <div className={`w-3.5 h-3.5 rounded-full ${cfg.bar} opacity-80`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-[var(--color-text)] leading-tight">{toastTitle || 'Título del toast'}</p>
                  {toastMessage && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{toastMessage}</p>}
                  {hasAction && actionLabel && (
                    <button className={`mt-1.5 flex items-center gap-1 text-[10px] font-bold ${cfg.color} cursor-pointer`}>
                      {actionLabel} <ChevronRight size={9} />
                    </button>
                  )}
                </div>
                <div className="shrink-0 p-1 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                  <X size={12} />
                </div>
              </div>
            </div>

            <button
              onClick={fireToast}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-[11px] font-black uppercase rounded-xl text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer tracking-wider"
            >
              🚀 Disparar Toast
            </button>
          </div>

          {/* Campana con badge */}
          <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-wider">Campana + Bandeja</p>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => { setTrayOpen(v => !v); setBadgeCount(0); }}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    trayOpen
                      ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-400'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  <Bell size={16} strokeWidth={1.8} />
                </button>
                <AnimatePresence>
                  {badgeCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full shadow-lg"
                    >
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                {badgeCount > 0 ? `${badgeCount} sin leer — clic para ver` : 'Sin notificaciones nuevas'}
              </p>
            </div>

            <AnimatePresence>
              {trayOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border border-[var(--color-border)] rounded-xl overflow-hidden max-h-[200px] overflow-y-auto">
                    {history.length === 0 ? (
                      <div className="py-6 text-center text-[10px] text-[var(--color-text-muted)] opacity-50">Sin historial aún</div>
                    ) : (
                      history.map(n => {
                        const c = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                        return (
                          <div key={n.id} className="flex items-start gap-2.5 px-3 py-2.5 border-b border-[var(--color-border)]/40 hover:bg-[var(--color-surface-2)]/40 transition-colors">
                            <div className={`p-1 rounded-lg shrink-0 ${c.bg} mt-0.5`}>
                              <div className={`w-2.5 h-2.5 rounded-full ${c.bar} opacity-80`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-[var(--color-text)] truncate">{n.title}</p>
                              {n.message && <p className="text-[9px] text-[var(--color-text-muted)] truncate">{n.message}</p>}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {history.length > 0 && (
                    <button
                      onClick={() => setHistory([])}
                      className="mt-1.5 w-full text-[9px] text-[var(--color-text-muted)] hover:text-red-400 transition-colors cursor-pointer text-center"
                    >
                      Limpiar historial
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Toasts en vivo flotantes */}
          <div className="relative">
            <AnimatePresence>
              {liveToasts.map((toast, i) => {
                const c = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;
                return (
                  <motion.div
                    key={toast.id}
                    initial={{ opacity: 0, x: 40, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 40, scale: 0.9 }}
                    className={`mb-2 rounded-2xl border-l-[3px] ${c.border} bg-[var(--color-surface)] shadow-lg overflow-hidden`}
                  >
                    {toast.showProgress && toast.duration > 0 && (
                      <div className="h-0.5 bg-[var(--color-border)]">
                        <motion.div
                          className={`h-full ${c.bar}`}
                          initial={{ width: '100%' }}
                          animate={{ width: '0%' }}
                          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                        />
                      </div>
                    )}
                    <div className="flex items-start gap-2.5 p-3">
                      <div className={`p-1 rounded-lg shrink-0 ${c.bg} mt-0.5`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${c.bar} opacity-80`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-[var(--color-text)]">{toast.title}</p>
                        {toast.message && <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">{toast.message}</p>}
                        {toast.action && (
                          <span className={`text-[9px] font-bold ${c.color} mt-1 block`}>{toast.action.label} →</span>
                        )}
                      </div>
                      <button onClick={() => removeToast(toast.id)} className="shrink-0 p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
                        <X size={10} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
