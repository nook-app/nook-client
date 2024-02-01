import fp from "fastify-plugin";
import { MongoClient } from "@flink/common/mongo";

declare module "fastify" {
  interface FastifyInstance {
    mongo: {
      client: MongoClient;
    };
  }
}

// Plugin to connect to MongoDB
export const mongoPlugin = fp(async (fastify, opts) => {
  const client = new MongoClient();
  await client.connect();

  // Decorate fastify instance with the MongoDB client
  fastify.decorate("mongo", { client });

  // Disconnect MongoDB client on server close
  fastify.addHook("onClose", async (fastify) => {
    await fastify.mongo.client.close();
  });
});
