import fp from "fastify-plugin";
import { PrismaClient } from "@nook/common/prisma/nook";

declare module "fastify" {
  interface FastifyInstance {
    nook: {
      client: PrismaClient;
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
