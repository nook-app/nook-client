import { RedisClient } from "./base";
import { Nook } from "../../types";

export class NookCacheClient {
  private redis: RedisClient;

  NOOK_CACHE_PREFIX = "nook";
  USER_MUTES_CACHE_PREFIX = "user-mutes";

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async getNook(nookId: string): Promise<Nook> {
    return await this.redis.getJson(`${this.NOOK_CACHE_PREFIX}:${nookId}`);
  }

  async setNook(nookId: string, nook: Nook) {
    await this.redis.setJson(`${this.NOOK_CACHE_PREFIX}:${nookId}`, nook);
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
