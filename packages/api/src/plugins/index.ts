import fp from "fastify-plugin";
import { PrismaClient } from "@nook/common/prisma/nook";
import { PrismaClient as UserPrismaClient } from "@nook/common/prisma/user";
import { RedisClient } from "@nook/common/clients";

declare module "fastify" {
  interface FastifyInstance {
    nook: {
      client: PrismaClient;
    };
    redis: {
      client: RedisClient;
    };
    user: {
      client: UserPrismaClient;
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

export const userPlugin = fp(async (fastify, opts) => {
  const client = new UserPrismaClient();
  await client.$connect();
  fastify.decorate("user", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.user.client.$disconnect();
  });
});
