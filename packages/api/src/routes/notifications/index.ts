import { FastifyInstance } from "fastify";
import {
  FarcasterAPIClient,
  NotificationsAPIClient,
} from "@nook/common/clients";
import {
  FarcasterCastResponse,
  FarcasterUser,
  GetNotificationsRequest,
  NookShelfInstance,
  NotificationPreferences,
} from "@nook/common/types";
import { NookService } from "../../services/nook";

export const notificationsRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new NotificationsAPIClient();
    const farcaster = new FarcasterAPIClient();
    const nookService = new NookService(fastify);

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

    fastify.patch<{ Body: NotificationPreferences }>(
      "/notifications/user",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        try {
          await client.updateNotificationUser(
            request.headers.authorization,
            request.body,
          );
          return reply.send({});
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

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

        const fids = data.data
          .flatMap((n) => n.fids)
          .filter(Boolean) as string[];
        const hashes = data.data.map((n) => n.hash).filter(Boolean) as string[];

        const [users, casts] = await Promise.all([
          farcaster.getUsers({ fids }),
          farcaster.getCasts(hashes),
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

        return reply.send({
          data: data.data.map((n) => ({
            ...n,
            cast: n.hash ? castMap[n.hash] : undefined,
            users: n.fids?.map((fid) => userMap[fid]),
          })),
          nextCursor: data.nextCursor,
        });
      } catch (e) {
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post<{
      Body: GetNotificationsRequest;
      Querystring: { cursor?: string };
    }>("/notifications/posts", async (request, reply) => {
      if (!request.headers.authorization) {
        return reply.code(401).send({ message: "Unauthorized" });
      }
      try {
        const data = await client.getPostNotifications(
          request.body,
          request.query.cursor,
        );

        const hashes = data.data.map((n) => n.hash).filter(Boolean) as string[];

        const casts = await farcaster.getCasts(hashes);

        const castMap = casts.data.reduce(
          (acc, cast) => {
            acc[cast.hash] = cast;
            return acc;
          },
          {} as Record<string, FarcasterCastResponse>,
        );

        return reply.send({
          data: data.data.map((n) => ({
            ...n,
            cast: n.hash ? castMap[n.hash] : undefined,
          })),
          nextCursor: data.nextCursor,
        });
      } catch (e) {
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.put<{ Params: { shelfId: string } }>(
      "/notifications/shelves/:shelfId/subscription",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }

        const shelf = await nookService.getShelfInstance(
          request.params.shelfId,
        );
        if (!shelf) {
          return reply.code(404).send({ message: "Shelf not found" });
        }

        await nookService.updateShelfNotification(
          shelf.id,
          shelf as NookShelfInstance,
        );

        try {
          await client.subscribeToShelfNotifications(
            request.headers.authorization,
            request.params.shelfId,
          );
          return reply.send({});
        } catch (e) {
          console.error(e);
          reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.delete<{ Params: { shelfId: string } }>(
      "/notifications/shelves/:shelfId/subscription",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        try {
          await client.unsubscribeFromShelfNotifications(
            request.headers.authorization,
            request.params.shelfId,
          );
          return reply.send({});
        } catch (e) {
          console.error(e);
          reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
