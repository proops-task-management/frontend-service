export type ToastKind = 'success' | 'error' | 'info'

export interface ToastEventDetail {
  kind: ToastKind
  message: string
}

export const TOAST_EVENT_NAME = 'app:toast'

export function emitToast(message: string, kind: ToastKind = 'info') {
  window.dispatchEvent(new CustomEvent<ToastEventDetail>(TOAST_EVENT_NAME, {
    detail: { kind, message },
  }))
}
