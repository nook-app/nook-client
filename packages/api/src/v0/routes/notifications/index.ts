import { FastifyInstance } from "fastify";
import {
  FarcasterAPIV1Client,
  NotificationsAPIClient,
} from "@nook/common/clients";
import {
  FarcasterCastV1,
  FarcasterUserV1,
  GetNotificationsRequest,
  NotificationPreferences,
} from "@nook/common/types";

export const notificationsRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new NotificationsAPIClient();
    const farcaster = new FarcasterAPIV1Client();

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
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}

      try {
        console.time("1");
        const data = await client.getNotifications(
          request.body,
          request.query.cursor,
        );
        console.timeEnd("1");

        const fids = data.data
          .flatMap((n) => n.fids)
          .filter(Boolean) as string[];
        const hashes = data.data.map((n) => n.hash).filter(Boolean) as string[];

        console.time("2");
        const [users, casts] = await Promise.all([
          farcaster.getUsers({ fids }, viewerFid),
          farcaster.getCastsForHashes(hashes, viewerFid),
        ]);
        console.timeEnd("2");

        const castMap = casts.data.reduce(
          (acc, cast) => {
            acc[cast.hash] = cast;
            return acc;
          },
          {} as Record<string, FarcasterCastV1>,
        );

        const userMap = users.data.reduce(
          (acc, user) => {
            acc[user.fid] = user;
            return acc;
          },
          {} as Record<string, FarcasterUserV1>,
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
