import { Prisma, PrismaClient } from "@nook/common/prisma/notifications";
import { Notification, NotificationType } from "@nook/common/types";
import { Job } from "bullmq";
import { pushNotification } from "./push";
import {
  FarcasterAPIClient,
  FarcasterCacheClient,
  RedisClient,
} from "@nook/common/clients";

export const getNotificationsHandler = async () => {
  const client = new PrismaClient();
  const redis = new RedisClient();
  const farcasterCache = new FarcasterCacheClient(redis);
  const farcasterApi = new FarcasterAPIClient();

  const getFollowingFids = async (fid: string) => {
    const cached = await farcasterCache.getUserFollowingFids(fid);
    if (cached) return cached;

    const following = (await farcasterApi.getUserFollowingFids(fid)).data;
    return following;
  };

  const getPowerBadge = async (fid: string, powerBadge?: boolean) => {
    if (powerBadge) return powerBadge;

    return await farcasterCache.getUserPowerBadge(fid);
  };

  return async (job: Job<Notification>) => {
    const notification = job.data;
    console.log(notification);

    if (notification.deletedAt) {
      await client.notification.updateMany({
        where: {
          fid: notification.fid,
          service: notification.service,
          type: notification.type,
          sourceId: notification.sourceId,
        },
        data: {
          deletedAt: new Date(),
        },
      });
      return;
    }

    const [following, isPowerBadge] = await Promise.all([
      getFollowingFids(notification.fid),
      getPowerBadge(notification.sourceFid, notification.powerBadge),
    ]);

    const isFollowing = following.includes(notification.sourceFid);
    const ignoreMessage = !isFollowing && !isPowerBadge;

    await client.notification.upsert({
      where: {
        fid_service_type_sourceId: {
          fid: notification.fid,
          service: notification.service,
          type: notification.type,
          sourceId: notification.sourceId,
        },
      },
      create: {
        ...notification,
        powerBadge: isPowerBadge,
        data: notification.data || Prisma.DbNull,
        read: ignoreMessage,
      },
      update: {
        ...notification,
        powerBadge: isPowerBadge,
        data: notification.data || Prisma.DbNull,
        read: ignoreMessage,
      },
    });

    if (ignoreMessage || notification.type === NotificationType.POST) return;

    const token = await client.user.findUnique({
      where: {
        fid: notification.fid,
        receive: true,
        disabled: false,
      },
    });

    if (!token) {
      return;
    }

    const unread = await client.notification.count({
      where: {
        fid: notification.fid,
        read: false,
      },
    });

    const tickets = await pushNotification(
      [{ fid: notification.fid, token: token.token, unread }],
      notification,
    );

    for (const ticket of tickets) {
      redis.setJson(`expoPushTicket:${ticket}`, ticket, 60 * 60 * 24);
    }

    console.log(
      `[push-notification] [${notification.fid}] ${notification.type}`,
    );
  };
};
