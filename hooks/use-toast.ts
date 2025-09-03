'use client'

import * as React from 'react'
import type { ToastActionElement, ToastProps } from '@/components/ui/toast'

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  duration?: number
  variant?: 'default' | 'destructive'
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

interface ToastContextType {
  toasts: ToasterToast[]
  toast: (props: Omit<ToasterToast, 'id'>) => { id: string; dismiss: () => void; update: (props: Partial<ToasterToast>) => void }
  dismiss: (toastId?: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([])

  const addToast = React.useCallback((toast: Omit<ToasterToast, 'id'>) => {
    const id = genId()
    const newToast: ToasterToast = {
      ...toast,
      id,
      duration: toast.duration ?? TOAST_REMOVE_DELAY,
      open: true,
    }

    setToasts(prev => [newToast, ...prev].slice(0, TOAST_LIMIT))

    // Auto dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, newToast.duration)
    }

    return {
      id,
      dismiss: () => dismissToast(id),
      update: (props: Partial<ToasterToast>) => updateToast(id, props),
    }
  }, [])

  const updateToast = React.useCallback((id: string, props: Partial<ToasterToast>) => {
    setToasts(prev =>
      prev.map(toast =>
        toast.id === id ? { ...toast, ...props } : toast
      )
    )
  }, [])

  const dismissToast = React.useCallback((id?: string) => {
    if (id) {
      setToasts(prev =>
        prev.map(toast =>
          toast.id === id ? { ...toast, open: false } : toast
        )
      )
      // Remove from DOM after animation
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, 1000)
    } else {
      setToasts(prev => prev.map(toast => ({ ...toast, open: false })))
      setTimeout(() => {
        setToasts([])
      }, 1000)
    }
  }, [])

  const contextValue = React.useMemo(() => ({
    toasts,
    toast: addToast,
    dismiss: dismissToast,
  }), [toasts, addToast, dismissToast])

  return React.createElement(ToastContext.Provider, { value: contextValue }, children)
}

function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Convenience function for direct toast calls
function toast(props: Omit<ToasterToast, 'id'>) {
  // This will work only if called within a React component tree with ToastProvider
  // For programmatic usage, components should use the useToast hook
  console.warn('toast() function called outside of React context. Use useToast() hook instead.')
  return { id: '', dismiss: () => {}, update: () => {} }
}

export { useToast, toast, type ToasterToast }
