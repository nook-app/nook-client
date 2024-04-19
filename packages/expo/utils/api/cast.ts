import { FarcasterCast } from '@/types'
import {
  FetchCastsResponse,
  FetchUsersResponse,
  makeRequest,
  makeRequestJson,
} from './util'
import { FarcasterFeedRequest } from '@/types/feed'

export const fetchCast = async (hash: string): Promise<FarcasterCast | undefined> => {
  const response = await makeRequest(`/farcaster/casts/${hash}`)

  if (response.status === 404) {
    return
  }

  if (!response.ok) {
    throw new Error(await response.text())
  }
  return await response.json()
}

export const fetchCastFromHub = async (
  hash: string
): Promise<FarcasterCast | undefined> => {
  const response = await makeRequest(`/farcaster/casts/${hash}/hub`)

  if (response.status === 404) {
    return
  }

  if (!response.ok) {
    throw new Error(await response.text())
  }
  return await response.json()
}

export const fetchCastReplies = async (
  hash: string,
  cursor?: string
): Promise<FetchCastsResponse> => {
  return await makeRequestJson(
    `/farcaster/casts/${hash}/replies${cursor ? `?cursor=${cursor}` : ''}`
  )
}
export const fetchNewCastReplies = async (
  hash: string,
  cursor?: string
): Promise<FetchCastsResponse> => {
  return await makeRequestJson(
    `/farcaster/casts/${hash}/replies/new${cursor ? `?cursor=${cursor}` : ''}`
  )
}

export const fetchTopCastReplies = async (
  hash: string,
  cursor?: string
): Promise<FetchCastsResponse> => {
  return await makeRequestJson(
    `/farcaster/casts/${hash}/replies/top${cursor ? `?cursor=${cursor}` : ''}`
  )
}

export const fetchCastQuotes = async (
  hash: string,
  cursor?: string
): Promise<FetchCastsResponse> => {
  return await makeRequestJson(
    `/farcaster/casts/${hash}/quotes${cursor ? `?cursor=${cursor}` : ''}`
  )
}

export const fetchCastLikes = async (
  hash: string,
  cursor?: string
): Promise<FetchUsersResponse> => {
  return await makeRequestJson(
    `/farcaster/casts/${hash}/likes${cursor ? `?cursor=${cursor}` : ''}`
  )
}

export const fetchCastRecasts = async (
  hash: string,
  cursor?: string
): Promise<FetchUsersResponse> => {
  return await makeRequestJson(
    `/farcaster/casts/${hash}/recasts${cursor ? `?cursor=${cursor}` : ''}`
  )
}

export const fetchCastFeed = async (
  req: FarcasterFeedRequest
): Promise<FetchCastsResponse> => {
  return await makeRequestJson(`/farcaster/casts/feed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
}
