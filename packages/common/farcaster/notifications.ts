import { getCastEmbeds, getMentions } from ".";
import {
  FarcasterCast,
  FarcasterCastReaction,
  FarcasterLink,
} from "../prisma/farcaster";
import { Notification, NotificationService, NotificationType } from "../types";

export const parseNotificationsFromCast = (
  data: FarcasterCast,
): Notification[] => {
  const notifications: Notification[] = [];
  notifications.push({
    fid: data.fid.toString(),
    service: NotificationService.FARCASTER,
    type: NotificationType.POST,
    sourceId: data.hash,
    timestamp: data.timestamp,
    sourceFid: data.fid.toString(),
    data: {
      hash: data.hash,
    },
  });

  if (data.parentHash && data.parentFid) {
    notifications.push({
      fid: data.parentFid.toString(),
      service: NotificationService.FARCASTER,
      type: NotificationType.REPLY,
      sourceId: data.hash,
      timestamp: data.timestamp,
      sourceFid: data.fid.toString(),
      data: {
        hash: data.hash,
        parentHash: data.parentHash,
      },
    });
  }

  for (const { fid, hash } of getCastEmbeds(data)) {
    notifications.push({
      fid: fid.toString(),
      service: NotificationService.FARCASTER,
      type: NotificationType.QUOTE,
      sourceId: data.hash,
      timestamp: data.timestamp,
      sourceFid: data.fid.toString(),
      data: {
        hash: data.hash,
        embedHash: hash,
      },
    });
  }

  for (const { fid } of getMentions(data)) {
    notifications.push({
      fid: fid.toString(),
      service: NotificationService.FARCASTER,
      type: NotificationType.MENTION,
      sourceId: data.hash,
      timestamp: data.timestamp,
      sourceFid: data.fid.toString(),
      data: {
        hash: data.hash,
      },
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
