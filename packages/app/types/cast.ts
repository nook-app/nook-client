import { UrlContentResponse } from './content'
import { FarcasterUser } from './user'

export type Channel = {
  url: string
  name: string
  description: string
  imageUrl: string
  channelId: string
  creatorId?: string
  leadFid?: string
  hostFids?: string[]
  followerCount: number
  createdAt: Date
  updatedAt: Date
  casts?: number
}

export type FarcasterCastEngagement = {
  likes: number
  recasts: number
  replies: number
  quotes: number
}

export type FarcasterCastContext = {
  liked: boolean
  recasted: boolean
}

export type FarcasterCast = {
  hash: string
  timestamp: number
  user: FarcasterUser
  text: string
  mentions: {
    user: FarcasterUser
    position: string
  }[]
  embedCasts: FarcasterCast[]
  embeds: UrlContentResponse[]
  parentHash?: string
  parent?: FarcasterCast
  parentUrl?: string
  channel?: Channel
  channelMentions: {
    channel: Channel
    position: string
  }[]
  engagement: FarcasterCastEngagement
  context?: FarcasterCastContext
  ancestors: FarcasterCast[]
  thread: FarcasterCast[]
  appFid?: string
  // Temporarily used to identify the primary reference for content requests
  reference?: string
}
