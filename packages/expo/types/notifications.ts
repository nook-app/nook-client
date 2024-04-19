import { FarcasterCast } from './cast'
import { FarcasterUser } from './user'

export enum NotificationType {
  POST = 'POST',
  MENTION = 'MENTION',
  REPLY = 'REPLY',
  LIKE = 'LIKE',
  RECAST = 'RECAST',
  QUOTE = 'QUOTE',
  FOLLOW = 'FOLLOW',
}

export type BaseNotification = {
  fid: string
  service: NotificationService
  sourceFid: string
  sourceId: string
  timestamp: Date
  powerBadge?: boolean
  deletedAt?: Date
}

export enum NotificationService {
  FARCASTER = 'FARCASTER',
}

export type FarcasterPostData = {
  type: NotificationType.POST
  data: {
    hash: string
    isReply?: boolean
  }
}

type FarcasterMentionData = {
  type: NotificationType.MENTION
  data: {
    hash: string
  }
}

type FarcasterReplyData = {
  type: NotificationType.REPLY
  data: {
    hash: string
    parentHash: string
  }
}

type FarcasterLikeData = {
  type: NotificationType.LIKE
  data: {
    targetHash: string
  }
}

type FarcasterRecastData = {
  type: NotificationType.RECAST
  data: {
    targetHash: string
  }
}

type FarcasterQuoteData = {
  type: NotificationType.QUOTE
  data: {
    hash: string
    embedHash: string
  }
}

type FarcasterFollowData = {
  type: NotificationType.FOLLOW
  data: undefined
}

export type FarcasterPostNotification = BaseNotification & FarcasterPostData
export type FarcasterMentionNotification = BaseNotification & FarcasterMentionData
export type FarcasterReplyNotification = BaseNotification & FarcasterReplyData
export type FarcasterLikeNotification = BaseNotification & FarcasterLikeData
export type FarcasterRecastNotification = BaseNotification & FarcasterRecastData
export type FarcasterQuoteNotification = BaseNotification & FarcasterQuoteData
export type FarcasterFollowNotification = BaseNotification & FarcasterFollowData

export type Notification =
  | FarcasterPostNotification
  | FarcasterMentionNotification
  | FarcasterReplyNotification
  | FarcasterLikeNotification
  | FarcasterRecastNotification
  | FarcasterQuoteNotification
  | FarcasterFollowNotification

export type RawNotificationResponse = {
  type: NotificationType
  hash?: string
  timestamp: number
  fids?: string[]
}

export type NotificationResponse = {
  type: NotificationType
  cast?: FarcasterCast
  timestamp: number
  users?: FarcasterUser[]
}

export type NotificationPreferences = {
  disabled: boolean
  receive: boolean
  onlyPowerBadge: boolean
  subscriptions: string[]
}

export type GetNotificationsRequest = {
  fid: string
  types?: string[]
  priority?: boolean
}
