import fp from "fastify-plugin";
import { PrismaClient } from "@nook/common/prisma/notifications";

declare module "fastify" {
  interface FastifyInstance {
    notifications: {
      client: PrismaClient;
    };
  }
}

export const notificationsPlugin = fp(async (fastify, opts) => {
  const client = new PrismaClient();
  await client.$connect();
  fastify.decorate("notifications", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.notifications.client.$disconnect();
  });
});
