import { RedisClient } from "./base";
import {
  BaseFarcasterCast,
  BaseFarcasterUser,
  CastContextType,
  CastEngagementType,
  Channel,
  FarcasterTrendingCashtag,
  UserContextType,
  UserEngagementType,
} from "../../types";

export class FarcasterCacheClient {
  private redis: RedisClient;

  CAST_CACHE_PREFIX = "farcaster:cast";
  USER_CACHE_PREFIX = "farcaster:user";
  CHANNEL_CACHE_PREFIX = "farcaster:channel";
  CLIENT_CACHE_PREFIX = "farcaster:client";
  POWER_BADGE_CACHE_PREFIX = "warpcast:power-badge";

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async getCast(hash: string): Promise<BaseFarcasterCast> {
    return await this.redis.getJson(`${this.CAST_CACHE_PREFIX}:${hash}`);
  }

  async getCasts(hashes: string[]): Promise<BaseFarcasterCast[]> {
    return (
      await this.redis.mgetJson(
        hashes.map((hash) => `${this.CAST_CACHE_PREFIX}:${hash}`),
      )
    ).filter(Boolean);
  }

  async setCast(hash: string, cast: BaseFarcasterCast) {
    await this.redis.setJson(`${this.CAST_CACHE_PREFIX}:${hash}`, cast, 86400);
  }

  async setCasts(casts: BaseFarcasterCast[]) {
    await this.redis.msetJson(
      casts.map((cast) => [`${this.CAST_CACHE_PREFIX}:${cast.hash}`, cast]),
      86400,
    );
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
      86400,
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
      86400,
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
    await this.redis.setJson(`${this.USER_CACHE_PREFIX}:${fid}`, user, 86400);
  }

  async setUsers(users: BaseFarcasterUser[]) {
    await this.redis.msetJson(
      users.map((user) => [`${this.USER_CACHE_PREFIX}:${user.fid}`, user]),
      86400,
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
      86400,
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
      86400,
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
    await this.redis.setJson(
      `${this.CHANNEL_CACHE_PREFIX}:${url}`,
      channel,
      86400,
    );
  }

  async getChannelById(id: string): Promise<Channel | undefined> {
    return await this.redis.getJson(`${this.CHANNEL_CACHE_PREFIX}:${id}`);
  }

  async setChannelById(id: string, channel: Channel) {
    await this.redis.setJson(
      `${this.CHANNEL_CACHE_PREFIX}:${id}`,
      channel,
      86400,
    );
  }

  async getChannelsByIds(ids: string[]): Promise<Channel[]> {
    return (
      await this.redis.mgetJson(
        ids.map((id) => `${this.CHANNEL_CACHE_PREFIX}:${id}`),
      )
    ).filter(Boolean);
  }

  async getAppFidBySigner(signer: string): Promise<string | null> {
    return await this.redis.get(`${this.CLIENT_CACHE_PREFIX}:${signer}`);
  }

  async getAppFidsBySigners(
    signers: string[],
  ): Promise<{ [key: string]: string | undefined }> {
    const results = await this.redis.mget(
      signers.map((signer) => `${this.CLIENT_CACHE_PREFIX}:${signer}`),
    );
    return results.reduce((acc, result, i) => {
      acc[signers[i]] = result || undefined;
      return acc;
    }, {} as { [key: string]: string | undefined });
  }

  async setAppFidBySigner(pubkey: string, user: string) {
    await this.redis.set(`${this.CLIENT_CACHE_PREFIX}:${pubkey}`, user, 86400);
  }

  async removeAppFidBySigner(pubkey: string) {
    await this.redis.del(`${this.CLIENT_CACHE_PREFIX}:${pubkey}`);
  }

  async setPowerBadgeUsers(users: string[]) {
    await this.redis.setJson(this.POWER_BADGE_CACHE_PREFIX, users);
  }

  async getPowerBadgeUsers(): Promise<string[]> {
    return await this.redis.getJson(this.POWER_BADGE_CACHE_PREFIX);
  }

  async getUserPowerBadge(fid: string): Promise<boolean> {
    const powerBadge = await this.redis.get(
      `${this.USER_CACHE_PREFIX}:${fid}:power-badge`,
    );
    if (powerBadge === "1") return true;
    if (powerBadge === "0") return false;

    const powerBadges = await this.getPowerBadgeUsers();
    if (!powerBadges) return false;

    const hasPowerBadge = powerBadges.includes(fid);
    await this.redis.set(
      `${this.USER_CACHE_PREFIX}:${fid}:power-badge`,
      hasPowerBadge ? "1" : "0",
      60 * 60 * 24,
    );
    return hasPowerBadge;
  }

  async setCastThread(hash: string, thread: string[]) {
    await this.redis.setJson(
      `${this.CAST_CACHE_PREFIX}:${hash}:thread`,
      thread,
      86400,
    );
  }

  async getCastThread(hash: string): Promise<string[]> {
    return await this.redis.getJson(`${this.CAST_CACHE_PREFIX}:${hash}:thread`);
  }

  async resetCastThread(hash: string) {
    await this.redis.del(`${this.CAST_CACHE_PREFIX}:${hash}:thread`);
  }

  async setTrendingCashtags(data: FarcasterTrendingCashtag[]) {
    await this.redis.setJson("farcaster:trending-cashtags", data);
  }

  async getTrendingCashtags(): Promise<FarcasterTrendingCashtag[]> {
    return await this.redis.getJson("farcaster:trending-cashtags");
  }
}
