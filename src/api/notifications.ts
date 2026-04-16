import apiClient from './client'

export const NOTIFICATIONS_REFRESH_EVENT = 'notifications:refresh'

export interface NotificationItem {
  id: string
  eventType: string
  message: string
  isRead: boolean
  createdAt: string
}

interface ApiNotificationItem {
  id: string
  event_type: string
  message: string
  is_read: boolean
  created_at: string
}

interface ApiMarkReadResponse {
  id: string
  is_read: boolean
}

function mapNotification(item: ApiNotificationItem): NotificationItem {
  return {
    id: item.id,
    eventType: item.event_type,
    message: item.message,
    isRead: item.is_read,
    createdAt: item.created_at,
  }
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const response = await apiClient.get<ApiNotificationItem[]>('/notifications')
  return response.data.map(mapNotification)
}

export async function markNotificationRead(id: string): Promise<{ id: string; isRead: boolean }> {
  const response = await apiClient.patch<ApiMarkReadResponse>(`/notifications/${id}/read`)
  return {
    id: response.data.id,
    isRead: response.data.is_read,
  }
}

export function requestNotificationsRefresh() {
  window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT))
}
