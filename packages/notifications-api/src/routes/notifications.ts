import { FastifyInstance } from "fastify";
import { NotificationsService } from "../service/notifications";
import {
  GetNotificationsRequest,
  NotificationPreferences,
  ShelfNotification,
} from "@nook/common/types";
import { ShelfNotificationsService } from "../service/shelf";

export const notificationsRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new NotificationsService(fastify);
    const shelfService = new ShelfNotificationsService(fastify);

    fastify.get("/user", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        const data = await service.getNotificationUser(fid);
        if (!data) {
          return reply.code(404).send({ message: "User not found" });
        }
        return reply.send(data);
      } catch (e) {
        console.error(e);
        reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.patch<{ Body: NotificationPreferences }>(
      "/user",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          await service.updateNotificationUser(fid, request.body);
          reply.code(204).send({ fid });
        } catch (e) {
          console.error(e);
          reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.delete("/user", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        await service.deleteNotificationUser(fid);
        reply.code(204).send({ fid });
      } catch (e) {
        console.error(e);
        reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post<{ Body: { token: string } }>(
      "/user",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          await service.createNotificationUser(fid, request.body.token);
          reply.code(201).send({ fid });
        } catch (e) {
          console.error(e);
          reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{
      Body: GetNotificationsRequest;
      Querystring: { cursor?: string };
    }>("/notifications", async (request, reply) => {
      try {
        const data = await service.getNotifications(
          request.body,
          request.query.cursor,
        );
        return reply.send(data);
      } catch (e) {
        console.error(e);
        reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post<{
      Body: GetNotificationsRequest;
      Querystring: { cursor?: string };
    }>("/notifications/source", async (request, reply) => {
      try {
        const data = await service.getSourceNotifications(
          request.body,
          request.query.cursor,
        );
        return reply.send(data);
      } catch (e) {
        console.error(e);
        reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.get("/notifications/count", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        const count = await service.getUnreadNotifications(fid);
        return reply.send({ count });
      } catch (e) {
        console.error(e);
        reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post("/notifications/mark-read", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        await service.markNotificationsRead(fid);
        return reply.send();
      } catch (e) {
        console.error(e);
        reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post<{ Body: ShelfNotification; Params: { shelfId: string } }>(
      "/notifications/shelves/:shelfId",
      async (request, reply) => {
        try {
          await shelfService.upsertShelfNotificationData(
            request.params.shelfId,
            request.body,
          );
          return reply.send({});
        } catch (e) {
          console.error(e);
          reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.delete<{ Params: { shelfId: string } }>(
      "/notifications/shelves/:shelfId",
      async (request, reply) => {
        try {
          await shelfService.deleteShelfNotificationData(
            request.params.shelfId,
          );
          return reply.send({});
        } catch (e) {
          console.error(e);
          reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.put<{ Params: { shelfId: string } }>(
      "/notifications/shelves/:shelfId/subscription",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          await shelfService.subscribeToShelfNotifications(
            fid,
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
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          await shelfService.unsubscribeFromShelfNotifications(
            fid,
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
