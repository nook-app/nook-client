import { RedisClient } from "./base";
import {
  BaseFarcasterCast,
  BaseFarcasterCastV1,
  BaseFarcasterUser,
  BaseFarcasterUserV1,
  CastContextType,
  CastEngagementType,
  Channel,
  FarcasterCastContext,
  FarcasterCastEngagement,
  FarcasterCastRelationsV1,
  FarcasterUserContext,
  FarcasterUserEngagement,
  FarcasterUserMutualsPreview,
  UserContextType,
  UserEngagementType,
} from "../../types";

export class FarcasterCacheClient {
  private redis: RedisClient;

  CAST_V1_CACHE_PREFIX = "farcaster:cast:v1";
  USER_V1_CACHE_PREFIX = "farcaster:user:v1";
  SIGNER_V1_CACHE_PREFIX = "farcaster:signer:v1";
  CAST_RELATIONS_V1_CACHE_PREFIX = "farcaster:cast-relations:v1";

  CAST_CACHE_PREFIX = "farcaster:cast";
  USER_CACHE_PREFIX = "farcaster:user";
  CHANNEL_CACHE_PREFIX = "farcaster:channel";
  CLIENT_CACHE_PREFIX = "farcaster:client";
  POWER_BADGE_CACHE_PREFIX = "warpcast:power-badge";
  USER_FOLLOWING_FIDS_CACHE_PREFIX = "farcaster:user:following:fids";
  USER_FOLLOWERS_FIDS_CACHE_PREFIX = "farcaster:user:followers:fids";
  CAST_REPLIES_CACHE_PREFIX = "farcaster:cast:replies";
  CAST_REPLIES_NEW_CACHE_PREFIX = "farcaster:cast:replies:new";
  CAST_REPLIES_TOP_CACHE_PREFIX = "farcaster:cast:replies:top";
  CAST_ENGAGEMENT_CACHE_PREFIX = "farcaster:cast:engagement";
  CAST_CONTEXT_CACHE_PREFIX = "farcaster:cast:context";
  USER_ENGAGEMENT_CACHE_PREFIX = "farcaster:user:engagement";
  USER_CONTEXT_CACHE_PREFIX = "farcaster:user:context";
  APP_CACHE_PREFIX = "feed:farcaster";

  TTL = 24 * 60 * 60 * 3;
  TTL_V1 = 24 * 60 * 60 * 1;

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async getCastRelationsV1(
    hash: string,
  ): Promise<FarcasterCastRelationsV1 | undefined> {
    return await this.redis.getJson(
      `${this.CAST_RELATIONS_V1_CACHE_PREFIX}:${hash}`,
    );
  }

  async setCastRelationsV1(hash: string, relations: FarcasterCastRelationsV1) {
    await this.redis.setJson(
      `${this.CAST_RELATIONS_V1_CACHE_PREFIX}:${hash}`,
      relations,
      this.TTL,
    );
  }

  async getCastsV1(
    hashes: string[],
  ): Promise<(BaseFarcasterCastV1 | undefined)[]> {
    return await this.redis.mgetJson(
      hashes.map((hash) => `${this.CAST_V1_CACHE_PREFIX}:${hash}`),
    );
  }

  async setCastsV1(casts: BaseFarcasterCastV1[]) {
    await this.redis.msetJson(
      casts.map((cast) => [`${this.CAST_V1_CACHE_PREFIX}:${cast.hash}`, cast]),
      this.TTL_V1,
    );
  }

  async getUsersV1(
    fids: string[],
  ): Promise<(BaseFarcasterUserV1 | undefined)[]> {
    return await this.redis.mgetJson(
      fids.map((fid) => `${this.USER_V1_CACHE_PREFIX}:${fid}`),
    );
  }

  async getUsersByUsernameV1(
    usernames: string[],
  ): Promise<(BaseFarcasterUserV1 | undefined)[]> {
    return await this.redis.mgetJson(
      usernames.map(
        (username) => `${this.USER_V1_CACHE_PREFIX}:username:${username}`,
      ),
    );
  }

  async setUsersV1(users: BaseFarcasterUserV1[]) {
    await this.redis.msetJson(
      users.flatMap((user) => {
        const pairs = [[`${this.USER_V1_CACHE_PREFIX}:${user.fid}`, user]] as [
          string,
          BaseFarcasterUserV1,
        ][];
        if (user.username) {
          pairs.push([
            `${this.USER_V1_CACHE_PREFIX}:username:${user.username}`,
            user,
          ]);
        }
        return pairs;
      }),
      this.TTL_V1,
    );
  }

  async getAppFidsV1(signers: string[]): Promise<(string | null)[]> {
    return await this.redis.mget(
      signers.map((signer) => `${this.SIGNER_V1_CACHE_PREFIX}:${signer}`),
    );
  }

  async setAppFidsV1(pairs: [string, string][]) {
    await this.redis.mset(
      pairs.map(([signer, fid]) => [
        `${this.SIGNER_V1_CACHE_PREFIX}:${signer}`,
        fid,
      ]),
      this.TTL_V1,
    );
  }

  async getUserContext(
    viewerFid: string,
    fids: string[],
  ): Promise<(FarcasterUserContext | undefined)[]> {
    return await this.redis.mgetJson(
      fids.map(
        (fid) => `${this.USER_CONTEXT_CACHE_PREFIX}:${fid}:${viewerFid}`,
      ),
    );
  }

  async setUserContext(
    viewerFid: string,
    data: [string, FarcasterUserContext][],
  ) {
    await this.redis.msetJson(
      data.map(([fid, context]) => [
        `${this.USER_CONTEXT_CACHE_PREFIX}:${fid}:${viewerFid}`,
        context,
      ]),
      this.TTL_V1,
    );
  }

  async updateUserContext(
    fid: string,
    viewerFid: string,
    type: UserContextType,
    value: boolean,
  ) {
    const key = `${this.USER_CONTEXT_CACHE_PREFIX}:${fid}:${viewerFid}`;
    const data = (await this.redis.getJson(key)) as
      | FarcasterUserContext
      | undefined;
    if (!data) return;

    if (type === "following") {
      data.following = value;
    }

    if (type === "followers") {
      data.followers = value;
    }

    await this.redis.setJson(key, data, this.TTL_V1);
  }

  async getCastContext(
    viewerFid: string,
    hashes: string[],
  ): Promise<(FarcasterCastContext | undefined)[]> {
    return await this.redis.mgetJson(
      hashes.map(
        (hash) => `${this.CAST_CONTEXT_CACHE_PREFIX}:${hash}:${viewerFid}`,
      ),
    );
  }

  async setCastContext(
    viewerFid: string,
    data: [string, FarcasterCastContext][],
  ) {
    await this.redis.msetJson(
      data.map(([hash, context]) => [
        `${this.CAST_CONTEXT_CACHE_PREFIX}:${hash}:${viewerFid}`,
        context,
      ]),
      this.TTL_V1,
    );
  }

  async updateCastContext(
    viewerFid: string,
    hash: string,
    type: CastContextType,
    value: boolean,
  ) {
    const key = `${this.CAST_CONTEXT_CACHE_PREFIX}:${hash}:${viewerFid}`;
    const data = (await this.redis.getJson(key)) as
      | FarcasterCastContext
      | undefined;
    if (!data) return;

    if (type === "likes") {
      data.liked = value;
    }
    if (type === "recasts") {
      data.recasted = value;
    }

    await this.redis.setJson(key, data, this.TTL_V1);
  }

  async updateCastEngagementV1(
    hash: string,
    type: CastEngagementType,
    value: number,
  ) {
    const cast = (await this.redis.getJson(
      `${this.CAST_V1_CACHE_PREFIX}:${hash}`,
    )) as BaseFarcasterCastV1 | undefined;
    if (!cast) return;
    await this.redis.setJson(
      `${this.CAST_V1_CACHE_PREFIX}:${hash}`,
      {
        ...cast,
        engagement: {
          ...cast.engagement,
          [type]: cast.engagement[type] + value,
        },
      },
      this.TTL_V1,
    );
  }

  async updateUserEngagementV1(
    fid: string,
    type: UserEngagementType,
    value: number,
  ) {
    const user = (await this.redis.getJson(
      `${this.USER_V1_CACHE_PREFIX}:${fid}`,
    )) as BaseFarcasterUserV1 | undefined;
    if (!user) return;
    await this.redis.setJson(
      `${this.USER_V1_CACHE_PREFIX}:${fid}`,
      {
        ...user,
        engagement: {
          ...user.engagement,
          [type]: user.engagement[type] + value,
        },
      },
      this.TTL_V1,
    );
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
    await this.redis.setJson(
      `${this.CAST_CACHE_PREFIX}:${hash}`,
      cast,
      this.TTL,
    );
  }

  async setCasts(casts: BaseFarcasterCast[]) {
    await this.redis.msetJson(
      casts.map((cast) => [`${this.CAST_CACHE_PREFIX}:${cast.hash}`, cast]),
      this.TTL,
    );
  }

  async removeCast(hash: string) {
    await this.redis.del(`${this.CAST_CACHE_PREFIX}:${hash}`);
  }

  async getCastEngagement(
    hashes: string[],
  ): Promise<(FarcasterCastEngagement | undefined)[]> {
    return await this.redis.mgetJson(
      hashes.map((hash) => `${this.CAST_ENGAGEMENT_CACHE_PREFIX}:${hash}`),
    );
  }

  async setCastEngagement(
    data: (FarcasterCastEngagement & { hash: string })[],
  ) {
    await this.redis.msetJson(
      data.map((engagement) => [
        `${this.CAST_ENGAGEMENT_CACHE_PREFIX}:${engagement.hash}`,
        engagement,
      ]),
      this.TTL,
    );
  }

  async updateCastEngagement(
    hash: string,
    type: CastEngagementType,
    value: number,
  ) {
    const key = `${this.CAST_ENGAGEMENT_CACHE_PREFIX}:${hash}`;
    const data = (await this.redis.getJson(key)) as
      | FarcasterCastEngagement
      | undefined;
    if (!data) return;

    if (type === "likes") {
      data.likes += value;
    }
    if (type === "recasts") {
      data.recasts += value;
    }
    if (type === "replies") {
      data.replies += value;
    }
    if (type === "quotes") {
      data.quotes += value;
    }

    await this.redis.setJson(key, data, this.TTL);
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
    await this.redis.setJson(
      `${this.USER_CACHE_PREFIX}:${fid}`,
      user,
      this.TTL,
    );
  }

  async setUsers(users: BaseFarcasterUser[]) {
    await this.redis.msetJson(
      users.map((user) => [`${this.USER_CACHE_PREFIX}:${user.fid}`, user]),
      this.TTL,
    );
  }

  async getUserEngagement(
    fids: string[],
  ): Promise<(FarcasterUserEngagement | undefined)[]> {
    return await this.redis.mgetJson(
      fids.map((fid) => `${this.USER_ENGAGEMENT_CACHE_PREFIX}:${fid}`),
    );
  }

  async setUserEngagement(data: (FarcasterUserEngagement & { fid: string })[]) {
    await this.redis.msetJson(
      data.map((engagement) => [
        `${this.USER_ENGAGEMENT_CACHE_PREFIX}:${engagement.fid}`,
        engagement,
      ]),
      this.TTL,
    );
  }

  async deleteUserEngagement(fid: string) {
    await this.redis.del(`${this.USER_ENGAGEMENT_CACHE_PREFIX}:${fid}`);
  }

  async updateUserEngagement(
    fid: string,
    type: UserEngagementType,
    value: number,
  ) {
    const key = `${this.USER_ENGAGEMENT_CACHE_PREFIX}:${fid}`;
    const data = (await this.redis.getJson(key)) as
      | FarcasterUserEngagement
      | undefined;
    if (!data) return;

    if (type === "followers") {
      data.followers += value;
    }
    if (type === "following") {
      data.following += value;
    }

    await this.redis.setJson(key, data, this.TTL);
  }

  async resetUserContext(fid: string, viewerFid: string) {
    await this.redis.del(
      `${this.USER_CONTEXT_CACHE_PREFIX}:${fid}:${viewerFid}`,
    );
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
      this.TTL,
    );
  }

  async setNotChannels(keys: string[]) {
    await this.redis.msetJson(
      keys.map((key) => [
        `${this.CHANNEL_CACHE_PREFIX}:${key}`,
        { channelId: key },
      ]),
      this.TTL,
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
    await this.redis.set(
      `${this.CLIENT_CACHE_PREFIX}:${pubkey}`,
      user,
      this.TTL,
    );
  }

  async removeAppFidBySigner(pubkey: string) {
    await this.redis.del(`${this.CLIENT_CACHE_PREFIX}:${pubkey}`);
  }

  async getMutualPreview(
    fid: string,
    targetFid: string,
  ): Promise<FarcasterUserMutualsPreview> {
    return await this.redis.getJson(
      `${this.USER_CACHE_PREFIX}:mutuals-preview:${fid}:${targetFid}`,
    );
  }

  async setMutualPreview(
    fid: string,
    targetFid: string,
    preview: FarcasterUserMutualsPreview,
  ) {
    await this.redis.setJson(
      `${this.USER_CACHE_PREFIX}:mutuals-preview:${fid}:${targetFid}`,
      preview,
      60 * 60 * 3,
    );
  }

  async getMutualFids(fid: string, targetFid: string): Promise<string[]> {
    return await this.redis.getMembers(
      `${this.USER_CACHE_PREFIX}:mutuals:${fid}:${targetFid}`,
    );
  }

  async setMutualFids(fid: string, targetFid: string, mutuals: string[]) {
    await this.redis.addMembers(
      `${this.USER_CACHE_PREFIX}:mutuals:${fid}:${targetFid}`,
      mutuals,
      this.TTL,
    );
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

  async deleteUserFollowingFids(fid: string) {
    await this.redis.del(`${this.USER_FOLLOWING_FIDS_CACHE_PREFIX}:${fid}`);
  }

  async getUserFollowersFids(fid: string): Promise<string[]> {
    return await this.redis.getMembers(
      `${this.USER_FOLLOWERS_FIDS_CACHE_PREFIX}:${fid}`,
    );
  }

  async setUserFollowersFids(fid: string, fids: string[]) {
    await this.redis.addMembers(
      `${this.USER_FOLLOWERS_FIDS_CACHE_PREFIX}:${fid}`,
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
      this.TTL,
    );
  }

  async getCastThread(hash: string): Promise<string[]> {
    return await this.redis.getJson(`${this.CAST_CACHE_PREFIX}:${hash}:thread`);
  }

  async resetCastThread(hash: string) {
    await this.redis.del(`${this.CAST_CACHE_PREFIX}:${hash}:thread`);
  }

  async addCastReplies(
    hash: string,
    replies: { hash: string; score: number }[],
    type: "new" | "top" | "best",
  ) {
    await this.redis.batchAddToSet(
      `${this.getCastReplyPrefix(type)}:${hash}`,
      replies.map(({ hash, score }) => ({ value: hash, score })),
      this.TTL,
    );
  }

  async getCastReplies(
    hash: string,
    type: "new" | "top" | "best",
  ): Promise<{ hash: string; score: number }[]> {
    const data = await this.redis.getAllSetData(
      `${this.getCastReplyPrefix(type)}:${hash}`,
    );
    return data.map((item) => ({
      hash: item.value,
      score: item.score,
    }));
  }

  async updateCastReplyScore(
    hash: string,
    parentHash: string,
    adjustment: number,
    type: "new" | "top" | "best",
  ) {
    const exists = await this.redis.exists(
      `${this.getCastReplyPrefix(type)}:${parentHash}`,
    );
    if (!exists) return;
    await this.redis.incrementScore(
      `${this.getCastReplyPrefix(type)}:${parentHash}`,
      hash,
      adjustment,
    );
  }

  async removeCastReply(
    hash: string,
    parentHash: string,
    type: "new" | "top" | "best",
  ) {
    await this.redis.removeFromSet(
      `${this.getCastReplyPrefix(type)}:${parentHash}`,
      hash,
    );
  }

  getCastReplyPrefix(type: "new" | "top" | "best") {
    if (type === "new") return this.CAST_REPLIES_NEW_CACHE_PREFIX;
    if (type === "top") return this.CAST_REPLIES_TOP_CACHE_PREFIX;
    return this.CAST_REPLIES_CACHE_PREFIX;
  }

  async getFidsForUsernames(usernames: string[]): Promise<(string | null)[]> {
    return await this.redis.mget(
      usernames.map((username) => `farcaster:username:${username}`),
    );
  }

  async setFidsForUsernames(usernames: string[], fids: string[]) {
    await this.redis.mset(
      usernames.map((username, i) => [
        `farcaster:username:${username}`,
        fids[i],
      ]),
      this.TTL,
    );
  }
}
