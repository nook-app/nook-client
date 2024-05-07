import { FastifyInstance } from "fastify";

export const flagRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const redis = fastify.redis.client;

    fastify.get("/flags", async (request, reply) => {
      try {
        return reply.send({
          reviewMode: (await redis.get("flags:reviewMode")) === "true",
        });
      } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });
  });
};
