import fp from "fastify-plugin";
import { PrismaClient } from "@nook/common/prisma/lists";
import { RedisClient } from "@nook/common/clients";

declare module "fastify" {
  interface FastifyInstance {
    lists: {
      client: PrismaClient;
    };
    redis: {
      client: RedisClient;
    };
  }
}

export const listsPlugin = fp(async (fastify, opts) => {
  const client = new PrismaClient();
  await client.$connect();
  fastify.decorate("lists", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.lists.client.$disconnect();
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
