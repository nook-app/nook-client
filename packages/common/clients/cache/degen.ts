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
    return await this.redis.checkMember(this.DEGEN_CACHE_PREFIX, fid);
  }

  async setFidsWithAllowances(fids: string[]) {
    await this.redis.addMembersWithTtl(
      this.DEGEN_CACHE_PREFIX,
      fids,
      // 12h
      43200,
    );
  }
}
