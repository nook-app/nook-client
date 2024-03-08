import { FastifyInstance } from "fastify";
import { FarcasterAPIClient, FeedCacheClient } from "@nook/common/clients";
import { FeedFarcasterFollowingArgs } from "@nook/common/types";

export const MAX_PAGE_SIZE = 25;

export class FeedService {
  private farcasterClient: FarcasterAPIClient;
  private cache: FeedCacheClient;

  constructor(fastify: FastifyInstance) {
    this.farcasterClient = new FarcasterAPIClient();
    this.cache = fastify.cache.client;
  }

  async getFarcasterFollowingFeed(
    req: FeedFarcasterFollowingArgs,
    cursor?: string,
    viewerFid?: string,
  ) {
    const timestamp = this.decodeCursor(cursor);
    const cached = await this.cache.getFarcasterFollowingFeed(
      req.fid,
      timestamp,
    );

    const promises = [];

    // Get new records from minTimestamp
    const minTimestamp = cached?.[0]?.timestamp;
    if (!timestamp || (minTimestamp && minTimestamp < timestamp)) {
      promises.push(
        this.farcasterClient
          .getCastsByFollowing(
            {
              fid: req.fid,
              replies: false,
              cursor,
              minTimestamp,
            },
            viewerFid,
          )
          .then((res) => res.data),
      );
    }

    // Get the cached records
    if (cached.length > 0) {
      promises.push(
        this.farcasterClient
          .getCasts(
            cached.map((i) => i.value.hash),
            viewerFid,
          )
          .then((res) => res.data),
      );
    }

    // Get older records to fill out remaining page size
    const limit = MAX_PAGE_SIZE - (cached?.length ?? 0);
    if (cursor && limit > 0) {
      promises.push(
        this.farcasterClient
          .getCastsByFollowing(
            {
              fid: req.fid,
              replies: false,
              cursor,
              limit,
            },
            viewerFid,
          )
          .then((res) => res.data),
      );
    }

    const response = (await Promise.all(promises))
      .flat()
      .slice(0, MAX_PAGE_SIZE);

    await this.cache.setFarcasterFollowingFeed(
      req.fid,
      response.map((c) => ({
        value: {
          fid: c.user.fid,
          hash: c.hash,
        },
        timestamp: c.timestamp,
      })),
    );

    return {
      data: response,
      nextCursor:
        response.length === MAX_PAGE_SIZE
          ? this.encodeCursor({
              timestamp: response[response.length - 1]?.timestamp,
            })
          : undefined,
    };
  }

  decodeCursor(cursor?: string): number | undefined {
    if (!cursor) return;
    try {
      const decodedString = Buffer.from(cursor, "base64").toString("ascii");
      const decodedCursor = JSON.parse(decodedString);
      if (typeof decodedCursor === "object" && "timestamp" in decodedCursor) {
        return decodedCursor.timestamp;
      }
      console.error(
        "Decoded cursor does not match expected format:",
        decodedCursor,
      );
    } catch (error) {
      console.error("Error decoding cursor:", error);
    }
  }

  encodeCursor(cursor?: { timestamp: number }): string | undefined {
    if (!cursor) return;
    const encodedString = JSON.stringify(cursor);
    return Buffer.from(encodedString).toString("base64");
  }
}
