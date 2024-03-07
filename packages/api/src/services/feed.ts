import { FastifyInstance } from "fastify";
import { FarcasterAPIClient } from "@nook/common/clients";
import { FeedFarcasterFollowingArgs } from "@nook/common/types";

export class FeedService {
  private farcasterClient: FarcasterAPIClient;

  constructor(fastify: FastifyInstance) {
    this.farcasterClient = new FarcasterAPIClient();
  }

  async getFarcasterFollowingFeed(
    req: FeedFarcasterFollowingArgs,
    cursor?: string,
    viewerFid?: string,
  ) {
    return await this.farcasterClient.getCastsByFollowing(
      {
        fid: req.fid,
        replies: false,
        cursor,
      },
      viewerFid,
    );
  }
}
