import { ContentAPIClient, FarcasterCacheClient } from "@nook/common/clients";
import {
  FarcasterCast,
  Prisma,
  PrismaClient,
} from "@nook/common/prisma/farcaster";
import {
  Channel,
  ChannelFilter,
  ChannelFilterType,
  FarcasterPostArgs,
  ShelfDataRequest,
  UserFilter,
  UserFilterType,
} from "@nook/common/types";
import { FarcasterFeedRequest } from "@nook/common/types/feed";
import { decodeCursor, encodeCursor } from "@nook/common/utils";
import { FastifyInstance } from "fastify";

const MAX_PAGE_SIZE = 25;

function sanitizeInput(input: string): string {
  return input.replace(/[^a-zA-Z0-9\s./$]/g, "").substring(0, 100);
}

export class FeedService {
  private client: PrismaClient;
  private cache: FarcasterCacheClient;
  private content: ContentAPIClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.farcaster.client;
    this.cache = new FarcasterCacheClient(fastify.redis.client);
    this.content = new ContentAPIClient();
  }

  async getCastFeed(req: FarcasterFeedRequest) {
    const { filter, context, cursor } = req;
    const {
      channels,
      users,
      text,
      embeds,
      contentTypes,
      includeReplies,
      onlyReplies,
      onlyFrames,
    } = filter;

    if (
      onlyFrames ||
      (contentTypes && contentTypes.length > 0) ||
      (embeds && embeds.length > 0)
    ) {
      const response = await this.content.getContentFeed(req);
      const casts = await this.client.farcasterCast.findMany({
        where: {
          hash: {
            in: response.data,
          },
        },
        orderBy: {
          timestamp: "desc",
        },
      });
      return {
        data: casts,
        nextCursor: response.nextCursor,
      };
    }

    const conditions: string[] = ['"deletedAt" IS NULL'];

    if (text) {
      const queryConditions = text.map(
        (q) =>
          `(to_tsvector('english', "text") @@ to_tsquery('english', '${sanitizeInput(
            q,
          ).replaceAll(" ", "<->")}'))`,
      );
      conditions.push(`(${queryConditions.join(" OR ")})`);
    }

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

    if (context?.mutedWords && context.mutedWords.length > 0) {
      conditions.push(
        `NOT (${context.mutedWords
          .map(
            (word) =>
              `to_tsvector('english', "text") @@ to_tsquery('english', '${sanitizeInput(
                word,
              ).replaceAll(" ", "<->")}')`,
          )
          .join(" OR ")})`,
      );
    }

    if (context?.mutedUsers && context.mutedUsers.length > 0) {
      conditions.push(
        `"fid" NOT IN (${context.mutedUsers
          .map((fid) => BigInt(fid))
          .join(",")})`,
      );
    }

    if (context?.mutedChannels && context.mutedChannels.length > 0) {
      if (onlyReplies)
        conditions.push(
          `"rootParentUrl" NOT IN ('${context.mutedChannels.join("','")}')`,
        );
    }

    const casts = await this.client.$queryRaw<FarcasterCast[]>(
      Prisma.sql([
        `
            SELECT *
            FROM "FarcasterCast"
            WHERE ${conditions.join(" AND ")}
            ORDER BY "timestamp" DESC
            LIMIT ${MAX_PAGE_SIZE}
          `,
      ]),
    );

    return {
      data: casts,
      nextCursor:
        casts.length === MAX_PAGE_SIZE
          ? encodeCursor({
              timestamp: casts[casts.length - 1]?.timestamp.getTime(),
            })
          : undefined,
    };
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
        const fids = await this.getFollowingFids(users.data.fid);
        conditions.push(`"fid" IN (${fids.join(",")})`);
        break;
      }
      case UserFilterType.FIDS:
        conditions.push(
          `"fid" IN (${users.data.fids.map((fid) => BigInt(fid)).join(",")})`,
        );
        break;
      case UserFilterType.POWER_BADGE: {
        const [following, holders] = await Promise.all([
          users.data.fid ? this.getFollowingFids(users.data.fid) : [],
          this.cache.getPowerBadgeUsers(),
        ]);

        const set = new Set(following);
        for (const fid of holders) {
          set.add(BigInt(fid));
        }

        conditions.push(`"fid" IN (${Array.from(set).join(",")})`);
        break;
      }
    }
    return conditions;
  }

  async getFollowingFids(fid: string) {
    const cachedFollowing = await this.cache.getUserFollowingFids(fid);
    if (cachedFollowing.length > 0) {
      return cachedFollowing.map((fid) => BigInt(fid));
    }
    const following = await this.client.farcasterLink.findMany({
      where: {
        linkType: "follow",
        fid: BigInt(fid),
        deletedAt: null,
      },
    });
    await this.cache.setUserFollowingFids(
      fid,
      following.map((link) => link.targetFid.toString()),
    );
    return following.map((link) => link.targetFid);
  }

  async getChannelFilter(channels: ChannelFilter) {
    const conditions: string[] = [];
    switch (channels.type) {
      case ChannelFilterType.CHANNEL_IDS: {
        const response = (
          await this.cache.getChannels(channels.data.channelIds)
        ).filter(Boolean) as Channel[];
        conditions.push(
          `"rootParentUrl" IN ('${response.map((c) => c.url).join("','")}')`,
        );
        break;
      }
      case ChannelFilterType.CHANNEL_URLS: {
        conditions.push(
          `"rootParentUrl" IN ('${channels.data.urls.join("','")}')`,
        );
        break;
      }
    }
    return conditions;
  }
}
