import { FarcasterCastReaction, FarcasterLink } from "../prisma/farcaster";
import {
  FarcasterCastResponse,
  Notification,
  NotificationService,
  NotificationType,
} from "../types";

export const parseNotificationsFromCast = (
  data: FarcasterCastResponse,
): Notification[] => {
  const notifications: Notification[] = [];
  notifications.push({
    fid: data.user.fid.toString(),
    service: NotificationService.FARCASTER,
    type: NotificationType.POST,
    sourceId: data.hash,
    timestamp: new Date(data.timestamp),
    sourceFid: data.user.fid.toString(),
    data: {
      hash: data.hash,
      isReply: !!data.parentHash,
    },
    powerBadge: data.user.badges?.powerBadge ?? false,
  });

  if (
    data.parentHash &&
    data.parent &&
    data.parent.user.fid !== data.user.fid
  ) {
    notifications.push({
      fid: data.parent.user.fid.toString(),
      service: NotificationService.FARCASTER,
      type: NotificationType.REPLY,
      sourceId: data.hash,
      timestamp: new Date(data.timestamp),
      sourceFid: data.user.fid.toString(),
      data: {
        hash: data.hash,
        parentHash: data.parentHash,
      },
      powerBadge: data.user.badges?.powerBadge ?? false,
    });
  }

  for (const { user, hash } of data.embedCasts) {
    if (user.fid === data.user.fid) continue;
    notifications.push({
      fid: user.fid.toString(),
      service: NotificationService.FARCASTER,
      type: NotificationType.QUOTE,
      sourceId: data.hash,
      timestamp: new Date(data.timestamp),
      sourceFid: data.user.fid.toString(),
      data: {
        hash: data.hash,
        embedHash: hash,
      },
      powerBadge: data.user.badges?.powerBadge ?? false,
    });
  }

  for (const { user } of data.mentions) {
    if (user.fid === data.user.fid) continue;
    notifications.push({
      fid: user.fid.toString(),
      service: NotificationService.FARCASTER,
      type: NotificationType.MENTION,
      sourceId: data.hash,
      timestamp: new Date(data.timestamp),
      sourceFid: data.user.fid.toString(),
      data: {
        hash: data.hash,
      },
      powerBadge: data.user.badges?.powerBadge ?? false,
    });
  }

  return notifications;
};

export const parseNotificationsFromReaction = (
  data: FarcasterCastReaction,
): Notification[] => {
  if (data.reactionType === 1 && data.targetFid !== data.fid) {
    return [
      {
        fid: data.targetFid.toString(),
        service: NotificationService.FARCASTER,
        type: NotificationType.LIKE,
        sourceId: data.hash,
        timestamp: data.timestamp,
        sourceFid: data.fid.toString(),
        data: {
          targetHash: data.targetHash,
        },
      },
    ];
  }

  if (data.reactionType === 2 && data.targetFid !== data.fid) {
    return [
      {
        fid: data.targetFid.toString(),
        service: NotificationService.FARCASTER,
        type: NotificationType.RECAST,
        sourceId: data.hash,
        timestamp: data.timestamp,
        sourceFid: data.fid.toString(),
        data: {
          targetHash: data.targetHash,
        },
      },
    ];
  }

  return [];
};

export const parseNotificationsFromLink = (
  data: FarcasterLink,
): Notification[] => {
  if (data.linkType === "follow" && data.targetFid !== data.fid) {
    return [
      {
        fid: data.targetFid.toString(),
        service: NotificationService.FARCASTER,
        type: NotificationType.FOLLOW,
        sourceId: data.hash,
        timestamp: data.timestamp,
        sourceFid: data.fid.toString(),
        data: undefined,
      },
    ];
  }

  return [];
};
