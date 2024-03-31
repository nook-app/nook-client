import { Prisma, PrismaClient } from "@nook/common/prisma/notifications";
import { Notification, NotificationType } from "@nook/common/types";
import { Job } from "bullmq";
import { pushNotification } from "./push";
import { FarcasterCacheClient, RedisClient } from "@nook/common/clients";

export const getNotificationsHandler = async () => {
  const client = new PrismaClient();
  const redis = new RedisClient();
  const farcasterCache = new FarcasterCacheClient(redis);

  return async (job: Job<Notification>) => {
    const notification = job.data;

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

    let powerBadge = notification.powerBadge;
    if (powerBadge === undefined) {
      powerBadge = await farcasterCache.getUserPowerBadge(notification.fid);
    }

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
        powerBadge,
        data: notification.data || Prisma.DbNull,
        read:
          NotificationType.FOLLOW === notification.type ||
          NotificationType.POST === notification.type,
      },
      update: {
        ...notification,
        powerBadge,
        data: notification.data || Prisma.DbNull,
        read:
          NotificationType.FOLLOW === notification.type ||
          NotificationType.POST === notification.type,
      },
    });

    if (notification.type === NotificationType.POST || !powerBadge) {
      return;
    }

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
