import { FastifyInstance } from "fastify";
import {
  FarcasterAPIClient,
  NotificationsAPIClient,
} from "@nook/common/clients";
import {
  FarcasterCastResponse,
  FarcasterFollowNotification,
  FarcasterLikeNotification,
  FarcasterMentionNotification,
  FarcasterQuoteNotification,
  FarcasterRecastNotification,
  FarcasterReplyNotification,
  FarcasterUser,
  GetNotificationsRequest,
  NotificationResponse,
  NotificationType,
} from "@nook/common/types";

export const notificationsRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new NotificationsAPIClient();
    const farcaster = new FarcasterAPIClient();

    fastify.get("/notifications/user", async (request, reply) => {
      if (!request.headers.authorization) {
        return reply.code(401).send({ message: "Unauthorized" });
      }
      try {
        const data = await client.getNotificationUser(
          request.headers.authorization,
        );
        if (!data) {
          return reply.code(404).send({ message: "User not found" });
        }
        return reply.send(data);
      } catch (e) {
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.delete("/notifications/user", async (request, reply) => {
      if (!request.headers.authorization) {
        return reply.code(401).send({ message: "Unauthorized" });
      }
      try {
        await client.deleteNotificationUser(request.headers.authorization);
        return reply.send({});
      } catch (e) {
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post<{ Body: { token: string } }>(
      "/notifications/user",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        try {
          await client.createNotificationUser(
            request.headers.authorization,
            request.body.token,
          );
          return reply.send({});
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.get("/notifications/count", async (request, reply) => {
      if (!request.headers.authorization) {
        return reply.code(401).send({ message: "Unauthorized" });
      }
      try {
        const data = await client.getNotificationCount(
          request.headers.authorization,
        );
        return reply.send(data);
      } catch (e) {
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post("/notifications/mark-read", async (request, reply) => {
      if (!request.headers.authorization) {
        return reply.code(401).send({ message: "Unauthorized" });
      }
      try {
        await client.markNotificationsRead(request.headers.authorization);
        return reply.send({});
      } catch (e) {
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post<{
      Body: GetNotificationsRequest;
      Querystring: { cursor?: string };
    }>("/notifications", async (request, reply) => {
      if (!request.headers.authorization) {
        return reply.code(401).send({ message: "Unauthorized" });
      }
      try {
        const data = await client.getNotifications(
          request.body,
          request.query.cursor,
        );

        const mentions = data.data.filter(
          (notification) => notification.type === NotificationType.MENTION,
        ) as FarcasterMentionNotification[];
        const replies = data.data.filter(
          (notification) => notification.type === NotificationType.REPLY,
        ) as FarcasterReplyNotification[];
        const likes = data.data.filter(
          (notification) => notification.type === NotificationType.LIKE,
        ) as FarcasterLikeNotification[];
        const recasts = data.data.filter(
          (notification) => notification.type === NotificationType.RECAST,
        ) as FarcasterRecastNotification[];
        const quotes = data.data.filter(
          (notification) => notification.type === NotificationType.QUOTE,
        ) as FarcasterQuoteNotification[];
        const follows = data.data.filter(
          (notification) => notification.type === NotificationType.FOLLOW,
        ) as FarcasterFollowNotification[];

        const castsToFetch = new Set<string>();
        for (const notification of mentions) {
          castsToFetch.add(notification.data.hash);
        }
        for (const notification of replies) {
          castsToFetch.add(notification.data.hash);
        }
        for (const notification of likes) {
          castsToFetch.add(notification.data.targetHash);
        }
        for (const notification of recasts) {
          castsToFetch.add(notification.data.targetHash);
        }
        for (const notification of quotes) {
          castsToFetch.add(notification.data.hash);
        }

        const usersToFetch = new Set<string>();
        for (const notification of likes) {
          usersToFetch.add(notification.sourceFid);
        }
        for (const notification of recasts) {
          usersToFetch.add(notification.sourceFid);
        }
        for (const notification of follows) {
          usersToFetch.add(notification.sourceFid);
        }

        const [casts, users] = await Promise.all([
          farcaster.getCasts(Array.from(castsToFetch)),
          farcaster.getUsers(Array.from(usersToFetch)),
        ]);

        const castMap = casts.data.reduce(
          (acc, cast) => {
            acc[cast.hash] = cast;
            return acc;
          },
          {} as Record<string, FarcasterCastResponse>,
        );

        const userMap = users.data.reduce(
          (acc, user) => {
            acc[user.fid] = user;
            return acc;
          },
          {} as Record<string, FarcasterUser>,
        );

        const likeMap = likes.reduce(
          (acc, like) => {
            if (!acc[like.data.targetHash]) {
              acc[like.data.targetHash] = {
                type: NotificationType.LIKE,
                cast: castMap[like.data.targetHash],
                timestamp: new Date(like.timestamp).getTime(),
                users: [],
              };
            }

            acc[like.data.targetHash].users?.unshift(userMap[like.sourceFid]);
            return acc;
          },
          {} as Record<string, NotificationResponse>,
        );
        const likeResponse = Object.values(likeMap);

        const recastMap = recasts.reduce(
          (acc, recast) => {
            if (!acc[recast.data.targetHash]) {
              acc[recast.data.targetHash] = {
                type: NotificationType.RECAST,
                cast: castMap[recast.data.targetHash],
                timestamp: new Date(recast.timestamp).getTime(),
                users: [],
              };
            }

            acc[recast.data.targetHash].users?.unshift(
              userMap[recast.sourceFid],
            );
            return acc;
          },
          {} as Record<string, NotificationResponse>,
        );
        const recastResponse = Object.values(recastMap);

        const mentionResponses: NotificationResponse[] = mentions.map(
          (mention) => ({
            type: NotificationType.MENTION,
            cast: castMap[mention.data.hash],
            timestamp: new Date(mention.timestamp).getTime(),
          }),
        );

        const replyResponses: NotificationResponse[] = replies.map((reply) => ({
          type: NotificationType.REPLY,
          cast: castMap[reply.data.hash],
          timestamp: new Date(reply.timestamp).getTime(),
        }));

        const quoteResponses: NotificationResponse[] = quotes.map((quote) => ({
          type: NotificationType.QUOTE,
          cast: castMap[quote.data.hash],
          timestamp: new Date(quote.timestamp).getTime(),
        }));

        const followResponses: NotificationResponse[] = follows.map(
          (follow) => ({
            type: NotificationType.FOLLOW,
            timestamp: new Date(follow.timestamp).getTime(),
            users: [userMap[follow.sourceFid]],
          }),
        );

        const allResponses = [
          ...mentionResponses,
          ...replyResponses,
          ...likeResponse,
          ...recastResponse,
          ...quoteResponses,
          ...followResponses,
        ];

        const allResponsesSorted = allResponses.sort(
          (a, b) => b.timestamp - a.timestamp,
        );

        const allResponsesMergedFollows = allResponsesSorted.reduce(
          (acc, notification) => {
            if (
              notification.type === NotificationType.FOLLOW &&
              acc[acc.length - 1]?.type === NotificationType.FOLLOW
            ) {
              acc[acc.length - 1].users?.push(...(notification.users || []));
            } else {
              acc.push(notification);
            }
            return acc;
          },
          [] as NotificationResponse[],
        );

        return reply.send({
          data: allResponsesMergedFollows,
          nextCursor: data.nextCursor,
        });
      } catch (e) {
        return reply.code(500).send({ message: (e as Error).message });
      }
    });
  });
};
