import { FarcasterCast, PrismaClient } from "../../prisma/farcaster";
import { RedisClient } from "../../redis";

export class FarcasterClient {
  private client: PrismaClient;
  private redis: RedisClient;

  CAST_CACHE_PREFIX = "cast";

  constructor() {
    this.client = new PrismaClient();
    this.redis = new RedisClient();
  }

  async connect() {
    await this.client.$connect();
    await this.redis.connect();
  }

  async close() {
    await this.client.$disconnect();
    await this.redis.close();
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
}
