import fp from "fastify-plugin";
import { PrismaClient } from "@nook/common/prisma/entity";
import { RedisClient } from "@nook/common/redis";

declare module "fastify" {
  interface FastifyInstance {
    entity: {
      client: PrismaClient;
    };
    redis: {
      client: RedisClient;
    };
  }
}

export const entityPlugin = fp(async (fastify, opts) => {
  const client = new PrismaClient();
  await client.$connect();
  fastify.decorate("entity", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.entity.client.$disconnect();
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
