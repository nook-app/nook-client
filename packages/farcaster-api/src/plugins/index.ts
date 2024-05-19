import fp from "fastify-plugin";
import { PrismaClient } from "@nook/common/prisma/farcaster";
import { RedisClient } from "@nook/common/clients";

declare module "fastify" {
  interface FastifyInstance {
    farcaster: {
      client: PrismaClient;
    };
    farcasterWrite: {
      client: PrismaClient;
    };
    redis: {
      client: RedisClient;
    };
  }
}

export const farcasterPlugin = fp(async (fastify, opts) => {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: process.env.FARCASTER_READ_DATABASE_URL,
      },
    },
  });
  await client.$connect();
  fastify.decorate("farcaster", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.farcaster.client.$disconnect();
  });
});

export const farcasterWritePlugin = fp(async (fastify, opts) => {
  const client = new PrismaClient();
  await client.$connect();
  fastify.decorate("farcasterWrite", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.farcasterWrite.client.$disconnect();
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
