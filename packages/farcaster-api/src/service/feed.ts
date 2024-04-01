import { FarcasterCacheClient } from "@nook/common/clients";
import { Prisma, PrismaClient } from "@nook/common/prisma/farcaster";
import {
  ChannelFilter,
  ChannelFilterType,
  FarcasterPostArgs,
  ShelfDataRequest,
  UserFilter,
  UserFilterType,
} from "@nook/common/types";
import { decodeCursor, encodeCursor } from "@nook/common/utils";
import { FastifyInstance } from "fastify";

const MAX_PAGE_SIZE = 25;

function sanitizeInput(input: string): string {
  return input.replace(/[^a-zA-Z0-9\s./$]/g, "").substring(0, 100);
}

export class FeedService {
  private client: PrismaClient;
  private cache: FarcasterCacheClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.farcaster.client;
    this.cache = new FarcasterCacheClient(fastify.redis.client);
  }

  async getNewPosts(req: ShelfDataRequest<FarcasterPostArgs>) {
    const { data, context, cursor } = req;
    const {
      users,
      channels,
      query,
      queries,
      includeReplies,
      onlyReplies,
      muteWords,
    } = data;

    const conditions: string[] = ['"deletedAt" IS NULL'];

    if (queries) {
      const queryConditions = queries.map(
        (q) =>
          `((to_tsvector('english', "text") @@ to_tsquery('english', '${sanitizeInput(
            q,
          ).replaceAll(
            " ",
            "<->",
          )}')) OR (to_tsvector('english', "text") @@ to_tsquery('english', '/${sanitizeInput(
            q,
          ).replaceAll(" ", "<->")}')))`,
      );
      conditions.push(`(${queryConditions.join(" OR ")})`);
    } else if (query) {
      conditions.push(
        `((to_tsvector('english', "text") @@ to_tsquery('english', '${sanitizeInput(
          query,
        ).replaceAll(
          " ",
          "<->",
        )}')) OR (to_tsvector('english', "text") @@ to_tsquery('english', '/${sanitizeInput(
          query,
        ).replaceAll(" ", "<->")}')))`,
      );
    }

    if (users) {
      conditions.push(...(await this.getUserFilter(users)));
    }

    if (channels) {
      conditions.push(...(await this.getChannelFilter(channels)));
    }

    if (muteWords) {
      conditions.push(
        `NOT (${muteWords
          .map(
            (word) =>
              `to_tsvector('english', "text") @@ to_tsquery('english', '${sanitizeInput(
                word,
              ).replaceAll(" ", "<->")}')`,
          )
          .join(" OR ")})`,
      );
    }

    if (cursor) {
      const decodedCursor = decodeCursor(cursor);
      if (decodedCursor) {
        conditions.push(
          `"timestamp" < '${new Date(decodedCursor.timestamp).toISOString()}'`,
        );
      }
    }

    if (onlyReplies) {
      conditions.push(`"parentHash" IS NOT NULL`);
    } else if (!includeReplies) {
      conditions.push(`"parentHash" IS NULL`);
    }

    const casts = await this.client.$queryRaw<
      { hash: string; timestamp: number }[]
    >(
      Prisma.sql([
        `
            SELECT hash, timestamp
            FROM "FarcasterCast"
            WHERE ${conditions.join(" AND ")}
            ORDER BY "timestamp" DESC
            LIMIT ${MAX_PAGE_SIZE}
          `,
      ]),
    );

    return {
      data: casts.map((cast) => cast.hash),
      nextCursor:
        casts.length === MAX_PAGE_SIZE
          ? encodeCursor({
              timestamp: casts[casts.length - 1]?.timestamp,
            })
          : undefined,
    };
  }

  async getUserFilter(users: UserFilter) {
    const conditions: string[] = [];
    switch (users.type) {
      case UserFilterType.FOLLOWING: {
        const following = await this.client.farcasterLink.findMany({
          where: {
            linkType: "follow",
            fid: BigInt(users.data.fid),
            deletedAt: null,
          },
        });
        conditions.push(
          `"fid" IN (${following
            .map((link) => BigInt(link.targetFid))
            .join(",")})`,
        );
        break;
      }
      case UserFilterType.FIDS:
        conditions.push(
          `"fid" IN (${users.data.fids.map((fid) => BigInt(fid)).join(",")})`,
        );
        break;
      case UserFilterType.POWER_BADGE: {
        const holders = await this.cache.getPowerBadgeUsers();
        conditions.push(
          `"fid" IN (${holders.map((fid) => BigInt(fid)).join(",")})`,
        );
        break;
      }
    }
    return conditions;
  }

  async getChannelFilter(channels: ChannelFilter) {
    const conditions: string[] = [];
    switch (channels.type) {
      case ChannelFilterType.CHANNEL_IDS: {
        const response = await this.cache.getChannelsByIds(
          channels.data.channelIds,
        );
        conditions.push(
          `"parentUrl" IN ('${response.map((c) => c.url).join("','")}')`,
        );
        break;
      }
      case ChannelFilterType.CHANNEL_URLS: {
        conditions.push(`"parentUrl" IN ('${channels.data.urls.join("','")}')`);
        break;
      }
    }
    return conditions;
  }
}
