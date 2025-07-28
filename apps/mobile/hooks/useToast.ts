import type { ToastConfig, ToastPosition } from '@/context/ToastContext'
import { use, useCallback } from 'react'
import { ToastContext } from '@/context/ToastContext'

interface Toast {
  success: (message: string, position?: ToastPosition, duration?: number) => void
  error: (message: string, position?: ToastPosition, duration?: number) => void
  warning: (message: string, position?: ToastPosition, duration?: number) => void
  info: (message: string, position?: ToastPosition, duration?: number) => void
  show: (config: ToastConfig) => void
  hide: () => void
}

export function useToast(): Toast {
  const context = use(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  const showSuccess = useCallback((message: string, position?: ToastPosition, duration?: number) => {
    context.showToast({ message, type: 'success', position, duration })
  }, [context])

  const showError = useCallback((message: string, position?: ToastPosition, duration?: number) => {
    context.showToast({ message, type: 'error', position, duration })
  }, [context])

  const showWarning = useCallback((message: string, position?: ToastPosition, duration?: number) => {
    context.showToast({ message, type: 'warning', position, duration })
  }, [context])

  const showInfo = useCallback((message: string, position?: ToastPosition, duration?: number) => {
    context.showToast({ message, type: 'info', position, duration })
  }, [context])

  const toast: Toast = {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    hide: context.hideToast,
    show: context.showToast,
  }

  return toast
}
