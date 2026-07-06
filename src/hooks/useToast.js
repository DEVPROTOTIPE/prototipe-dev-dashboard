import { useState, useCallback, useRef } from 'react'

export default function useToast() {
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'info', // 'info', 'success', 'warning', 'error'
    actionText: '',
    onActionClick: null
  })
  
  const timerRef = useRef(null)

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }))
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const showToast = useCallback((message, { type = 'info', actionText = '', onActionClick = null, duration = 3500 } = {}) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setToast({
      isVisible: true,
      message,
      type,
      actionText,
      onActionClick: onActionClick ? () => {
        onActionClick()
        hideToast()
      } : null
    })

    timerRef.current = setTimeout(() => {
      hideToast()
    }, duration)
  }, [hideToast])

  return {
    toast,
    showToast,
    hideToast
  }
}
