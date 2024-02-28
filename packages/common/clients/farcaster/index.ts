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
import { FidHash } from "../../types";

export class FarcasterClient {
  private client: PrismaClient;
  private redis: RedisClient;
  private hub: HubRpcClient;

  CAST_CACHE_PREFIX = "cast";

  constructor() {
    this.client = new PrismaClient();
    this.redis = new RedisClient();
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

  async getCasts(hashes: string[]) {
    return await Promise.all(hashes.map((hash) => this.getCast(hash)));
  }

  async getCast(hash: string, data?: FarcasterCast): Promise<FarcasterCast> {
    const cached = await this.redis.getJson(
      `${this.CAST_CACHE_PREFIX}:${hash}`,
    );
    if (cached) return cached;

    if (data) {
      await this.redis.setJson(`${this.CAST_CACHE_PREFIX}:${hash}`, data);
      return data;
    }

    return this.fetchCast(hash);
  }

  async fetchCast(hash: string) {
    const cast = await this.client.farcasterCast.findUnique({
      where: {
        hash,
      },
    });

    if (cast) {
      await this.redis.setJson(`${this.CAST_CACHE_PREFIX}:${hash}`, cast);
    }

    if (!cast) {
      throw new Error(`Cast not found: ${hash}`);
    }

    return cast;
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
}
