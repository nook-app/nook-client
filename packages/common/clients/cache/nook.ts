import { RedisClient } from "./base";

export class NookCacheClient {
  private redis: RedisClient;

  NOOK_CACHE_PREFIX = "nook";
  USER_MUTES_CACHE_PREFIX = "user-mutes";

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async getUserMutes(userId: string): Promise<string[]> {
    return await this.redis.getMembers(
      `${this.USER_MUTES_CACHE_PREFIX}:${userId}`,
    );
  }

  async addUserMute(userId: string, mute: string) {
    await this.redis.addMember(
      `${this.USER_MUTES_CACHE_PREFIX}:${userId}`,
      mute,
      true,
    );
  }

  async removeUserMute(userId: string, mute: string) {
    await this.redis.removeMember(
      `${this.USER_MUTES_CACHE_PREFIX}:${userId}`,
      mute,
    );
  }
}
