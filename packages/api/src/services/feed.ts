import { FastifyInstance } from "fastify";
import { FarcasterAPIClient } from "@nook/common/clients";
import {
  FeedFarcasterContentArgs,
  FeedFarcasterFollowingArgs,
} from "@nook/common/types";

export const MAX_PAGE_SIZE = 25;

export class FeedService {
  private farcasterClient: FarcasterAPIClient;

  constructor(fastify: FastifyInstance) {
    this.farcasterClient = new FarcasterAPIClient();
  }

  async getFarcasterContentFeed(
    req: FeedFarcasterContentArgs,
    cursor?: string,
    viewerFid?: string,
  ) {
    return await this.farcasterClient.getCastsByContentType(
      {
        ...req,
        cursor,
      },
      viewerFid,
    );
  }

  async getFarcasterFollowingFeed(
    req: FeedFarcasterFollowingArgs,
    cursor?: string,
    viewerFid?: string,
  ) {
    return this.farcasterClient.getCastsByFollowing(
      {
        ...req,
        replies: false,
        cursor,
      },
      viewerFid,
    );
  }
}
