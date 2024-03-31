import fp from "fastify-plugin";
import { PrismaClient } from "@nook/common/prisma/notifications";
import { RedisClient } from "@nook/common/clients";

declare module "fastify" {
  interface FastifyInstance {
    notifications: {
      client: PrismaClient;
    };
    redis: {
      client: RedisClient;
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

export const redisPlugin = fp(async (fastify, opts) => {
  const client = new RedisClient();
  await client.connect();
  fastify.decorate("redis", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.redis.client.close();
  });
});
