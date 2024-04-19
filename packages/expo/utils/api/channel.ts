import { Channel } from '@/types'
import { FetchChannelsResponse, makeRequestJson } from './util'

export const searchChannels = async (
  query: string,
  cursor?: string,
  limit?: number
): Promise<FetchChannelsResponse> => {
  return await makeRequestJson(
    `/farcaster/channels?query=${query}${cursor ? `&cursor=${cursor}` : ''}${
      limit ? `&limit=${limit}` : ''
    }`
  )
}

export const fetchChannels = async (
  parentUrls: string[]
): Promise<FetchChannelsResponse> => {
  return await makeRequestJson('/farcaster/channels', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ parentUrls }),
  })
}

export const fetchRecommendedChannels = async (): Promise<FetchChannelsResponse> => {
  return await makeRequestJson(`/farcaster/users/0/recommended-channels`)
}

export const fetchChannel = async (channelId: string): Promise<Channel> => {
  return await makeRequestJson(`/farcaster/channels/${channelId}`)
}

export const fetchChannelByUrl = async (channelUrl: string): Promise<Channel> => {
  return await makeRequestJson(
    `/farcaster/channels/by-url/${encodeURIComponent(channelUrl)}`
  )
}
