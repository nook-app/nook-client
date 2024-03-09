import fp from "fastify-plugin";
import { PrismaClient } from "@nook/common/prisma/nook";
import { RedisClient } from "@nook/common/clients/cache";

declare module "fastify" {
  interface FastifyInstance {
    nook: {
      client: PrismaClient;
    };
    redis: {
      client: RedisClient;
    };
  }
}

export const nookPlugin = fp(async (fastify, opts) => {
  const client = new PrismaClient();
  await client.$connect();
  fastify.decorate("nook", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.nook.client.$disconnect();
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
