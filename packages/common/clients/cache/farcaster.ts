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

export class FarcasterCacheClient extends RedisClient {
  CAST_CACHE_PREFIX = "farcaster:cast";
  USER_CACHE_PREFIX = "farcaster:user";
  CHANNEL_CACHE_PREFIX = "farcaster:channel";

  async getCast(hash: string): Promise<BaseFarcasterCast> {
    return await this.getJson(`${this.CAST_CACHE_PREFIX}:${hash}`);
  }

  async setCast(hash: string, cast: BaseFarcasterCast) {
    await this.setJson(`${this.CAST_CACHE_PREFIX}:${hash}`, cast);
  }

  async getCastEngagement(
    hash: string,
    type: CastEngagementType,
  ): Promise<number> {
    return await this.getNumber(`${this.CAST_CACHE_PREFIX}:${hash}:${type}`);
  }

  async setCastEngagement(
    hash: string,
    type: CastEngagementType,
    value: number,
  ) {
    await this.setNumber(`${this.CAST_CACHE_PREFIX}:${hash}:${type}`, value);
  }

  async getCastContext(
    hash: string,
    type: CastContextType,
    fid: string,
  ): Promise<boolean | undefined> {
    const result = await this.get(
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
    await this.set(
      `${this.CAST_CACHE_PREFIX}:${hash}:${type}:${fid}`,
      value ? "1" : "0",
    );
  }

  async getUser(fid: string): Promise<BaseFarcasterUser> {
    return await this.getJson(`${this.USER_CACHE_PREFIX}:${fid}`);
  }

  async setUser(fid: string, user: BaseFarcasterUser) {
    await this.setJson(`${this.USER_CACHE_PREFIX}:${fid}`, user);
  }

  async getUserEngagement(
    fid: string,
    type: UserEngagementType,
  ): Promise<number> {
    return await this.getNumber(`${this.USER_CACHE_PREFIX}:${fid}:${type}`);
  }

  async setUserEngagement(
    fid: string,
    type: UserEngagementType,
    value: number,
  ) {
    await this.setNumber(`${this.USER_CACHE_PREFIX}:${fid}:${type}`, value);
  }

  async getUserContext(
    fid: string,
    type: UserContextType,
    targetFid: string,
  ): Promise<boolean | undefined> {
    const result = await this.get(
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
    await this.set(
      `${this.USER_CACHE_PREFIX}:${fid}:${type}:${targetFid}`,
      value ? "1" : "0",
    );
  }

  async incrementCastEngagement(hash: string, type: CastEngagementType) {
    const key = `${this.CAST_CACHE_PREFIX}:${hash}:${type}`;
    if (await this.exists(key)) {
      await this.increment(key);
    }
  }

  async decrementCastEngagement(hash: string, type: CastEngagementType) {
    const key = `${this.CAST_CACHE_PREFIX}:${hash}:${type}`;
    if (await this.exists(key)) {
      await this.decrement(key);
    }
  }

  async incrementUserEngagement(fid: string, type: UserEngagementType) {
    const key = `${this.USER_CACHE_PREFIX}:${fid}:${type}`;
    if (await this.exists(key)) {
      await this.increment(key);
    }
  }

  async decrementUserEngagement(fid: string, type: UserEngagementType) {
    const key = `${this.USER_CACHE_PREFIX}:${fid}:${type}`;
    if (await this.exists(key)) {
      await this.decrement(key);
    }
  }

  async getChannel(url: string): Promise<Channel | undefined> {
    return await this.getJson(`${this.CHANNEL_CACHE_PREFIX}:${url}`);
  }

  async setChannel(url: string, channel: Channel) {
    await this.setJson(`${this.CHANNEL_CACHE_PREFIX}:${url}`, channel);
  }

  async getChannelById(id: string): Promise<Channel | undefined> {
    return await this.getJson(`${this.CHANNEL_CACHE_PREFIX}:${id}`);
  }

  async setChannelById(id: string, channel: Channel) {
    await this.setJson(`${this.CHANNEL_CACHE_PREFIX}:${id}`, channel);
  }
}
