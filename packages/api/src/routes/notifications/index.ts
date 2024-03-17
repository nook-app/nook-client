import { FastifyInstance } from "fastify";
import {
  FarcasterAPIClient,
  NotificationsAPIClient,
} from "@nook/common/clients";
import {
  FarcasterCastResponse,
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
  });
};
