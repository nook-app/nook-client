import { FarcasterAPIClient, FarcasterCacheClient } from "@nook/common/clients";
import { Prisma, PrismaClient } from "@nook/common/prisma/content";
import {
  ChannelFilter,
  ChannelFilterType,
  UserFilter,
  UserFilterType,
} from "@nook/common/types";
import { FarcasterFeedRequest } from "@nook/common/types/feed";
import { decodeCursor, encodeCursor } from "@nook/common/utils";
import { FastifyInstance } from "fastify";

export const MAX_PAGE_SIZE = 25;

function sanitizeInput(input: string): string {
  return input.replace(/[^a-zA-Z0-9\s./:]/g, "").substring(0, 100);
}

export class FeedService {
  private client: PrismaClient;
  private farcaster: FarcasterAPIClient;
  private farcasterCache: FarcasterCacheClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.content.client;
    this.farcaster = new FarcasterAPIClient();
    this.farcasterCache = new FarcasterCacheClient(fastify.redis.client);
  }

  async getContentFeed(req: FarcasterFeedRequest) {
    const { filter, context, cursor } = req;
    const {
      channels,
      users,
      embeds,
      contentTypes,
      includeReplies,
      onlyReplies,
      onlyFrames,
    } = filter;

    const conditions: string[] = [];

    if (onlyFrames) {
      conditions.push(`"reference"."hasFrame"`);
    }

    if (contentTypes && contentTypes.length > 0) {
      const formattedTypes = [];
      if (contentTypes.includes("application/x-mpegURL")) {
        formattedTypes.push("'application/x-mpegURL'");
      }
      if (contentTypes.includes("image")) {
        formattedTypes.push("'image/jpeg'");
        formattedTypes.push("'image/png'");
        formattedTypes.push("'image/gif'");
        formattedTypes.push("'image/webp'");
      }

      conditions.push(
        `("reference"."contentType" IN (${formattedTypes.join(",")}))`,
      );
    }

    if (embeds) {
      const embedConditions = embeds.map(
        (embed) => `"reference"."uri" ILIKE '%${sanitizeInput(embed)}%'`,
      );
      conditions.push(`(${embedConditions.join(" OR ")})`);
    }

    const [userCondition, channelCondition] = await Promise.all([
      this.getUserFilter(users),
      this.getChannelFilter(channels),
    ]);

    if (userCondition) {
      conditions.push(userCondition);
    }

    if (channelCondition) {
      conditions.push(channelCondition);
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

    if (context?.mutedUsers && context.mutedUsers.length > 0) {
      conditions.push(
        `"fid" NOT IN (${context.mutedUsers
          .map((fid) => BigInt(fid))
          .join(",")})`,
      );
    }

    if (context?.mutedChannels && context.mutedChannels.length > 0) {
      conditions.push(
        `"parentUrl" NOT IN ('${context.mutedChannels.join("','")}')`,
      );
    }

    const casts = await this.client.$queryRaw<
      { hash: string; timestamp: Date }[]
    >(
      Prisma.sql([
        `
            SELECT DISTINCT "reference".hash, "reference".timestamp
            FROM "FarcasterContentReference" AS "reference"
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

  async getUserFilter(users?: UserFilter) {
    if (!users) return;

    switch (users.type) {
      case UserFilterType.FOLLOWING: {
        const fids = await this.farcaster.getUserFollowingFids(users.data.fid);
        if (fids.data.length > 0) {
          return `"fid" IN (${fids.data.map((fid) => BigInt(fid)).join(",")})`;
        }
        break;
      }
      case UserFilterType.FIDS:
        if (users.data.fids.length > 0) {
          return `"fid" IN (${users.data.fids
            .map((fid) => BigInt(fid))
            .join(",")})`;
        }
        break;
      case UserFilterType.POWER_BADGE: {
        const [following, holders] = await Promise.all([
          users.data.fid
            ? this.farcaster.getUserFollowingFids(users.data.fid)
            : { data: [] },
          this.farcasterCache.getPowerBadgeUsers(),
        ]);

        const set = new Set(following.data.map((fid) => BigInt(fid)));
        for (const fid of holders) {
          set.add(BigInt(fid));
        }

        return `"fid" IN (${Array.from(set).join(",")})`;
      }
    }
  }

  async getChannelFilter(channels?: ChannelFilter) {
    if (!channels) return;

    switch (channels.type) {
      case ChannelFilterType.CHANNEL_IDS: {
        const response = await this.farcaster.getChannels({
          channelIds: channels.data.channelIds,
        });
        return `"parentUrl" IN ('${response.data
          .map((c) => c.url)
          .join("','")}')`;
      }
      case ChannelFilterType.CHANNEL_URLS: {
        return `"parentUrl" IN ('${channels.data.urls.join("','")}')`;
      }
    }
  }
}
