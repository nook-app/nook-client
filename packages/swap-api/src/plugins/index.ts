import fp from "fastify-plugin";
import { RedisClient } from "@nook/common/clients";

declare module "fastify" {
  interface FastifyInstance {
    redis: {
      client: RedisClient;
    };
  }
}

export const redisPlugin = fp(async (fastify, opts) => {
  const client = new RedisClient();
  await client.connect();
  fastify.decorate("redis", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.redis.client.close();
  });
});
