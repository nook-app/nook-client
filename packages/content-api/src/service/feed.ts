import {
  ContentCacheClient,
  FarcasterAPIClient,
  FarcasterCacheClient,
} from "@nook/common/clients";
import { Prisma, PrismaClient } from "@nook/common/prisma/content";
import {
  ChannelFilter,
  ChannelFilterType,
  FarcasterEmbedArgs,
  FarcasterFrameArgs,
  FarcasterMediaArgs,
  ShelfDataRequest,
  UserFilter,
  UserFilterType,
} from "@nook/common/types";
import { decodeCursor, encodeCursor } from "@nook/common/utils";
import { FastifyInstance } from "fastify";

export const MAX_PAGE_SIZE = 25;

function sanitizeInput(input: string): string {
  return input.replace(/[^a-zA-Z0-9\s./:]/g, "").substring(0, 100);
}

export class FeedService {
  private client: PrismaClient;
  private cache: ContentCacheClient;
  private farcaster: FarcasterAPIClient;
  private farcasterCache: FarcasterCacheClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.content.client;
    this.cache = new ContentCacheClient(fastify.redis.client);
    this.farcaster = new FarcasterAPIClient();
    this.farcasterCache = new FarcasterCacheClient(fastify.redis.client);
  }

  async getNewEmbeds(req: ShelfDataRequest<FarcasterEmbedArgs>) {
    const conditions: string[] = [];

    if (req.data.urls) {
      for (const filter of req.data.urls) {
        conditions.push(`"content"."uri" ILIKE '%${sanitizeInput(filter)}%'`);
      }
    }

    return this.getNewContent(
      req,
      conditions.length > 0 ? [`(${conditions.join(" OR ")})`] : [],
    );
  }

  async getNewFrames(req: ShelfDataRequest<FarcasterFrameArgs>) {
    const conditions: string[] = [];

    if (req.data.urls) {
      for (const filter of req.data.urls) {
        conditions.push(`"content"."uri" ILIKE '%${sanitizeInput(filter)}%'`);
      }
    }

    const finalConditions = [`"content"."hasFrame"`];
    if (conditions.length > 0) {
      finalConditions.push(`(${conditions.join(" OR ")})`);
    }

    return this.getNewContent(req, finalConditions);
  }

  async getNewMedia(req: ShelfDataRequest<FarcasterMediaArgs>) {
    return this.getNewContent(req, [
      `("content"."type" ILIKE 'image%' OR "content"."type" ILIKE 'video%')`,
    ]);
  }

  async getNewContent(
    req: ShelfDataRequest<FarcasterMediaArgs>,
    baseConditions: string[],
  ) {
    const { data, context, cursor } = req;
    const { users, channels, includeReplies, onlyReplies } = data;

    const conditions: string[] = [
      ...baseConditions,
      `"reference"."type" = 'EMBED'`,
    ];

    if (users) {
      conditions.push(...(await this.getUserFilter(users)));
    }

    if (channels) {
      conditions.push(...(await this.getChannelFilter(channels)));
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
      { hash: string; timestamp: Date }[]
    >(
      Prisma.sql([
        `
            SELECT DISTINCT "reference".hash, "reference".timestamp
            FROM "FarcasterContentReference" AS "reference"
            LEFT JOIN "UrlContent" AS "content" ON "reference"."uri" = "content"."uri"
            WHERE ${conditions.join(" AND ")}
            ORDER BY "reference"."timestamp" DESC
            LIMIT ${MAX_PAGE_SIZE}
          `,
      ]),
    );

    return {
      data: casts.map((cast) => cast.hash),
      nextCursor:
        casts.length === MAX_PAGE_SIZE
          ? encodeCursor({
              timestamp: casts[casts.length - 1]?.timestamp.getTime(),
            })
          : undefined,
    };
  }

  async getUserFilter(users: UserFilter) {
    const conditions: string[] = [];
    switch (users.type) {
      case UserFilterType.FOLLOWING: {
        const following = await this.farcaster.getUserFollowingFids(
          users.data.fid,
        );
        conditions.push(`"fid" IN (${following.data.join(",")})`);
        break;
      }
      case UserFilterType.FIDS:
        conditions.push(
          `"fid" IN (${users.data.fids.map((fid) => BigInt(fid)).join(",")})`,
        );
        break;
      case UserFilterType.POWER_BADGE: {
        const holders = await this.farcasterCache.getPowerBadgeUsers();
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
        const response = await this.farcaster.getChannels({
          channelIds: channels.data.channelIds,
        });
        conditions.push(
          `"parentUrl" IN ('${response.data.map((c) => c.url).join("','")}')`,
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
