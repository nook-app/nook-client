import { CONFIG } from '@/constants'
import { getSession } from '../session'
import {
  CastActionRequest,
  Channel,
  FarcasterCast,
  FarcasterUser,
  Nook,
  NotificationResponse,
} from '@/types'
import { TransactionResponse } from '@/types/transactions'

export type FetchTransactionsResponse = {
  data: TransactionResponse[]
  nextCursor?: string
}
export type FetchCastsResponse = { data: FarcasterCast[]; nextCursor?: string }
export type FetchUsersResponse = { data: FarcasterUser[]; nextCursor?: string }
export type FetchChannelsResponse = { data: Channel[]; nextCursor?: string }
export type FetchNotificationsResponse = {
  data: NotificationResponse[]
  nextCursor?: string
}
export type FetchNooksResponse = { data: Nook[]; nextCursor?: string }
export type FetchActionsResponse = {
  data: (CastActionRequest & { users: number })[]
  nextCursor?: string
}

export const makeRequestJson = async (url: string, options?: RequestInit) => {
  const response = await makeRequest(url, options)
  if (!response.ok) {
    throw new Error(await response.text())
  }

  return await response.json()
}

export const makeRequest = async (url: string, options?: RequestInit) => {
  const headers = new Headers(options?.headers)
  const session = await getSession()
  if (session && !headers.get('Authorization')) {
    headers.set('Authorization', `Bearer ${session.token}`)
  }

  return await fetch(
    `${CONFIG.apiBaseUrl}${url.startsWith('/v0') ? url.replace('/v0', '') : url}`,
    {
      ...options,
      headers,
    }
  )
}
