import React, { createContext, useContext, useState, useCallback } from 'react'
import { Check, AlertTriangle, Info, X } from 'lucide-react'

const AlertConfirmContext = createContext(null)

export function AlertConfirmProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'alert', // 'alert' | 'confirm'
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    resolve: null,
    variant: 'info' // 'info' | 'success' | 'warning' | 'error'
  })

  const showAlert = useCallback(({ title = 'Atención', message = '', variant = 'info', confirmText = 'Aceptar' }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'alert',
        title,
        message,
        confirmText,
        cancelText: '',
        resolve,
        variant
      })
    })
  }, [])

  const showConfirm = useCallback(({ 
    title = 'Confirmar acción', 
    message = '¿Estás seguro de realizar esta acción?', 
    confirmText = 'Confirmar', 
    cancelText = 'Cancelar',
    variant = 'warning'
  }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        resolve,
        variant
      })
    })
  }, [])

  const handleClose = (result) => {
    const { resolve } = modalState
    setModalState((prev) => ({ ...prev, isOpen: false }))
    if (resolve) resolve(result)
  }

  const getHeaderIcon = () => {
    const baseClass = "w-14 h-14 rounded-2xl flex items-center justify-center border mx-auto mb-4"
    switch (modalState.variant) {
      case 'success':
        return (
          <div className={`${baseClass} bg-emerald-500/10 border-emerald-500/20 text-emerald-400`}>
            <Check className="w-6 h-6 animate-bounce" />
          </div>
        )
      case 'error':
        return (
          <div className={`${baseClass} bg-red-500/10 border-red-500/20 text-red-400`}>
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
        )
      case 'warning':
        return (
          <div className={`${baseClass} bg-amber-500/10 border-amber-500/20 text-amber-400`}>
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
        )
      case 'info':
      default:
        return (
          <div className={`${baseClass} bg-indigo-500/10 border-indigo-500/20 text-indigo-400`}>
            <Info className="w-6 h-6" />
          </div>
        )
    }
  }

  const contextValue = showConfirm;
  contextValue.showAlert = showAlert;
  contextValue.showConfirm = showConfirm;
  contextValue.alertConfirm = showConfirm;

  return (
    <AlertConfirmContext.Provider value={contextValue}>
      {children}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[999] bg-[#070b13]/80 backdrop-blur-md flex items-center justify-center p-4">
          {/* Backdrop Tap to close (only on alerts, or optionally) */}
          <div className="absolute inset-0" onClick={() => modalState.type === 'alert' && handleClose(false)} />
          
          <div className="relative bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-scale-up z-10">
            {getHeaderIcon()}
            <h3 className="text-base font-extrabold text-slate-100 mb-2">{modalState.title}</h3>
            <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed max-w-xs mx-auto mb-6">{modalState.message}</p>
            
            <div className="flex gap-3">
              {modalState.type === 'confirm' && (
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 h-11 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  {modalState.cancelText}
                </button>
              )}
              <button
                onClick={() => handleClose(true)}
                className={`flex-1 h-11 text-white font-bold text-xs transition-all active:scale-[0.98] cursor-pointer rounded-xl ${
                  modalState.variant === 'error'
                    ? 'bg-red-600 hover:bg-red-500'
                    : modalState.variant === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-500'
                      : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {modalState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertConfirmContext.Provider>
  )
}

export function useAlertConfirm() {
  const context = useContext(AlertConfirmContext)
  if (!context) throw new Error('useAlertConfirm debe ser usado dentro de un AlertConfirmProvider')
  return context
}
