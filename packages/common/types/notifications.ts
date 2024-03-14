export type BaseNotification = {
  sourceId: string;
  fid: string;
  timestamp: Date;
};

export enum NotificationType {
  FARCASTER_MENTION = "FARCASTER_MENTION",
  FARCASTER_REPLY = "FARCASTER_REPLY",
  FARCASTER_LIKE = "FARCASTER_LIKE",
  FARCASTER_RECAST = "FARCASTER_RECAST",
  FARCASTER_QUOTE = "FARCASTER_QUOTE",
  FARCASTER_FOLLOW = "FARCASTER_FOLLOW",
  FARCASTER_CAST = "FARCASTER_CAST",
}

export type FarcasterMentionNotification = BaseNotification & {
  type: NotificationType.FARCASTER_MENTION;
  data: {
    fid: string;
    hash: string;
  };
};

export type FarcasterReplyNotification = BaseNotification & {
  type: NotificationType.FARCASTER_REPLY;
  data: {
    fid: string;
    hash: string;
    parentHash: string;
  };
};

export type FarcasterLikeNotification = BaseNotification & {
  type: NotificationType.FARCASTER_LIKE;
  data: {
    fid: string;
    targetHash: string;
  };
};

export type FarcasterRecastNotification = BaseNotification & {
  type: NotificationType.FARCASTER_RECAST;
  data: {
    fid: string;
    targetHash: string;
  };
};

export type FarcasterQuoteNotification = BaseNotification & {
  type: NotificationType.FARCASTER_QUOTE;
  data: {
    fid: string;
    hash: string;
    embedHash: string;
  };
};

export type FarcasterFollowNotification = BaseNotification & {
  type: NotificationType.FARCASTER_FOLLOW;
  data: {
    fid: string;
  };
};

export type FarcasterCastNotification = BaseNotification & {
  type: NotificationType.FARCASTER_CAST;
  data: {
    fid: string;
    hash: string;
    feedId: string;
  };
};

export type Notification =
  | FarcasterMentionNotification
  | FarcasterReplyNotification
  | FarcasterLikeNotification
  | FarcasterRecastNotification
  | FarcasterQuoteNotification
  | FarcasterFollowNotification
  | FarcasterCastNotification;
