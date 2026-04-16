import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../api/errorMessage'
import {
  getNotifications,
  markNotificationRead,
  NotificationItem,
  NOTIFICATIONS_REFRESH_EVENT,
} from '../api/notifications'
import { formatDateTime } from '../lib/datetime'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  )

  async function loadNotifications(showErrors = false) {
    setLoading(true)
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch (error) {
      if (showErrors) {
        toast.error(getApiErrorMessage(error, 'Failed to load notifications.'))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()

    const intervalId = window.setInterval(() => {
      loadNotifications()
    }, 5000)

    function handleRefreshRequest() {
      loadNotifications()
    }

    function handleWindowFocus() {
      loadNotifications()
    }

    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefreshRequest)
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefreshRequest)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  async function handleToggle() {
    const nextOpen = !open
    setOpen(nextOpen)
    if (nextOpen) {
      await loadNotifications(true)
    }
  }

  async function handleMarkRead(notificationId: string) {
    try {
      await markNotificationRead(notificationId)
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item,
        ),
      )
      toast.success('Notification marked as read.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update notification.'))
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative rounded-full border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              <p className="text-xs text-gray-500">Unread: {unreadCount}</p>
            </div>
            <button
              type="button"
              onClick={() => loadNotifications(true)}
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              Refresh
            </button>
          </div>

          {loading && <p className="py-6 text-center text-sm text-gray-500">Loading notifications...</p>}

          {!loading && notifications.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-500">No notifications yet.</p>
          )}

          {!loading && notifications.length > 0 && (
            <ul className="max-h-96 space-y-3 overflow-y-auto">
              {notifications.map((item) => (
                <li
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 ${
                    item.isRead ? 'border-gray-200 bg-gray-50' : 'border-indigo-100 bg-indigo-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.message}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">{item.eventType}</p>
                      <p className="mt-2 text-xs text-gray-500">{formatDateTime(item.createdAt)}</p>
                    </div>
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(item.id)}
                        className="shrink-0 text-xs font-medium text-indigo-600 hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
