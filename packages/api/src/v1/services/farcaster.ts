import { FarcasterAPIClient } from "@nook/common/clients";
import { FarcasterFeedRequest } from "@nook/common/types";
import { FastifyInstance } from "fastify";

export class FarcasterService {
  private farcasterApi;
  private feedCache;

  constructor(fastify: FastifyInstance) {
    this.farcasterApi = new FarcasterAPIClient();
    this.feedCache = fastify.feed.client;
  }

  async getFeed(request: FarcasterFeedRequest) {
    return this.farcasterApi.getCastFeed(request);
  }
}
