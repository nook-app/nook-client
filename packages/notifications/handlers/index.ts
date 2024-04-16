import { Prisma, PrismaClient } from "@nook/common/prisma/notifications";
import {
  FarcasterPostData,
  Notification,
  NotificationType,
} from "@nook/common/types";
import { Job } from "bullmq";
import { formatCastText, pushMessages, pushNotification } from "./push";
import {
  FarcasterAPIClient,
  FarcasterCacheClient,
  RedisClient,
} from "@nook/common/clients";
import { ExpoPushMessage } from "expo-server-sdk";

export const getNotificationsHandler = async () => {
  const client = new PrismaClient();
  const redis = new RedisClient();
  const farcasterCache = new FarcasterCacheClient(redis);
  const farcasterApi = new FarcasterAPIClient();

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

    const following = await farcasterApi.getUserFollowingFids(notification.fid);
    const isFollowing = following.data.includes(notification.sourceFid);

    let isPowerBadge = notification.powerBadge;
    if (isPowerBadge === undefined) {
      isPowerBadge = await farcasterCache.getUserPowerBadge(
        notification.sourceFid,
      );
    }

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

    if (ignoreMessage) return;

    if (notification.type === NotificationType.POST) {
      const post = notification as FarcasterPostData;
      const cast = await farcasterApi.getCast(post.data.hash);
      if (!cast) return;

      const conditions = [];
      if (cast.user.badges?.powerBadge) {
        conditions.push({
          OR: [
            {
              users: {
                some: {
                  fid: cast.user.fid.toString(),
                },
              },
            },
            {
              users: {
                none: {},
              },
            },
            {
              powerBadge: true,
            },
          ],
        });
      } else {
        conditions.push({
          OR: [
            {
              users: {
                some: {
                  fid: cast.user.fid.toString(),
                },
              },
            },
            {
              users: {
                none: {},
              },
            },
          ],
        });
      }

      if (cast.parentHash) {
        conditions.push({
          OR: [
            {
              includeReplies: true,
            },
            {
              onlyReplies: true,
            },
          ],
        });
      } else {
        conditions.push({
          onlyReplies: false,
        });
      }

      if (cast.parentUrl) {
        conditions.push({
          OR: [
            {
              parentUrls: {
                some: {
                  url: cast.parentUrl,
                },
              },
            },
            {
              parentUrls: {
                none: {},
              },
            },
          ],
        });
      } else {
        conditions.push({
          parentUrls: {
            none: {},
          },
        });
      }

      const words = cast.text?.toLowerCase().split(" ") || [];
      if (words.length > 0) {
        conditions.push({
          AND: [
            {
              OR: [
                ...words.map((word) => ({
                  keywords: {
                    some: {
                      keyword: word,
                    },
                  },
                })),
                {
                  keywords: {
                    none: {},
                  },
                },
              ],
            },
            {
              mutedKeywords: {
                none: {
                  keyword: {
                    in: words,
                  },
                },
              },
            },
          ],
        });
      } else {
        conditions.push({
          parentUrls: {
            none: {},
          },
        });
      }

      if (cast.embeds.length > 0) {
        conditions.push({
          OR: [
            {
              embedUrls: {
                some: {
                  url: {
                    in: cast.embeds.map((embed) => embed.uri),
                  },
                },
              },
            },
            {
              embedUrls: {
                none: {},
              },
            },
          ],
        });
      } else {
        conditions.push({
          embedUrls: {
            none: {},
          },
        });
      }

      const shelves = await client.shelfNotification.findMany({
        where: {
          AND: conditions,
        },
        include: {
          users: true,
          parentUrls: true,
          keywords: true,
          embedUrls: true,
          mutedKeywords: true,
        },
      });

      const tokens = await client.user.findMany({
        where: {
          subscriptions: {
            some: {
              shelfId: {
                in: shelves.map((shelf) => shelf.shelfId),
              },
            },
          },
        },
      });

      if (tokens.length === 0) return;

      const data: ExpoPushMessage[] = await Promise.all(
        tokens.map(async (token) => {
          await client.notification.upsert({
            where: {
              fid_service_type_sourceId: {
                fid: token.fid,
                service: notification.service,
                type: notification.type,
                sourceId: notification.sourceId,
              },
            },
            create: {
              ...notification,
              fid: token.fid,
              powerBadge: isPowerBadge,
              data: notification.data || Prisma.DbNull,
              read: false,
            },
            update: {
              ...notification,
              fid: token.fid,
              powerBadge: isPowerBadge,
              data: notification.data || Prisma.DbNull,
              read: false,
            },
          });

          return {
            to: token.token,
            title: `${cast.user?.username || cast.user.fid} posted`,
            body: formatCastText(cast),
            badge: await client.notification.count({
              where: {
                fid: token.fid,
                read: false,
              },
            }),
            data: {
              service: notification.service,
              type: notification.type,
              sourceId: notification.sourceId,
              sourceFid: notification.sourceFid,
              data: notification.data,
            },
            categoryId: "farcasterPost",
          };
        }),
      );

      const tickets = await pushMessages(data);

      for (const ticket of tickets) {
        redis.setJson(`expoPushTicket:${ticket}`, ticket, 60 * 60 * 24);
      }

      console.log(
        `[push-notification] [${notification.fid}] ${notification.type}`,
      );
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
