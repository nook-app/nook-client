import { FastifyInstance } from "fastify";
import {
  ContentAPIClient,
  FarcasterAPIClient,
  FeedCacheClient,
} from "@nook/common/clients";
import {
  FeedFarcasterContentArgs,
  FeedFarcasterFollowingArgs,
} from "@nook/common/types";

export const MAX_PAGE_SIZE = 25;

export class FeedService {
  private farcasterClient: FarcasterAPIClient;
  private contentAPIClient: ContentAPIClient;

  constructor(fastify: FastifyInstance) {
    this.farcasterClient = new FarcasterAPIClient();
    this.contentAPIClient = new ContentAPIClient();
  }

  async getFarcasterContentFeed(
    req: FeedFarcasterContentArgs,
    cursor?: string,
    viewerFid?: string,
  ) {
    const references = await this.contentAPIClient.getContentReferences(
      req,
      cursor,
      viewerFid,
    );

    return {
      data: await this.farcasterClient.getCasts(
        references.data.map((i) => i.hash),
        viewerFid,
      ),
      nextCursor: references.nextCursor,
    };
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
