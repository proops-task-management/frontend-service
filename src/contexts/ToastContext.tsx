import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { emitToast, ToastEventDetail, ToastKind, TOAST_EVENT_NAME } from '../lib/toastBus'

interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function getToastClasses(kind: ToastKind) {
  switch (kind) {
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800'
    case 'error':
      return 'border-red-200 bg-red-50 text-red-800'
    default:
      return 'border-slate-200 bg-white text-slate-800'
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  function showToast(message: string, kind: ToastKind = 'info') {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, kind, message }])
    window.setTimeout(() => removeToast(id), 4000)
  }

  useEffect(() => {
    function handleToast(event: Event) {
      const customEvent = event as CustomEvent<ToastEventDetail>
      showToast(customEvent.detail.message, customEvent.detail.kind)
    }

    window.addEventListener(TOAST_EVENT_NAME, handleToast as EventListener)
    return () => window.removeEventListener(TOAST_EVENT_NAME, handleToast as EventListener)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-lg ${getToastClasses(toast.kind)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-xs opacity-70 transition hover:opacity-100"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export { emitToast }
