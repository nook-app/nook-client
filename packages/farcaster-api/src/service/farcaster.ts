import {
  FarcasterCast as DBFarcasterCast,
  PrismaClient,
} from "@nook/common/prisma/farcaster";
import {
  BaseFarcasterCast,
  BaseFarcasterUser,
  CastContextType,
  CastEngagementType,
  Channel,
  FarcasterCast,
  FarcasterCastContext,
  FarcasterCastEngagement,
  FarcasterCastResponse,
  FarcasterUser,
  FarcasterUserContext,
  FarcasterUserEngagement,
  GetFarcasterCastsByFidsRequest,
  GetFarcasterCastsByFollowingRequest,
  GetFarcasterCastsByParentUrlRequest,
  UserEngagementType,
} from "@nook/common/types";
import {
  getCastEmbeds,
  getEmbedUrls,
  getMentions,
} from "@nook/common/farcaster";
import { UserDataType } from "@farcaster/hub-nodejs";
import { ContentClient, FarcasterCacheClient } from "@nook/common/clients";
import { FastifyInstance } from "fastify";

export const MAX_PAGE_SIZE = 25;

export class FarcasterService {
  private client: PrismaClient;
  private cache: FarcasterCacheClient;
  private contentClient: ContentClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.farcaster.client;
    this.cache = fastify.cache.client;
    this.contentClient = new ContentClient();
  }

  async getCasts(
    hashes: string[],
    viewerFid?: string,
  ): Promise<FarcasterCastResponse[]> {
    const casts = await Promise.all(
      hashes.map((hash) => this.getCast(hash, undefined, viewerFid)),
    );
    return casts.filter(Boolean) as FarcasterCastResponse[];
  }

  async getCastReplies(
    hash: string,
    viewerFid?: string,
  ): Promise<FarcasterCastResponse[]> {
    const rawCasts = await this.client.farcasterCast.findMany({
      where: { parentHash: hash },
    });

    const casts = await Promise.all(
      rawCasts.map((rawCast) => this.getCast(rawCast.hash, rawCast, viewerFid)),
    );
    return casts.filter(Boolean) as FarcasterCastResponse[];
  }

  async getCast(
    hash: string,
    data?: DBFarcasterCast,
    viewerFid?: string,
  ): Promise<FarcasterCastResponse | undefined> {
    const rawCast = await this.getRawCast(hash, data, viewerFid);
    if (!rawCast) return;

    const fids = new Set<string>();
    fids.add(rawCast.fid);
    for (const mention of rawCast.mentions) {
      fids.add(mention.fid);
    }

    const hashes = new Set<string>();
    if (rawCast.parentHash) {
      hashes.add(rawCast.parentHash);
    }
    for (const embedHash of rawCast.embedHashes) {
      hashes.add(embedHash);
    }

    const [users, casts, embeds, channel] = await Promise.all([
      this.getUsers(Array.from(fids), viewerFid),
      this.getCasts(Array.from(hashes), viewerFid),
      this.contentClient.getContents(rawCast.embedUrls),
      rawCast.parentUrl ? this.getChannel(rawCast.parentUrl) : undefined,
    ]);

    const userMap = users.reduce(
      (acc, user) => {
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUser>,
    );

    const castMap = casts.reduce(
      (acc, cast) => {
        acc[cast.hash] = cast;
        return acc;
      },
      {} as Record<string, FarcasterCastResponse>,
    );

    return {
      ...rawCast,
      user: userMap[rawCast.fid],
      embeds: embeds.data,
      mentions: rawCast.mentions.map((mention) => ({
        user: userMap[mention.fid],
        position: mention.position,
      })),
      embedCasts: rawCast.embedHashes.map((hash) => castMap[hash]),
      parent: rawCast.parentHash ? castMap[rawCast.parentHash] : undefined,
      channel: rawCast.parentUrl ? channel : undefined,
    };
  }

  async getRawCast(
    hash: string,
    data?: DBFarcasterCast,
    viewerFid?: string,
  ): Promise<FarcasterCast | undefined> {
    const [cast, engagement, context] = await Promise.all([
      this.getCastBase(hash, data),
      this.getCastEngagement(hash),
      this.getCastContext(hash, viewerFid),
    ]);

    if (!cast) return;

    return {
      ...cast,
      engagement,
      context,
    };
  }

  async getCastBase(
    hash: string,
    data?: DBFarcasterCast,
  ): Promise<BaseFarcasterCast | undefined> {
    const cached = await this.cache.getCast(hash);
    if (cached) return cached;

    const cast =
      data ||
      (await this.client.farcasterCast.findUnique({
        where: { hash },
      }));

    if (!cast) return;

    const baseCast: BaseFarcasterCast = {
      hash: cast.hash,
      fid: cast.fid.toString(),
      timestamp: cast.timestamp.getTime(),
      text: cast.text,
      mentions: getMentions(cast),
      embedHashes: getCastEmbeds(cast).map(({ hash }) => hash),
      embedUrls: getEmbedUrls(cast),
      parentHash: cast.parentHash || undefined,
      parentUrl: cast.parentUrl || undefined,
    };

    await this.cache.setCast(hash, baseCast);

    return baseCast;
  }

  async getCastEngagement(hash: string): Promise<FarcasterCastEngagement> {
    const [likes, recasts, replies, quotes] = await Promise.all([
      this.getCastEngagementItem(hash, "likes"),
      this.getCastEngagementItem(hash, "recasts"),
      this.getCastEngagementItem(hash, "replies"),
      this.getCastEngagementItem(hash, "quotes"),
    ]);

    return { likes, recasts, replies, quotes };
  }

  async getCastEngagementItem(
    hash: string,
    type: CastEngagementType,
  ): Promise<number> {
    const cached = await this.cache.getCastEngagement(hash, type);
    if (cached) return cached;

    let count = 0;
    switch (type) {
      case "likes":
        count = await this.client.farcasterCastReaction.count({
          where: { targetHash: hash },
        });
        break;
      case "recasts":
        count = await this.client.farcasterCastReaction.count({
          where: { targetHash: hash },
        });
        break;
      case "replies":
        count = await this.client.farcasterCast.count({
          where: { parentHash: hash },
        });
        break;
      case "quotes":
        count = await this.client.farcasterCastEmbedCast.count({
          where: { embedHash: hash },
        });
        break;
    }

    await this.cache.setCastEngagement(hash, type, count);

    return count;
  }

  async getCastContext(
    hash: string,
    viewerFid?: string,
  ): Promise<FarcasterCastContext | undefined> {
    if (!viewerFid) return;

    const [liked, recasted] = await Promise.all([
      this.getCastContextItem(hash, "likes", viewerFid),
      this.getCastContextItem(hash, "recasts", viewerFid),
    ]);

    return {
      liked,
      recasted,
    };
  }

  async getCastContextItem(
    hash: string,
    type: CastContextType,
    viewerFid: string,
  ) {
    const cached = await this.cache.getCastContext(hash, type, viewerFid);
    if (cached !== undefined) return cached;

    const reaction = await this.client.farcasterCastReaction.findFirst({
      where: {
        reactionType: type === "likes" ? 1 : 2,
        fid: BigInt(viewerFid),
        targetHash: hash,
        deletedAt: null,
      },
    });

    const reacted = !!reaction;
    await this.cache.setCastContext(hash, type, viewerFid, reacted);
    return reacted;
  }

  async getUsers(fids: string[], viewerFid?: string): Promise<FarcasterUser[]> {
    const users = await Promise.all(
      fids.map((fid) => this.getUser(fid, viewerFid)),
    );
    return users.filter(Boolean) as FarcasterUser[];
  }

  async getUser(
    fid: string,
    viewerFid?: string,
  ): Promise<FarcasterUser | undefined> {
    const [user, engagement, context] = await Promise.all([
      this.getUserBase(fid),
      this.getUserEngagement(fid),
      this.getUserContext(fid, viewerFid),
    ]);

    if (!user) return;

    return {
      ...user,
      engagement,
      context,
    };
  }

  async getUserBase(fid: string): Promise<BaseFarcasterUser | undefined> {
    const cached = await this.cache.getUser(fid);
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

    await this.cache.setUser(fid, baseUser);

    return baseUser;
  }

  async getUserEngagement(fid: string): Promise<FarcasterUserEngagement> {
    const [followers, following] = await Promise.all([
      this.getUserEngagementItem(fid, "followers"),
      this.getUserEngagementItem(fid, "following"),
    ]);

    return { followers, following };
  }

  async getUserEngagementItem(
    fid: string,
    type: UserEngagementType,
  ): Promise<number> {
    const cached = await this.cache.getUserEngagement(fid, type);
    if (cached) return cached;

    let count = 0;
    switch (type) {
      case "followers":
        count = await this.client.farcasterLink.count({
          where: { linkType: "follow", targetFid: BigInt(fid) },
        });
        break;
      case "following":
        count = await this.client.farcasterLink.count({
          where: { linkType: "follow", fid: BigInt(fid) },
        });
        break;
    }

    await this.cache.setUserEngagement(fid, type, count);

    return count;
  }

  async getUserContext(
    fid: string,
    viewerFid?: string,
  ): Promise<FarcasterUserContext | undefined> {
    if (!viewerFid) return;

    const cached = await this.cache.getUserContext(viewerFid, "following", fid);
    if (cached) return { following: true };

    const link = await this.client.farcasterLink.findFirst({
      where: {
        linkType: "follow",
        fid: BigInt(viewerFid),
        targetFid: BigInt(fid),
      },
    });

    const linked = !!link;
    await this.cache.setUserContext(viewerFid, "following", fid, linked);
    return { following: linked };
  }

  async getCastsByParentUrl(
    request: GetFarcasterCastsByParentUrlRequest,
    viewerFid?: string,
  ) {
    const minTimestamp = request.minCursor
      ? new Date(request.minCursor)
      : undefined;

    const maxTimestamp = request.maxCursor
      ? new Date(request.maxCursor)
      : undefined;

    const rawCasts = await this.client.farcasterCast.findMany({
      where: {
        parentUrl: request.parentUrl,
        timestamp: {
          lt: maxTimestamp,
          gt: minTimestamp,
        },
        parentHash:
          request.replies === true
            ? { not: null }
            : request.replies === false
              ? null
              : undefined,
        deletedAt: null,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: request.limit || MAX_PAGE_SIZE,
    });

    const casts = await Promise.all(
      rawCasts.map((rawCast) => this.getCast(rawCast.hash, rawCast, viewerFid)),
    );
    return casts.filter(Boolean) as FarcasterCastResponse[];
  }

  async getCastsByFids(
    request: GetFarcasterCastsByFidsRequest,
    viewerFid?: string,
  ) {
    const minTimestamp = request.minCursor
      ? new Date(request.minCursor)
      : undefined;

    const maxTimestamp = request.maxCursor
      ? new Date(request.maxCursor)
      : undefined;

    const rawCasts = await this.client.farcasterCast.findMany({
      where: {
        fid: {
          in: request.fids.map((fid) => BigInt(fid)),
        },
        timestamp: {
          lt: maxTimestamp,
          gt: minTimestamp,
        },
        parentHash:
          request.replies === true
            ? { not: null }
            : request.replies === false
              ? null
              : undefined,
        deletedAt: null,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: request.limit || MAX_PAGE_SIZE,
    });

    const casts = await Promise.all(
      rawCasts.map((rawCast) => this.getCast(rawCast.hash, rawCast, viewerFid)),
    );
    return casts.filter(Boolean) as FarcasterCastResponse[];
  }

  async getCastsByFollowing(
    request: GetFarcasterCastsByFollowingRequest,
    viewerFid?: string,
  ) {
    const following = await this.client.farcasterLink.findMany({
      where: {
        linkType: "follow",
        fid: BigInt(request.fid),
        deletedAt: null,
      },
    });

    return await this.getCastsByFids(
      {
        fids: following.map((link) => link.targetFid.toString()),
        minCursor: request.minCursor,
        maxCursor: request.maxCursor,
        limit: request.limit,
        replies: request.replies,
      },
      viewerFid,
    );
  }

  async searchChannels(query: string) {
    const channels = await this.client.farcasterParentUrl.findMany({
      where: {
        url: {
          contains: query,
          mode: "insensitive",
        },
      },
    });
    return channels;
  }

  async getChannels(urls: string[]) {
    const channels = await Promise.all(urls.map((url) => this.getChannel(url)));
    return channels.filter(Boolean) as Channel[];
  }

  async getChannel(url: string): Promise<Channel | undefined> {
    const cached = await this.cache.getChannel(url);
    if (cached) return cached;

    const existingChannel = await this.client.farcasterParentUrl.findUnique({
      where: { url },
    });
    if (existingChannel) {
      const channel: Channel = {
        ...existingChannel,
        creatorId: existingChannel.creatorId?.toString(),
      };
      await this.cache.setChannel(url, channel);
      return channel;
    }

    const channel = await this.fetchChannel(url);
    if (!channel) return;

    await this.cache.setChannel(url, channel);
    return channel;
  }

  async fetchChannel(url: string) {
    const response = await fetch("https://api.warpcast.com/v2/all-channels");
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const channels: {
      id: string;
      url: string;
      name: string;
      description: string;
      imageUrl: string;
      leadFid: number;
      createdAt: number;
    }[] = data?.result?.channels;
    if (!channels) {
      return;
    }

    const channelData = channels.find((channel) => channel.url === url);
    if (!channelData) {
      return;
    }

    const channel: Channel = {
      url,
      channelId: channelData.id,
      name: channelData.name,
      description: channelData.description,
      imageUrl: channelData.imageUrl,
      createdAt: new Date(channelData.createdAt * 1000),
      updatedAt: new Date(),
      creatorId: channelData.leadFid.toString(),
    };

    await this.client.farcasterParentUrl.upsert({
      where: {
        url,
      },
      update: channel,
      create: channel,
    });

    return channel;
  }
}
