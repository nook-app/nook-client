import {
  FarcasterCast,
  FarcasterCastEmbedCast,
  FarcasterCastMention,
  Prisma,
  PrismaClient,
} from "../../prisma/farcaster";
import { RedisClient } from "../../redis";
import {
  HubRpcClient,
  getSSLHubRpcClient,
  Message as HubMessage,
} from "@farcaster/hub-nodejs";
import { EntityResponse, FarcasterCastResponse, FidHash } from "../../types";
import { NookClient } from "../nook";
import { EntityClient } from "../entity";

export class FarcasterClient {
  private client: PrismaClient;
  private redis: RedisClient;
  private nookClient: NookClient;
  private entityClient: EntityClient;
  private hub: HubRpcClient;

  CAST_CACHE_PREFIX = "cast";
  ENGAGEMENT_CACHE_PREFIX = "engagement";

  constructor() {
    this.client = new PrismaClient();
    this.redis = new RedisClient();
    this.nookClient = new NookClient();
    this.entityClient = new EntityClient();
    this.hub = getSSLHubRpcClient(process.env.HUB_RPC_ENDPOINT as string);
  }

  async connect() {
    await this.client.$connect();
    await this.redis.connect();
  }

  async close() {
    await this.client.$disconnect();
    await this.redis.close();
  }

  async getCastReplies(hash: string) {
    const casts = await this.client.farcasterCast.findMany({
      where: {
        parentHash: hash,
      },
    });
    return await Promise.all(
      casts.map((cast) => this.getCast(cast.hash, cast)),
    );
  }

  async getCasts(hashes: string[]) {
    return await Promise.all(hashes.map((hash) => this.getCast(hash)));
  }

  async getCast(
    hash: string,
    data?: FarcasterCast,
  ): Promise<FarcasterCastResponse> {
    const cached = await this.redis.getJson(
      `${this.CAST_CACHE_PREFIX}:${hash}`,
    );
    if (cached) return cached;

    const cast =
      data ||
      (await this.client.farcasterCast.findUnique({
        where: {
          hash,
        },
      }));

    if (!cast) {
      throw new Error(`Cast not found: ${hash}`);
    }

    const [relatedCasts, entityMap, channel, engagement] = await Promise.all([
      this.getRelatedCasts(cast),
      this.getRelatedEntities(cast),
      this.getRelatedChannel(cast),
      this.getEngagement(cast.hash),
    ]);

    const mentions = this.getMentions(cast);
    const urlEmbeds = this.getUrlEmbeds(cast);
    const castEmbeds: FarcasterCastResponse[] = [];
    for (const { hash } of this.getCastEmbeds(cast)) {
      castEmbeds.push(relatedCasts[hash]);
    }

    const response: FarcasterCastResponse = {
      hash: cast.hash,
      timestamp: cast.timestamp.getTime(),
      entity: entityMap[cast.fid.toString()],
      text: cast.text,
      mentions: mentions.map((mention) => ({
        entity: entityMap[mention.mention.toString()],
        position: mention.mentionPosition,
      })),
      castEmbeds,
      urlEmbeds,
      parent: cast.parentHash ? relatedCasts[cast.parentHash] : undefined,
      rootParent:
        cast.rootParentHash !== cast.hash
          ? relatedCasts[cast.rootParentHash]
          : undefined,
      channel,
      engagement,
    };

    await this.redis.setJson(`${this.CAST_CACHE_PREFIX}:${hash}`, response);

    return response;
  }

  async getRelatedCasts(cast: FarcasterCast) {
    const relatedHashes = [];
    if (cast.parentHash) {
      relatedHashes.push(cast.parentHash);
    }
    if (
      cast.rootParentHash !== cast.hash &&
      cast.rootParentHash !== cast.parentHash
    ) {
      relatedHashes.push(cast.rootParentHash);
    }

    for (const { hash } of this.getCastEmbeds(cast)) {
      relatedHashes.push(hash);
    }

    const relatedCasts = await this.getCasts(relatedHashes);
    return relatedCasts.reduce(
      (acc, cast) => {
        acc[cast.hash] = cast;
        return acc;
      },
      {} as Record<string, FarcasterCastResponse>,
    );
  }

  async getRelatedEntities(cast: FarcasterCast) {
    const entities = await this.entityClient.getEntitiesByFid(
      this.getFidsFromCast(cast),
    );
    return entities.reduce(
      (acc, entity) => {
        acc[entity.farcaster.fid] = entity;
        return acc;
      },
      {} as Record<string, EntityResponse>,
    );
  }

  async getRelatedChannel(cast: FarcasterCast) {
    if (!cast.parentUrl) return;
    return await this.nookClient.getChannel(cast.parentUrl);
  }

  getFidsFromCast(cast: FarcasterCast) {
    const fids = new Set<bigint>();
    fids.add(cast.fid);

    if (cast.parentFid) {
      fids.add(cast.parentFid);
    }

    if (cast.rootParentFid) {
      fids.add(cast.rootParentFid);
    }

    for (const { mention } of this.getMentions(cast)) {
      fids.add(mention);
    }

    for (const { fid } of this.getCastEmbeds(cast)) {
      fids.add(fid);
    }

    return Array.from(fids);
  }

  getMentions(data: FarcasterCast) {
    const mentions = [];
    // @ts-ignore
    if (data.rawMentions && data.rawMentions !== Prisma.DbNull) {
      for (const mention of data.rawMentions as unknown as FarcasterCastMention[]) {
        mentions.push({
          mention: mention.mention,
          mentionPosition: mention.mentionPosition,
        });
      }
    }
    return mentions;
  }

  getUrlEmbeds(data: FarcasterCast) {
    const embeds: string[] = [];
    // @ts-ignore
    if (data.rawUrlEmbeds && data.rawUrlEmbeds !== Prisma.DbNull) {
      for (const url of data.rawUrlEmbeds as string[]) {
        embeds.push(url);
      }
    }
    return embeds;
  }

  getCastEmbeds(data: FarcasterCast) {
    const embeds: FidHash[] = [];
    if (
      data.rawCastEmbeds &&
      (data.rawCastEmbeds as unknown) !== Prisma.DbNull
    ) {
      for (const embed of data.rawCastEmbeds as unknown as FarcasterCastEmbedCast[]) {
        embeds.push({ fid: embed.fid, hash: embed.embedHash });
      }
    }
    return embeds;
  }

  async getFollowers(fid: bigint) {
    return await this.client.farcasterLink.findMany({
      where: {
        linkType: "follow",
        targetFid: fid,
      },
    });
  }

  async getEngagement(hash: string) {
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

  async getLikes(hash: string): Promise<number> {
    const cached = await this.redis.getNumber(
      `${this.ENGAGEMENT_CACHE_PREFIX}:likes:${hash}`,
    );
    if (cached) return cached;

    const likes = await this.client.farcasterCastReaction.count({
      where: {
        reactionType: 1,
        targetHash: hash,
      },
    });

    await this.redis.setNumber(
      `${this.ENGAGEMENT_CACHE_PREFIX}:${hash}`,
      likes,
    );

    return likes;
  }

  async getRecasts(hash: string): Promise<number> {
    const cached = await this.redis.getNumber(
      `${this.ENGAGEMENT_CACHE_PREFIX}:recasts:${hash}`,
    );
    if (cached) return cached;

    const recasts = await this.client.farcasterCastReaction.count({
      where: {
        reactionType: 2,
        targetHash: hash,
      },
    });

    await this.redis.setNumber(
      `${this.ENGAGEMENT_CACHE_PREFIX}:${hash}`,
      recasts,
    );

    return recasts;
  }

  async getReplies(hash: string): Promise<number> {
    const cached = await this.redis.getNumber(
      `${this.ENGAGEMENT_CACHE_PREFIX}:replies:${hash}`,
    );
    if (cached) return cached;

    const replies = await this.client.farcasterCast.count({
      where: {
        parentHash: hash,
      },
    });

    await this.redis.setNumber(
      `${this.ENGAGEMENT_CACHE_PREFIX}:${hash}`,
      replies,
    );

    return replies;
  }

  async getQuotes(hash: string): Promise<number> {
    const cached = await this.redis.getNumber(
      `${this.ENGAGEMENT_CACHE_PREFIX}:quotes:${hash}`,
    );
    if (cached) return cached;

    const quotes = await this.client.farcasterCastEmbedCast.count({
      where: {
        embedHash: hash,
      },
    });

    await this.redis.setNumber(
      `${this.ENGAGEMENT_CACHE_PREFIX}:${hash}`,
      quotes,
    );

    return quotes;
  }

  async incrementEngagement(
    hash: string,
    type: "likes" | "recasts" | "replies" | "quotes",
  ) {
    await this.redis.increment(
      `${this.ENGAGEMENT_CACHE_PREFIX}:${type}:${hash}`,
    );
  }

  async decrementEngagement(
    hash: string,
    type: "likes" | "recasts" | "replies" | "quotes",
  ) {
    await this.redis.decrement(
      `${this.ENGAGEMENT_CACHE_PREFIX}:${type}:${hash}`,
    );
  }

  async getUsernameProof(name: string) {
    const proof = await this.hub.getUsernameProof({
      name: new Uint8Array(Buffer.from(name)),
    });
    if (proof.isErr()) return;
    return proof.value.fid;
  }

  async submitMessage(message: HubMessage): Promise<HubMessage> {
    const result = await this.hub.submitMessage(message);
    if (result.isErr()) {
      throw new Error(result.error.message);
    }
    return result.value;
  }
}
