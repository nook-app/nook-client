import fp from "fastify-plugin";
import { PrismaClient } from "@nook/common/prisma/content";
import { ContentCacheClient } from "@nook/common/clients";

declare module "fastify" {
  interface FastifyInstance {
    content: {
      client: PrismaClient;
    };
    cache: {
      client: ContentCacheClient;
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

export const cachePlugin = fp(async (fastify, opts) => {
  const client = new ContentCacheClient();
  await client.connect();
  fastify.decorate("cache", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.cache.client.close();
  });
});
