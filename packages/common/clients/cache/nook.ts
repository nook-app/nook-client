import { RedisClient } from "./base";
import { Nook } from "../../types";

export class NookCacheClient {
  private redis: RedisClient;

  NOOK_CACHE_PREFIX = "nook";

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async getNook(nookId: string): Promise<Nook> {
    return await this.redis.getJson(`${this.NOOK_CACHE_PREFIX}:${nookId}`);
  }

  async setNook(nookId: string, nook: Nook) {
    await this.redis.setJson(`${this.NOOK_CACHE_PREFIX}:${nookId}`, nook);
  }
}
