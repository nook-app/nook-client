import fp from "fastify-plugin";
import { PrismaClient } from "@nook/common/prisma/farcaster";
import { RedisClient } from "@nook/common/clients/cache/base";

declare module "fastify" {
  interface FastifyInstance {
    farcaster: {
      client: PrismaClient;
    };
    redis: {
      client: RedisClient;
    };
  }
}

export const farcasterPlugin = fp(async (fastify, opts) => {
  const client = new PrismaClient();
  await client.$connect();
  fastify.decorate("farcaster", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.farcaster.client.$disconnect();
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
