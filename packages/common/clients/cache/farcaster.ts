import { RedisClient } from "./base";
import {
  BaseFarcasterCast,
  BaseFarcasterUser,
  CastContextType,
  CastEngagementType,
  Channel,
  UserContextType,
  UserEngagementType,
} from "../../types";

export class FarcasterCacheClient {
  private redis: RedisClient;

  CAST_CACHE_PREFIX = "farcaster:cast";
  USER_CACHE_PREFIX = "farcaster:user";
  CHANNEL_CACHE_PREFIX = "farcaster:channel";

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async getCast(hash: string): Promise<BaseFarcasterCast> {
    return await this.redis.getJson(`${this.CAST_CACHE_PREFIX}:${hash}`);
  }

  async setCast(hash: string, cast: BaseFarcasterCast) {
    await this.redis.setJson(`${this.CAST_CACHE_PREFIX}:${hash}`, cast);
  }

  async removeCast(hash: string) {
    await this.redis.del(`${this.CAST_CACHE_PREFIX}:${hash}`);
  }

  async getCastEngagement(
    hash: string,
    type: CastEngagementType,
  ): Promise<number | undefined> {
    return await this.redis.getNumber(
      `${this.CAST_CACHE_PREFIX}:${hash}:${type}`,
    );
  }

  async setCastEngagement(
    hash: string,
    type: CastEngagementType,
    value: number,
  ) {
    await this.redis.setNumber(
      `${this.CAST_CACHE_PREFIX}:${hash}:${type}`,
      value,
    );
  }

  async getCastContext(
    hash: string,
    type: CastContextType,
    fid: string,
  ): Promise<boolean | undefined> {
    const result = await this.redis.get(
      `${this.CAST_CACHE_PREFIX}:${hash}:${type}:${fid}`,
    );
    if (result === "1") return true;
    if (result === "0") return false;
  }

  async setCastContext(
    hash: string,
    type: CastContextType,
    fid: string,
    value: boolean,
  ) {
    await this.redis.set(
      `${this.CAST_CACHE_PREFIX}:${hash}:${type}:${fid}`,
      value ? "1" : "0",
    );
  }

  async getUser(fid: string): Promise<BaseFarcasterUser> {
    return await this.redis.getJson(`${this.USER_CACHE_PREFIX}:${fid}`);
  }

  async getUsers(fids: string[]): Promise<BaseFarcasterUser[]> {
    return (
      await this.redis.mgetJson(
        fids.map((fid) => `${this.USER_CACHE_PREFIX}:${fid}`),
      )
    ).filter(Boolean);
  }

  async setUser(fid: string, user: BaseFarcasterUser) {
    await this.redis.setJson(`${this.USER_CACHE_PREFIX}:${fid}`, user);
  }

  async setUsers(users: BaseFarcasterUser[]) {
    await this.redis.msetJson(
      users.map((user) => [`${this.USER_CACHE_PREFIX}:${user.fid}`, user]),
    );
  }

  async getUserEngagement(
    fid: string,
    type: UserEngagementType,
  ): Promise<number | undefined> {
    return await this.redis.getNumber(
      `${this.USER_CACHE_PREFIX}:${fid}:${type}`,
    );
  }

  async setUserEngagement(
    fid: string,
    type: UserEngagementType,
    value: number,
  ) {
    await this.redis.setNumber(
      `${this.USER_CACHE_PREFIX}:${fid}:${type}`,
      value,
    );
  }

  async getUserContext(
    fid: string,
    type: UserContextType,
    targetFid: string,
  ): Promise<boolean | undefined> {
    const result = await this.redis.get(
      `${this.USER_CACHE_PREFIX}:${fid}:${type}:${targetFid}`,
    );
    if (result === "1") return true;
    if (result === "0") return false;
  }

  async setUserContext(
    fid: string,
    type: UserContextType,
    targetFid: string,
    value: boolean,
  ) {
    await this.redis.set(
      `${this.USER_CACHE_PREFIX}:${fid}:${type}:${targetFid}`,
      value ? "1" : "0",
    );
  }

  async resetCastEngagement(hash: string, type: CastEngagementType) {
    await this.redis.del(`${this.CAST_CACHE_PREFIX}:${hash}:${type}`);
  }

  async incrementUserEngagement(fid: string, type: UserEngagementType) {
    const key = `${this.USER_CACHE_PREFIX}:${fid}:${type}`;
    if (await this.redis.exists(key)) {
      await this.redis.increment(key);
    }
  }

  async decrementUserEngagement(fid: string, type: UserEngagementType) {
    const key = `${this.USER_CACHE_PREFIX}:${fid}:${type}`;
    if (await this.redis.exists(key)) {
      await this.redis.decrement(key);
    }
  }

  async getChannel(url: string): Promise<Channel | undefined> {
    return await this.redis.getJson(`${this.CHANNEL_CACHE_PREFIX}:${url}`);
  }

  async setChannel(url: string, channel: Channel) {
    await this.redis.setJson(`${this.CHANNEL_CACHE_PREFIX}:${url}`, channel);
  }

  async getChannelById(id: string): Promise<Channel | undefined> {
    return await this.redis.getJson(`${this.CHANNEL_CACHE_PREFIX}:${id}`);
  }

  async setChannelById(id: string, channel: Channel) {
    await this.redis.setJson(`${this.CHANNEL_CACHE_PREFIX}:${id}`, channel);
  }
}
