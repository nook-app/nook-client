import { FarcasterCast, PrismaClient } from "@nook/common/prisma/farcaster";
import { RedisClient } from "@nook/common/redis";
import {
  BaseFarcasterCast,
  BaseFarcasterCastWithContext,
  FarcasterCastContext,
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

  async getCasts(
    hashes: string[],
    viewerFid?: string,
  ): Promise<BaseFarcasterCastWithContext[]> {
    const casts = await Promise.all(
      hashes.map((hash) => this.getCast(hash, undefined, viewerFid)),
    );
    return casts.filter(Boolean) as BaseFarcasterCastWithContext[];
  }

  async getCastsByData(
    casts: FarcasterCast[],
    viewerFid?: string,
  ): Promise<BaseFarcasterCastWithContext[]> {
    const responses = await Promise.all(
      casts.map((cast) => this.getCast(cast.hash, cast, viewerFid)),
    );
    return responses.filter(Boolean) as BaseFarcasterCastWithContext[];
  }

  async getCastReplies(hash: string, viewerFid?: string) {
    const replies = await this.client.farcasterCast.findMany({
      where: { parentHash: hash, deletedAt: null },
    });

    return await this.getCastsByData(replies, viewerFid);
  }

  async getCast(
    hash: string,
    data?: FarcasterCast,
    viewerFid?: string,
  ): Promise<BaseFarcasterCastWithContext | undefined> {
    const [cast, engagement, context] = await Promise.all([
      this.getCastData(hash, data),
      this.getCastEngagement(hash),
      this.getCastContext(hash, viewerFid),
    ]);
    if (!cast) return;

    return {
      ...cast,
      engagement,
      context,
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

  async getCastContext(
    hash: string,
    viewerFid?: string,
  ): Promise<FarcasterCastContext | undefined> {
    if (!viewerFid) return;

    const [liked, recasted] = await Promise.all([
      this.getLikedContext(hash, viewerFid),
      this.getRecastedContext(hash, viewerFid),
    ]);

    return {
      liked,
      recasted,
    };
  }

  async getLikedContext(hash: string, viewerFid: string): Promise<boolean> {
    const key = `${this.CAST_CACHE_PREFIX}:${hash}:likes:${viewerFid}`;
    const cached = await this.redis.exists(key);
    if (cached) return true;

    const reaction = await this.client.farcasterCastReaction.findFirst({
      where: {
        reactionType: 1,
        fid: BigInt(viewerFid),
        targetHash: hash,
        deletedAt: null,
      },
    });

    if (reaction) {
      await this.redis.set(key, "1");
      return true;
    }

    return false;
  }

  async getRecastedContext(hash: string, viewerFid: string): Promise<boolean> {
    const key = `${this.CAST_CACHE_PREFIX}:${hash}:recasts:${viewerFid}`;
    const cached = await this.redis.exists(key);
    if (cached) return true;

    const reaction = await this.client.farcasterCastReaction.findFirst({
      where: {
        reactionType: 2,
        fid: BigInt(viewerFid),
        targetHash: hash,
        deletedAt: null,
      },
    });

    if (reaction) {
      await this.redis.set(key, "1");
      return true;
    }

    return false;
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

  async getCastsByParentUrl(
    request: GetFarcasterCastsByParentUrlRequest,
    viewerFid?: string,
  ) {
    const minTimestamp = request.minCursor
      ? new Date(request.minCursor)
      : undefined;

    const maxTimestamp = request.maxCursor
      ? new Date(request.maxCursor)
      : undefined;

    const casts = await this.client.farcasterCast.findMany({
      where: {
        parentUrl: request.parentUrl,
        timestamp: {
          lt: maxTimestamp,
          gt: minTimestamp,
        },
        deletedAt: null,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: request.limit || MAX_PAGE_SIZE,
    });

    return await this.getCastsByData(casts, viewerFid);
  }

  async getCastsByFids(
    request: GetFarcasterCastsByFidsRequest,
    viewerFid?: string,
  ) {
    const minTimestamp = request.minCursor
      ? new Date(request.minCursor)
      : undefined;

    const maxTimestamp = request.maxCursor
      ? new Date(request.maxCursor)
      : undefined;

    const casts = await this.client.farcasterCast.findMany({
      where: {
        fid: {
          in: request.fids.map((fid) => BigInt(fid)),
        },
        timestamp: {
          lt: maxTimestamp,
          gt: minTimestamp,
        },
        parentHash: request.replies ? { not: null } : null,
        deletedAt: null,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: request.limit || MAX_PAGE_SIZE,
    });

    return await this.getCastsByData(casts, viewerFid);
  }

  async getCastsByFollowing(
    request: GetFarcasterCastsByFollowingRequest,
    viewerFid?: string,
  ) {
    const following = await this.client.farcasterLink.findMany({
      where: {
        linkType: "follow",
        fid: BigInt(request.fid),
        deletedAt: null,
      },
    });

    const minTimestamp = request.minCursor
      ? new Date(request.minCursor)
      : undefined;

    const maxTimestamp = request.maxCursor
      ? new Date(request.maxCursor)
      : undefined;

    const casts = await this.client.farcasterCast.findMany({
      where: {
        fid: {
          in: following.map((link) => link.targetFid),
        },
        timestamp: {
          lt: maxTimestamp,
          gt: minTimestamp,
        },
        parentHash: null,
        deletedAt: null,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: request.limit || MAX_PAGE_SIZE,
    });

    return await this.getCastsByData(casts, viewerFid);
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
