import { createContext } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'
export type ToastPosition = 'top' | 'center' | 'bottom'

export interface ToastConfig {
  message: string
  type?: ToastType
  duration?: number
  position?: ToastPosition
}

export interface ToastContextType {
  showToast: (config: ToastConfig) => void
  hideToast: () => void
}

export const ToastContext = createContext<ToastContextType | null>(null)
