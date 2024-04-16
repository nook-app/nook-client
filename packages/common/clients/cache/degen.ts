import { RedisClient } from "./base";

export class DegenCacheClient {
  private redis: RedisClient;

  DEGEN_CACHE_PREFIX = "degen";

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async checkHasAllowanceTtl() {
    return await this.redis.exists(`${this.DEGEN_CACHE_PREFIX}:hasAllowance`);
  }

  async checkHasAllowance(fid: string) {
    return await this.redis.checkMember(
      `${this.DEGEN_CACHE_PREFIX}:hasAllowance`,
      fid,
    );
  }

  async setFidsWithAllowances(fids: string[]) {
    await this.redis.addMembers(
      `${this.DEGEN_CACHE_PREFIX}:hasAllowance`,
      fids,
      43200, // 12 hours
    );
  }
}
