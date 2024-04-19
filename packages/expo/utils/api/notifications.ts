import { GetNotificationsRequest, NotificationPreferences } from '@/types'
import { makeRequestJson } from './util'

export const createNotificationUser = async (token: string) => {
  return await makeRequestJson('/notifications/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })
}

export const deleteNotificationsUser = async () => {
  return await makeRequestJson('/notifications/user', {
    method: 'DELETE',
  })
}

export const fetchNotificationUser = async () => {
  return await makeRequestJson('/notifications/user')
}

export const updateNotificationPreferences = async (
  preferences: NotificationPreferences
) => {
  return await makeRequestJson('/notifications/user', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferences),
  })
}

export const fetchNotificationsForUser = async (
  req: GetNotificationsRequest,
  cursor?: string
) => {
  return await makeRequestJson(`/notifications${cursor ? `?cursor=${cursor}` : ''}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
}

export const fetchNotificationsCount = async () => {
  return await makeRequestJson('/notifications/count')
}

export const markNotificationsRead = async () => {
  return await makeRequestJson('/notifications/mark-read', {
    method: 'POST',
  })
}
