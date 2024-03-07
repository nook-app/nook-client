import fp from "fastify-plugin";
import { PrismaClient } from "@nook/common/prisma/signer";
import { HubRpcClient, getSSLHubRpcClient } from "@farcaster/hub-nodejs";

declare module "fastify" {
  interface FastifyInstance {
    hub: {
      client: HubRpcClient;
    };
    signer: {
      client: PrismaClient;
    };
  }
}

export const hubPlugin = fp(async (fastify, opts) => {
  const client = getSSLHubRpcClient(process.env.HUB_RPC_ENDPOINT as string);
  fastify.decorate("hub", { client });
  fastify.addHook("onClose", async (fastify) => {
    fastify.hub.client.close();
  });
});

export const signerPlugin = fp(async (fastify, opts) => {
  const client = new PrismaClient();
  await client.$connect();
  fastify.decorate("signer", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.signer.client.$disconnect();
  });
});
