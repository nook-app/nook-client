import { PrismaClient } from "@nook/common/prisma/farcaster";
import { RedisClient } from "@nook/common/redis";
import {
  BaseFarcasterUser,
  BaseFarcasterUserWithEngagement,
} from "@nook/common/types";
import { UserDataType } from "@farcaster/hub-nodejs";

export const MAX_PAGE_SIZE = 25;

export class UserService {
  private client: PrismaClient;
  private redis: RedisClient;

  USER_CACHE_PREFIX = "farcaster:user";

  constructor(client: PrismaClient, redis: RedisClient) {
    this.client = client;
    this.redis = redis;
  }

  async getUsers(fids: string[]): Promise<BaseFarcasterUserWithEngagement[]> {
    const users = await Promise.all(fids.map((fid) => this.getUser(fid)));
    return users.filter(Boolean) as BaseFarcasterUserWithEngagement[];
  }

  async getUser(
    fid: string,
  ): Promise<BaseFarcasterUserWithEngagement | undefined> {
    const [user, stats] = await Promise.all([
      this.getUserData(fid),
      this.getUserStats(fid),
    ]);

    if (!user) return;

    return {
      ...user,
      engagement: {
        following: stats.following,
        followers: stats.followers,
      },
    };
  }

  async getUserData(fid: string): Promise<BaseFarcasterUser> {
    const cached = await this.getCachedUser(fid);
    if (cached) return cached;

    const userData = await this.client.farcasterUserData.findMany({
      where: { fid: BigInt(fid) },
    });
    if (!userData) {
      throw new Error(`Could not find user data for fid ${fid}`);
    }

    const username = userData.find((d) => d.type === UserDataType.USERNAME);
    const pfp = userData.find((d) => d.type === UserDataType.PFP);
    const displayName = userData.find((d) => d.type === UserDataType.DISPLAY);
    const bio = userData.find((d) => d.type === UserDataType.BIO);
    const url = userData.find((d) => d.type === UserDataType.URL);

    const baseUser: BaseFarcasterUser = {
      fid,
      username: username?.value,
      pfp: pfp?.value,
      displayName: displayName?.value,
      bio: bio?.value,
      url: url?.value,
    };

    await this.setCachedUser(fid, baseUser);
    return baseUser;
  }

  async setCachedUser(fid: string, user: BaseFarcasterUser) {
    await this.redis.setJson(`${this.USER_CACHE_PREFIX}:${fid}`, user);
  }

  async getCachedUser(fid: string) {
    return await this.redis.getJson(`${this.USER_CACHE_PREFIX}:${fid}`);
  }

  async getUserStats(fid: string) {
    const [cachedFollowing, cachedFollowers] = await Promise.all([
      this.redis.getJson(`${this.USER_CACHE_PREFIX}:${fid}:following`),
      this.redis.getJson(`${this.USER_CACHE_PREFIX}:${fid}:followers`),
    ]);

    if (cachedFollowing && cachedFollowers) {
      return {
        following: cachedFollowing,
        followers: cachedFollowers,
      };
    }

    const stats = await this.client.farcasterUserStats.findUnique({
      where: { fid: BigInt(fid) },
    });

    if (stats) {
      await Promise.all([
        this.redis.setNumber(
          `${this.USER_CACHE_PREFIX}:${fid}:following`,
          stats.following,
        ),
        this.redis.setNumber(
          `${this.USER_CACHE_PREFIX}:${fid}:followers`,
          stats.followers,
        ),
      ]);
      return {
        following: stats.following,
        followers: stats.followers,
      };
    }

    const [following, followers] = await Promise.all([
      this.client.farcasterLink.count({
        where: { linkType: "follow", fid: BigInt(fid) },
      }),
      this.client.farcasterLink.count({
        where: { linkType: "follow", targetFid: BigInt(fid) },
      }),
    ]);

    await Promise.all([
      this.client.farcasterUserStats.create({
        data: {
          fid: BigInt(fid),
          following,
          followers,
        },
      }),
      this.redis.setNumber(
        `${this.USER_CACHE_PREFIX}:${fid}:following`,
        following,
      ),
      this.redis.setNumber(
        `${this.USER_CACHE_PREFIX}:${fid}:followers`,
        followers,
      ),
    ]);

    return {
      following,
      followers,
    };
  }

  async getFollowers(fid: string) {
    return await this.client.farcasterLink.findMany({
      where: { linkType: "follow", targetFid: BigInt(fid) },
    });
  }

  async incrementFollowing(fid: string) {
    await this.client.farcasterUserStats.update({
      where: { fid: BigInt(fid) },
      data: { following: { increment: 1 } },
    });
    const key = `${this.USER_CACHE_PREFIX}:${fid}:following`;
    if (await this.redis.exists(key)) {
      await this.redis.increment(key);
    }
  }

  async incrementFollowers(fid: string) {
    await this.client.farcasterUserStats.update({
      where: { fid: BigInt(fid) },
      data: { followers: { increment: 1 } },
    });
    const key = `${this.USER_CACHE_PREFIX}:${fid}:followers`;
    if (await this.redis.exists(key)) {
      await this.redis.increment(key);
    }
  }

  async decrementFollowing(fid: string) {
    await this.client.farcasterUserStats.update({
      where: { fid: BigInt(fid) },
      data: { following: { decrement: 1 } },
    });
    const key = `${this.USER_CACHE_PREFIX}:${fid}:following`;
    if (await this.redis.exists(key)) {
      await this.redis.decrement(key);
    }
  }

  async decrementFollowers(fid: string) {
    await this.client.farcasterUserStats.update({
      where: { fid: BigInt(fid) },
      data: { followers: { decrement: 1 } },
    });
    const key = `${this.USER_CACHE_PREFIX}:${fid}:followers`;
    if (await this.redis.exists(key)) {
      await this.redis.decrement(key);
    }
  }
}
