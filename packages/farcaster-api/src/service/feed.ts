import {
  ContentAPIClient,
  FarcasterCacheClient,
  NookCacheClient,
} from "@nook/common/clients";
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
  private nook: NookCacheClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.farcaster.client;
    this.cache = new FarcasterCacheClient(fastify.redis.client);
    this.nook = new NookCacheClient(fastify.redis.client);
    this.content = new ContentAPIClient();
  }

  async getTopCastFeed(req: FarcasterFeedRequest) {
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

    const [userCondition, channelCondition, muteCondition] = await Promise.all([
      this.getUserFilter(users),
      this.getChannelFilter(channels),
      this.getMuteFilter(context?.viewerFid),
    ]);

    if (userCondition) {
      conditions.push(userCondition);
    }
    if (channelCondition) {
      conditions.push(channelCondition);
    }
    if (muteCondition?.words) {
      conditions.push(
        `NOT (${muteCondition.words
          .map(
            (word) =>
              `to_tsvector('english', "text") @@ to_tsquery('english', '${sanitizeInput(
                word,
              ).replaceAll(" ", "<->")}')`,
          )
          .join(" OR ")})`,
      );
    }

    if (muteCondition?.users) {
      conditions.push(
        `"fid" NOT IN (${muteCondition.users
          .map((fid) => BigInt(fid))
          .join(",")})`,
      );
    }

    if (muteCondition?.channels) {
      if (onlyReplies)
        conditions.push(
          `"rootParentUrl" NOT IN ('${muteCondition.channels.join("','")}')`,
        );
    }

    if (cursor) {
      const decodedCursor = decodeCursor(cursor);
      if (decodedCursor) {
        conditions.push(
          `(COALESCE(likes, 0) < ${
            decodedCursor.likes
          } OR (COALESCE(likes, 0) = ${
            decodedCursor.likes
          } AND "timestamp" < '${new Date(
            decodedCursor.timestamp,
          ).toISOString()}'))`,
        );
      }
    }

    if (onlyReplies) {
      conditions.push(`"parentHash" IS NOT NULL`);
    } else if (!includeReplies) {
      conditions.push(`"parentHash" IS NULL`);
    }

    const casts = await this.client.$queryRaw<
      (FarcasterCast & { likes: number })[]
    >(
      Prisma.sql([
        `
            SELECT "FarcasterCast".*, "FarcasterCastStats".likes AS likes
            FROM "FarcasterCast"
            LEFT JOIN "FarcasterCastStats" ON "FarcasterCast"."hash" = "FarcasterCastStats"."hash"
            WHERE ${conditions.join(" AND ")}
            ORDER BY "likes" DESC NULLS LAST, "timestamp" DESC
            LIMIT ${MAX_PAGE_SIZE}
          `,
      ]),
    );

    return {
      data: casts,
      nextCursor:
        casts.length === MAX_PAGE_SIZE
          ? encodeCursor({
              likes: casts[casts.length - 1]?.likes,
              timestamp: casts[casts.length - 1]?.timestamp.getTime(),
            })
          : undefined,
    };
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

    const [userCondition, channelCondition, muteCondition] = await Promise.all([
      this.getUserFilter(users),
      this.getChannelFilter(channels),
      this.getMuteFilter(context?.viewerFid),
    ]);

    if (userCondition) {
      conditions.push(userCondition);
    }
    if (channelCondition) {
      conditions.push(channelCondition);
    }
    if (muteCondition?.words) {
      conditions.push(
        `NOT (${muteCondition.words
          .map(
            (word) =>
              `to_tsvector('english', "text") @@ to_tsquery('english', '${sanitizeInput(
                word,
              ).replaceAll(" ", "<->")}')`,
          )
          .join(" OR ")})`,
      );
    }

    if (muteCondition?.users) {
      conditions.push(
        `"fid" NOT IN (${muteCondition.users
          .map((fid) => BigInt(fid))
          .join(",")})`,
      );
    }

    if (muteCondition?.channels) {
      if (onlyReplies)
        conditions.push(
          `"rootParentUrl" NOT IN ('${muteCondition.channels.join("','")}')`,
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

    const [userCondition, channelCondition, muteCondition] = await Promise.all([
      this.getUserFilter(users),
      this.getChannelFilter(channels),
      this.getMuteFilter(context?.viewerFid),
    ]);

    if (userCondition) {
      conditions.push(userCondition);
    }
    if (channelCondition) {
      conditions.push(channelCondition);
    }
    if (muteCondition?.words) {
      conditions.push(
        `NOT (${muteCondition.words
          .map(
            (word) =>
              `to_tsvector('english', "text") @@ to_tsquery('english', '${sanitizeInput(
                word,
              ).replaceAll(" ", "<->")}')`,
          )
          .join(" OR ")})`,
      );
    }

    if (muteCondition?.users) {
      conditions.push(
        `"fid" NOT IN (${muteCondition.users
          .map((fid) => BigInt(fid))
          .join(",")})`,
      );
    }

    if (muteCondition?.channels) {
      if (onlyReplies)
        conditions.push(
          `"rootParentUrl" NOT IN ('${muteCondition.channels.join("','")}')`,
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

  async getUserFilter(users?: UserFilter) {
    if (!users) return;

    switch (users.type) {
      case UserFilterType.FOLLOWING: {
        const fids = await this.getFollowingFids(users.data.fid);
        if (fids.length > 0) {
          return `"FarcasterCast"."fid" IN (${fids.join(",")})`;
        }
        break;
      }
      case UserFilterType.FIDS:
        if (users.data.fids.length > 0) {
          return `"FarcasterCast"."fid" IN (${users.data.fids
            .map((fid) => BigInt(fid))
            .join(",")})`;
        }
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
        return `"FarcasterCast"."fid" IN (${Array.from(set).join(",")})`;
      }
    }
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

  async getChannelFilter(channels?: ChannelFilter) {
    if (!channels) return;

    switch (channels.type) {
      case ChannelFilterType.CHANNEL_IDS: {
        const response = (
          await this.cache.getChannels(channels.data.channelIds)
        ).filter(Boolean) as Channel[];
        return `"rootParentUrl" IN ('${response
          .map((c) => c.url)
          .join("','")}')`;
      }
      case ChannelFilterType.CHANNEL_URLS: {
        return `"rootParentUrl" IN ('${channels.data.urls.join("','")}')`;
      }
    }
  }

  async getMuteFilter(fid?: string) {
    if (!fid) return;

    let mutes: string[] = [];
    if (fid) {
      try {
        mutes = await this.nook.getUserMutes(fid);
      } catch (e) {}
    }

    const channels = mutes
      .filter((m) => m.startsWith("channel:"))
      .map((m) => m.split(":")[1]);

    const users = mutes
      .filter((m) => m.startsWith("user:"))
      .map((m) => m.split(":")[1]);

    const words = mutes
      .filter((m) => m.startsWith("word:"))
      .map((m) => m.split(":")[1]);

    return {
      channels: channels.length > 0 ? channels : undefined,
      users: users.length > 0 ? users : undefined,
      words: words.length > 0 ? words : undefined,
    };
  }
}
