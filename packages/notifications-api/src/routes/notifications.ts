import { FastifyInstance } from "fastify";
import { NotificationsService } from "../service/notifications";
import { GetNotificationsRequest, Notification } from "@nook/common/types";

export const notificationsRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new NotificationsService(fastify);

    fastify.get("/user", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        const user = await service.getNotificationUser(fid);
        if (!user) {
          return reply.code(404).send({ message: "User not found" });
        }
        return reply.send({ fid: user.fid, disabled: user.disabled });
      } catch (e) {
        console.error(e);
        reply.code(500).send({ message: (e as Error).message });
      }
    });

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

    fastify.post<{ Body: Notification }>("/publish", async (request, reply) => {
      try {
        await service.publishNotification(request.body);
        reply.code(201).send();
      } catch (e) {
        console.error(e);
        reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.delete<{ Body: Notification }>(
      "/publish",
      async (request, reply) => {
        try {
          await service.deleteNotification(request.body);
          reply.code(201).send();
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
  });
};
