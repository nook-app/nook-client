import fp from "fastify-plugin";
import { MongoClient } from "@flink/common/mongo";
import { PrismaClient } from "@flink/common/prisma/nook";

declare module "fastify" {
  interface FastifyInstance {
    mongo: {
      client: MongoClient;
    };
    nook: {
      client: PrismaClient;
    };
  }
}

// Plugin to connect to MongoDB
export const mongoPlugin = fp(async (fastify, opts) => {
  const client = new MongoClient();
  await client.connect();
  fastify.decorate("mongo", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.mongo.client.close();
  });
});

export const nookPlugin = fp(async (fastify, opts) => {
  const client = new PrismaClient();
  await client.$connect();
  fastify.decorate("nook", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.nook.client.$disconnect();
  });
});
