import fp from "fastify-plugin";
import { PrismaClient } from "@nook/common/prisma/nook";
import { FeedCacheClient } from "@nook/common/clients";

declare module "fastify" {
  interface FastifyInstance {
    nook: {
      client: PrismaClient;
    };
    cache: {
      client: FeedCacheClient;
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

export const cachePlugin = fp(async (fastify, opts) => {
  const client = new FeedCacheClient();
  await client.connect();
  fastify.decorate("cache", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.cache.client.close();
  });
});
