import fp from "fastify-plugin";
import { PrismaClient } from "@nook/common/prisma/content";
import { RedisClient } from "@nook/common/clients";

declare module "fastify" {
  interface FastifyInstance {
    content: {
      client: PrismaClient;
    };
    redis: {
      client: RedisClient;
    };
  }
}

export const contentPlugin = fp(async (fastify, opts) => {
  const client = new PrismaClient();
  await client.$connect();
  fastify.decorate("content", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.content.client.$disconnect();
  });
});

export const redisPlugin = fp(async (fastify, opts) => {
  const client = new RedisClient("feed");
  await client.connect();
  fastify.decorate("redis", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.redis.client.close();
  });
});
