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
  USER_FOLLOWING_FIDS_CACHE_PREFIX = "farcaster:user:following:fids";
  USER_FOLLOWERS_FIDS_CACHE_PREFIX = "farcaster:user:followers:fids";

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async getCast(hash: string): Promise<BaseFarcasterCast> {
    return await this.redis.getJson(`${this.CAST_CACHE_PREFIX}:${hash}`);
  }

  async getCasts(hashes: string[]): Promise<(BaseFarcasterCast | undefined)[]> {
    return await this.redis.mgetJson(
      hashes.map((hash) => `${this.CAST_CACHE_PREFIX}:${hash}`),
    );
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

  async getCastEngagements(
    type: CastEngagementType,
    hashes: string[],
  ): Promise<(number | undefined)[]> {
    return await this.redis.mgetNumber(
      hashes.map((hash) => `${this.CAST_CACHE_PREFIX}:${hash}:${type}`),
    );
  }

  async setCastEngagements(
    type: CastEngagementType,
    hashes: string[],
    values: number[],
  ) {
    await this.redis.msetNumber(
      hashes.map((hash, i) => [
        `${this.CAST_CACHE_PREFIX}:${hash}:${type}`,
        values[i],
      ]),
      86400,
    );
  }

  async getCastContexts(
    type: CastContextType,
    fid: string,
    hashes: string[],
  ): Promise<(boolean | undefined)[]> {
    const result = await this.redis.mget(
      hashes.map((hash) => `${this.CAST_CACHE_PREFIX}:${hash}:${type}:${fid}`),
    );
    return result.map((value) => {
      if (value === "1") return true;
      if (value === "0") return false;
      return undefined;
    });
  }

  async setCastContexts(
    type: CastContextType,
    fid: string,
    hashes: string[],
    values: boolean[],
  ) {
    await this.redis.mset(
      hashes.map((hash, i) => [
        `${this.CAST_CACHE_PREFIX}:${hash}:${type}:${fid}`,
        values[i] ? "1" : "0",
      ]),
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

  async getUserEngagements(
    type: UserEngagementType,
    fids: string[],
  ): Promise<(number | undefined)[]> {
    return await this.redis.mgetNumber(
      fids.map((fid) => `${this.USER_CACHE_PREFIX}:${fid}:${type}`),
    );
  }

  async setUserEngagements(
    type: UserEngagementType,
    fids: string[],
    values: number[],
  ) {
    await this.redis.msetNumber(
      fids.map((fid, i) => [
        `${this.USER_CACHE_PREFIX}:${fid}:${type}`,
        values[i],
      ]),
      86400,
    );
  }

  async getUserContexts(
    type: UserContextType,
    fid: string,
    targetFids: string[],
  ): Promise<(boolean | undefined)[]> {
    const result = await this.redis.mget(
      targetFids.map(
        (targetFid) =>
          `${this.USER_CACHE_PREFIX}:${
            type === "following" ? fid : targetFid
          }:following:${type === "following" ? targetFid : fid}`,
      ),
    );
    return result.map((value) => {
      if (value === "1") return true;
      if (value === "0") return false;
      return undefined;
    });
  }

  async setUserContexts(
    type: UserContextType,
    fid: string,
    targetFids: string[],
    values: boolean[],
  ) {
    await this.redis.mset(
      targetFids.map((targetFid, i) => [
        `${this.USER_CACHE_PREFIX}:${
          type === "following" ? fid : targetFid
        }:following:${type === "following" ? targetFid : fid}`,
        values[i] ? "1" : "0",
      ]),
      86400,
    );
  }

  async incrementCastEngagement(hash: string, type: CastEngagementType) {
    const key = `${this.CAST_CACHE_PREFIX}:${hash}:${type}`;
    if (await this.redis.exists(key)) {
      await this.redis.increment(key);
    }
  }

  async resetCastEngagement(hash: string, type: CastEngagementType) {
    await this.redis.del(`${this.CAST_CACHE_PREFIX}:${hash}:${type}`);
  }

  async decrementCastEngagement(hash: string, type: CastEngagementType) {
    const key = `${this.CAST_CACHE_PREFIX}:${hash}:${type}`;
    if (await this.redis.exists(key)) {
      await this.redis.decrement(key);
    }
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

  async getChannels(keys: string[]): Promise<(Channel | undefined)[]> {
    return await this.redis.mgetJson(
      keys.map((key) => `${this.CHANNEL_CACHE_PREFIX}:${key}`),
    );
  }

  async setChannels(channels: Channel[]) {
    await this.redis.msetJson(
      channels.flatMap((channel) => [
        [`${this.CHANNEL_CACHE_PREFIX}:${channel.url}`, channel],
        [`${this.CHANNEL_CACHE_PREFIX}:${channel.channelId}`, channel],
      ]),
      86400,
    );
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

  async getUserFollowingFids(fid: string): Promise<string[]> {
    return await this.redis.getMembers(
      `${this.USER_FOLLOWING_FIDS_CACHE_PREFIX}:${fid}`,
    );
  }

  async setUserFollowingFids(fid: string, fids: string[]) {
    await this.redis.addMembers(
      `${this.USER_FOLLOWING_FIDS_CACHE_PREFIX}:${fid}`,
      fids,
      60 * 60,
    );
  }

  async addUserFollowingFid(fid: string, targetFid: string) {
    await this.redis.addMember(
      `${this.USER_FOLLOWING_FIDS_CACHE_PREFIX}:${fid}`,
      targetFid,
    );
  }

  async removeUserFollowingFid(fid: string, targetFid: string) {
    await this.redis.removeMember(
      `${this.USER_FOLLOWING_FIDS_CACHE_PREFIX}:${fid}`,
      targetFid,
    );
  }

  async addUserFollowerFid(fid: string, targetFid: string) {
    await this.redis.addMember(
      `${this.USER_FOLLOWERS_FIDS_CACHE_PREFIX}:${targetFid}`,
      fid,
    );
  }

  async removeUserFollowerFid(fid: string, targetFid: string) {
    await this.redis.removeMember(
      `${this.USER_FOLLOWERS_FIDS_CACHE_PREFIX}:${targetFid}`,
      fid,
    );
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

  async getUserPowerBadges(fids: string[]): Promise<boolean[]> {
    const result = await this.redis.mget(
      fids.map((fid) => `${this.USER_CACHE_PREFIX}:${fid}:power-badge`),
    );

    const resultMap = result.reduce((acc, value, i) => {
      let hasPowerBadge: boolean | null = null;
      if (value === "1") hasPowerBadge = true;
      if (value === "0") hasPowerBadge = false;
      if (hasPowerBadge !== null) {
        acc[fids[i]] = hasPowerBadge;
      }
      return acc;
    }, {} as { [key: string]: boolean });

    const missing = fids.filter((fid) => resultMap[fid] === undefined);
    if (missing.length > 0) {
      const powerBadges = await this.getPowerBadgeUsers();
      if (powerBadges) {
        const missingResults = missing.map((fid) => powerBadges.includes(fid));
        await this.redis.mset(
          missing.map((fid, i) => [
            `${this.USER_CACHE_PREFIX}:${fid}:power-badge`,
            missingResults[i] ? "1" : "0",
          ]),
          60 * 60 * 24,
        );
        for (const [fid, result] of missingResults.entries()) {
          resultMap[missing[fid]] = result;
        }
      }
    }

    return fids.map((fid) => resultMap[fid]);
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
