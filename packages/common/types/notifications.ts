export type BaseNotification = {
  fid: string;
  service: NotificationService;
  sourceFid: string;
  sourceId: string;
  timestamp: Date;
};

export enum NotificationService {
  FARCASTER = "FARCASTER",
}

export enum NotificationType {
  MENTION = "MENTION",
  REPLY = "REPLY",
  LIKE = "LIKE",
  RECAST = "RECAST",
  QUOTE = "QUOTE",
  FOLLOW = "FOLLOW",
}

export type FarcasterMentionNotification = BaseNotification & {
  type: NotificationType.MENTION;
  data: {
    hash: string;
  };
};

export type FarcasterReplyNotification = BaseNotification & {
  type: NotificationType.REPLY;
  data: {
    hash: string;
    parentHash: string;
  };
};

export type FarcasterLikeNotification = BaseNotification & {
  type: NotificationType.LIKE;
  data: {
    targetHash: string;
  };
};

export type FarcasterRecastNotification = BaseNotification & {
  type: NotificationType.RECAST;
  data: {
    targetHash: string;
  };
};

export type FarcasterQuoteNotification = BaseNotification & {
  type: NotificationType.QUOTE;
  data: {
    hash: string;
    embedHash: string;
  };
};

export type FarcasterFollowNotification = BaseNotification & {
  type: NotificationType.FOLLOW;
  data: undefined;
};

export type Notification =
  | FarcasterMentionNotification
  | FarcasterReplyNotification
  | FarcasterLikeNotification
  | FarcasterRecastNotification
  | FarcasterQuoteNotification
  | FarcasterFollowNotification;
