import fp from "fastify-plugin";
import {
  EntityClient,
  FarcasterClient,
  FeedClient,
  NookClient,
} from "@nook/common/clients";

declare module "fastify" {
  interface FastifyInstance {
    entity: {
      client: EntityClient;
    };
    farcaster: {
      client: FarcasterClient;
    };
    feed: {
      client: FeedClient;
    };
    nook: {
      client: NookClient;
    };
  }
}

export const entityPlugin = fp(async (fastify, opts) => {
  const client = new EntityClient();
  await client.connect();
  fastify.decorate("entity", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.entity.client.close();
  });
});

export const farcasterPlugin = fp(async (fastify, opts) => {
  const client = new FarcasterClient();
  await client.connect();
  fastify.decorate("farcaster", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.farcaster.client.close();
  });
});

export const feedPlugin = fp(async (fastify, opts) => {
  const client = new FeedClient();
  await client.connect();
  fastify.decorate("feed", { client });
  fastify.addHook("onClose", async (fastify) => {
    await fastify.feed.client.close();
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
