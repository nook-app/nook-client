import fp from "fastify-plugin";
import { ContentClient, NookClient } from "@nook/common/clients";
import { HubRpcClient, getSSLHubRpcClient } from "@farcaster/hub-nodejs";

declare module "fastify" {
  interface FastifyInstance {
    hub: {
      client: HubRpcClient;
    };
    nook: {
      client: NookClient;
    };
    content: {
      client: ContentClient;
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

export const nookPlugin = fp(async (fastify, opts) => {
  const client = new NookClient();
  await client.connect();
  fastify.decorate("nook", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.nook.client.close();
  });
});

export const contentPlugin = fp(async (fastify, opts) => {
  const client = new ContentClient();
  await client.connect();
  fastify.decorate("content", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.content.client.close();
  });
});
