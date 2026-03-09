'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type: ToastType, duration?: number) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = Date.now().toString()
    const toast: Toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, clearAll }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

// Componente para mostrar los toasts
function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const colors = {
    success: { bg: '#10b981', icon: '✓' },
    error: { bg: '#ef4444', icon: '✕' },
    info: { bg: '#3b82f6', icon: 'ℹ' },
    warning: { bg: '#f59e0b', icon: '!' }
  }

  const { bg, icon } = colors[toast.type]

  return (
    <div
      style={{
        background: bg,
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'slideIn 0.3s ease-out',
        minWidth: '300px'
      }}
    >
      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{icon}</span>
      <span style={{ flex: 1, fontSize: '0.95rem' }}>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255,255,255,0.3)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '1rem',
          transition: 'background 0.2s'
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.5)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
      >
        ×
      </button>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
