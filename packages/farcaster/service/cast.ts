import { FarcasterCast, PrismaClient } from "@nook/common/prisma/farcaster";
import { RedisClient } from "@nook/common/redis";
import {
  BaseFarcasterCast,
  BaseFarcasterCastWithContext,
  FarcasterCastEngagement,
  GetFarcasterCastsByFidsRequest,
  GetFarcasterCastsByFollowingRequest,
  GetFarcasterCastsByParentUrlRequest,
} from "@nook/common/types";
import { getCastEmbeds, getEmbedUrls, getMentions } from "../src/utils";

export const MAX_PAGE_SIZE = 25;

type CastEngagementType = "likes" | "recasts" | "replies" | "quotes";

export class CastService {
  private client: PrismaClient;
  private redis: RedisClient;

  CAST_CACHE_PREFIX = "farcaster:cast";

  constructor(client: PrismaClient, redis: RedisClient) {
    this.client = client;
    this.redis = redis;
  }

  async getCasts(hashes: string[]): Promise<BaseFarcasterCastWithContext[]> {
    const casts = await Promise.all(hashes.map((hash) => this.getCast(hash)));
    return casts.filter(Boolean) as BaseFarcasterCastWithContext[];
  }

  async getCastsByData(
    casts: FarcasterCast[],
  ): Promise<BaseFarcasterCastWithContext[]> {
    const responses = await Promise.all(
      casts.map((cast) => this.getCast(cast.hash, cast)),
    );
    return responses.filter(Boolean) as BaseFarcasterCastWithContext[];
  }

  async getCastReplies(hash: string) {
    const replies = await this.client.farcasterCast.findMany({
      where: { parentHash: hash },
    });

    return this.getCastsByData(replies);
  }

  async getCast(
    hash: string,
    data?: FarcasterCast,
  ): Promise<BaseFarcasterCastWithContext | undefined> {
    const cast = await this.getCastData(hash, data);
    if (!cast) return;

    const [engagement] = await Promise.all([this.getCastEngagement(hash)]);

    return {
      ...cast,
      engagement,
    };
  }

  async getCastData(
    hash: string,
    data?: FarcasterCast,
  ): Promise<BaseFarcasterCast | undefined> {
    const cached = await this.getCachedCast(hash);
    if (cached) return cached;

    const cast = await this.fetchCast(hash, data);
    if (!cast) {
      return;
    }

    const baseCast: BaseFarcasterCast = {
      hash: cast.hash,
      fid: cast.fid.toString(),
      timestamp: cast.timestamp.getTime(),
      text: cast.text,
      mentions: getMentions(cast),
      embedHashes: getCastEmbeds(cast).map(({ hash }) => hash),
      embedUrls: getEmbedUrls(cast),
      parentHash: cast.parentHash || undefined,
      parentUrl: cast.parentUrl || undefined,
    };

    await this.setCachedCast(hash, baseCast);

    return baseCast;
  }

  async getCastEngagement(hash: string): Promise<FarcasterCastEngagement> {
    const [likes, recasts, replies, quotes] = await Promise.all([
      this.getLikes(hash),
      this.getRecasts(hash),
      this.getReplies(hash),
      this.getQuotes(hash),
    ]);

    return {
      likes,
      recasts,
      replies,
      quotes,
    };
  }

  async fetchCast(hash: string, data?: FarcasterCast) {
    if (data) return data;
    return this.client.farcasterCast.findUnique({
      where: { hash },
    });
  }

  async setCachedCast(hash: string, cast: BaseFarcasterCast) {
    await this.redis.setJson(`${this.CAST_CACHE_PREFIX}:${hash}`, cast);
  }

  async getCachedCast(hash: string) {
    return await this.redis.getJson(`${this.CAST_CACHE_PREFIX}:${hash}`);
  }

  async getLikes(hash: string): Promise<number> {
    const cached = await this.getCachedEngagement(hash, "likes");
    if (cached) return cached;

    const likes = await this.client.farcasterCastReaction.count({
      where: { reactionType: 1, targetHash: hash },
    });

    await this.setCachedEngagement(hash, "likes", likes);
    return likes;
  }

  async getRecasts(hash: string): Promise<number> {
    const cached = await this.getCachedEngagement(hash, "recasts");
    if (cached) return cached;

    const recasts = await this.client.farcasterCastReaction.count({
      where: { reactionType: 2, targetHash: hash },
    });

    await this.setCachedEngagement(hash, "recasts", recasts);
    return recasts;
  }

  async getReplies(hash: string): Promise<number> {
    const cached = await this.getCachedEngagement(hash, "replies");
    if (cached) return cached;

    const replies = await this.client.farcasterCast.count({
      where: { parentHash: hash },
    });

    await this.setCachedEngagement(hash, "replies", replies);
    return replies;
  }

  async getQuotes(hash: string): Promise<number> {
    const cached = await this.getCachedEngagement(hash, "quotes");
    if (cached) return cached;

    const quotes = await this.client.farcasterCastEmbedCast.count({
      where: { embedHash: hash },
    });

    await this.setCachedEngagement(hash, "quotes", quotes);
    return quotes;
  }

  async setCachedEngagement(
    hash: string,
    type: CastEngagementType,
    value: number,
  ) {
    await this.redis.setNumber(
      `${this.CAST_CACHE_PREFIX}:${hash}:${type}`,
      value,
    );
  }

  async getCachedEngagement(hash: string, type: CastEngagementType) {
    return await this.redis.getJson(
      `${this.CAST_CACHE_PREFIX}:${hash}:${type}`,
    );
  }

  async getCastsByParentUrl(request: GetFarcasterCastsByParentUrlRequest) {
    const timestamp = request.cursor ? new Date(request.cursor) : new Date();
    const casts = await this.client.farcasterCast.findMany({
      where: {
        parentUrl: request.parentUrl,
        timestamp: {
          lt: timestamp,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: request.limit || MAX_PAGE_SIZE,
    });

    return this.getCastsByData(casts);
  }

  async getCastsByFids(request: GetFarcasterCastsByFidsRequest) {
    const timestamp = request.cursor ? new Date(request.cursor) : new Date();
    const casts = await this.client.farcasterCast.findMany({
      where: {
        fid: {
          in: request.fids.map((fid) => BigInt(fid)),
        },
        timestamp: {
          lt: timestamp,
        },
        parentHash: request.replies ? { not: null } : null,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: request.limit || MAX_PAGE_SIZE,
    });

    return this.getCastsByData(casts);
  }

  async getCastsByFollowing(request: GetFarcasterCastsByFollowingRequest) {
    const following = await this.client.farcasterLink.findMany({
      where: {
        linkType: "follow",
        fid: BigInt(request.fid),
        deletedAt: null,
      },
    });

    const timestamp = request.cursor ? new Date(request.cursor) : new Date();
    const casts = await this.client.farcasterCast.findMany({
      where: {
        fid: {
          in: following.map((link) => link.targetFid),
        },
        timestamp: {
          lt: timestamp,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: request.limit || MAX_PAGE_SIZE,
    });

    return this.getCastsByData(casts);
  }

  async incrementEngagement(hash: string, type: CastEngagementType) {
    const key = `${this.CAST_CACHE_PREFIX}:${hash}:${type}`;
    if (await this.redis.exists(key)) {
      await this.redis.increment(key);
    }
  }

  async decrementEngagement(hash: string, type: CastEngagementType) {
    const key = `${this.CAST_CACHE_PREFIX}:${hash}:${type}`;
    if (await this.redis.exists(key)) {
      await this.redis.decrement(key);
    }
  }
}
