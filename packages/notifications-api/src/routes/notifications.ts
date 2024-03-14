import { FastifyInstance } from "fastify";
import { NotificationsService } from "../service/notifications";
import { Notification } from "@nook/common/types";

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
        reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.delete("/user", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        await service.deleteNotificationUser(fid);
        reply.code(204).send({ fid });
      } catch (e) {
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
          reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: Notification }>("/publish", async (request, reply) => {
      try {
        await service.publishNotification(request.body);
        reply.code(201).send();
      } catch (e) {
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
          reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
