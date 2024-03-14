import { FastifyInstance } from "fastify";
import { NotificationsAPIClient } from "@nook/common/clients";

export const notificationsRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new NotificationsAPIClient();

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
  });
};
