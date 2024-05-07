import { FarcasterCacheClient } from "@nook/common/clients";
import { PrismaClient } from "@nook/common/prisma/nook";
import { FastifyInstance } from "fastify";

export class DiscoverService {
  private client: PrismaClient;
  private farcasterCache: FarcasterCacheClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.nook.client;
    this.farcasterCache = new FarcasterCacheClient(fastify.redis.client);
  }

  async getTrendingCashtags() {
    return await this.farcasterCache.getTrendingCashtags();
  }
}
