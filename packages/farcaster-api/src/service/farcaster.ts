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
  GetFarcasterCastsByChannelRequest,
  UserEngagementType,
  GetFarcasterCastsResponse,
  GetFarcasterUsersResponse,
  UrlContentResponse,
} from "@nook/common/types";
import {
  getCastEmbeds,
  getEmbedUrls,
  getMentions,
} from "@nook/common/farcaster";
import { UserDataType } from "@farcaster/hub-nodejs";
import { ContentAPIClient, FarcasterCacheClient } from "@nook/common/clients";
import { FastifyInstance } from "fastify";

export const MAX_PAGE_SIZE = 25;

export class FarcasterService {
  private client: PrismaClient;
  private cache: FarcasterCacheClient;
  private contentClient: ContentAPIClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.farcaster.client;
    this.cache = new FarcasterCacheClient(fastify.redis.client);
    this.contentClient = new ContentAPIClient();
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
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    const rawCasts = await this.client.farcasterCast.findMany({
      where: {
        timestamp: this.decodeCursor(cursor),
        parentHash: hash,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: MAX_PAGE_SIZE,
    });

    const casts = (
      await Promise.all(
        rawCasts.map((rawCast) =>
          this.getCast(rawCast.hash, rawCast, viewerFid),
        ),
      )
    ).filter(Boolean) as FarcasterCastResponse[];

    return {
      data: casts,
      nextCursor:
        casts.length === MAX_PAGE_SIZE
          ? this.encodeCursor({
              timestamp: casts[casts.length - 1]?.timestamp,
            })
          : undefined,
    };
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
      embeds: embeds.data.filter(Boolean) as UrlContentResponse[],
      mentions: rawCast.mentions.map((mention) => ({
        user: userMap[mention.fid],
        position: mention.position,
      })),
      embedCasts: rawCast.embedHashes
        .map((hash) => castMap[hash])
        .filter(Boolean),
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
      (await this.client.farcasterCast.findFirst({
        where: { hash, deletedAt: null },
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
          where: { targetHash: hash, reactionType: 1, deletedAt: null },
        });
        break;
      case "recasts":
        count = await this.client.farcasterCastReaction.count({
          where: { targetHash: hash, reactionType: 2, deletedAt: null },
        });
        break;
      case "replies":
        count = await this.client.farcasterCast.count({
          where: { parentHash: hash, deletedAt: null },
        });
        break;
      case "quotes":
        count = await this.client.farcasterCastEmbedCast.count({
          where: { embedHash: hash, deletedAt: null },
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

  async getCastLikes(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterUsersResponse> {
    const likes = await this.client.farcasterCastReaction.findMany({
      where: {
        targetHash: hash,
        reactionType: 1,
        timestamp: this.decodeCursor(cursor),
        deletedAt: null,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: MAX_PAGE_SIZE,
    });

    const fids = likes.map((reaction) => reaction.fid.toString());
    const users = await this.getUsers(fids, viewerFid);

    return {
      data: users,
      nextCursor:
        likes.length === MAX_PAGE_SIZE
          ? this.encodeCursor({
              timestamp: likes[likes.length - 1]?.timestamp.getTime(),
            })
          : undefined,
    };
  }

  async getCastRecasts(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterUsersResponse> {
    const recasts = await this.client.farcasterCastReaction.findMany({
      where: {
        targetHash: hash,
        reactionType: 2,
        timestamp: this.decodeCursor(cursor),
        deletedAt: null,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: MAX_PAGE_SIZE,
    });

    const fids = recasts.map((reaction) => reaction.fid.toString());
    const users = await this.getUsers(fids, viewerFid);

    return {
      data: users,
      nextCursor:
        recasts.length === MAX_PAGE_SIZE
          ? this.encodeCursor({
              timestamp: recasts[recasts.length - 1]?.timestamp.getTime(),
            })
          : undefined,
    };
  }

  async getCastQuotes(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    const rawCasts = await this.client.farcasterCastEmbedCast.findMany({
      where: {
        embedHash: hash,
        timestamp: this.decodeCursor(cursor),
        deletedAt: null,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: MAX_PAGE_SIZE,
    });

    const casts = (
      await Promise.all(
        rawCasts.map((rawCast) =>
          this.getCast(rawCast.hash, undefined, viewerFid),
        ),
      )
    ).filter(Boolean) as FarcasterCastResponse[];

    return {
      data: casts,
      nextCursor:
        casts.length === MAX_PAGE_SIZE
          ? this.encodeCursor({
              timestamp: casts[casts.length - 1]?.timestamp,
            })
          : undefined,
    };
  }

  async getUserFollowers(
    fid: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterUsersResponse> {
    const followers = await this.client.farcasterLink.findMany({
      where: {
        timestamp: this.decodeCursor(cursor),
        linkType: "follow",
        targetFid: BigInt(fid),
        deletedAt: null,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: MAX_PAGE_SIZE,
    });

    const fids = followers.map((link) => link.fid.toString());
    const users = await this.getUsers(fids, viewerFid);

    return {
      data: users,
      nextCursor:
        followers.length === MAX_PAGE_SIZE
          ? this.encodeCursor({
              timestamp: followers[followers.length - 1]?.timestamp.getTime(),
            })
          : undefined,
    };
  }

  async getUserFollowing(
    fid: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterUsersResponse> {
    const following = await this.client.farcasterLink.findMany({
      where: {
        timestamp: this.decodeCursor(cursor),
        linkType: "follow",
        fid: BigInt(fid),
        deletedAt: null,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: MAX_PAGE_SIZE,
    });

    const fids = following.map((link) => link.targetFid.toString());
    const users = await this.getUsers(fids, viewerFid);

    return {
      data: users,
      nextCursor:
        following.length === MAX_PAGE_SIZE
          ? this.encodeCursor({
              timestamp: following[following.length - 1]?.timestamp.getTime(),
            })
          : undefined,
    };
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
          where: {
            linkType: "follow",
            targetFid: BigInt(fid),
            deletedAt: null,
          },
        });
        break;
      case "following":
        count = await this.client.farcasterLink.count({
          where: { linkType: "follow", fid: BigInt(fid), deletedAt: null },
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
        deletedAt: null,
      },
    });

    const linked = !!link;
    await this.cache.setUserContext(viewerFid, "following", fid, linked);
    return { following: linked };
  }

  async getCastsByChannel(
    request: GetFarcasterCastsByChannelRequest,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    const channel = await this.getChannelById(request.id);
    if (!channel) return { data: [] };

    const rawCasts = await this.client.farcasterCast.findMany({
      where: {
        parentUrl: channel.url,
        timestamp: this.decodeCursor(request.cursor),
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
      take: MAX_PAGE_SIZE,
    });

    const casts = (
      await Promise.all(
        rawCasts.map((rawCast) =>
          this.getCast(rawCast.hash, rawCast, viewerFid),
        ),
      )
    ).filter(Boolean) as FarcasterCastResponse[];

    return {
      data: casts,
      nextCursor:
        casts.length === MAX_PAGE_SIZE
          ? this.encodeCursor({
              timestamp: casts[casts.length - 1]?.timestamp,
            })
          : undefined,
    };
  }

  async getCastsByFids(
    request: GetFarcasterCastsByFidsRequest,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    const rawCasts = await this.client.farcasterCast.findMany({
      where: {
        fid: {
          in: request.fids.map((fid) => BigInt(fid)),
        },
        timestamp: {
          ...(request.minTimestamp
            ? { gt: new Date(request.minTimestamp) }
            : {}),
          ...this.decodeCursor(request.cursor),
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
      take: request.limit ?? MAX_PAGE_SIZE,
    });

    const casts = (
      await Promise.all(
        rawCasts.map((rawCast) =>
          this.getCast(rawCast.hash, rawCast, viewerFid),
        ),
      )
    ).filter(Boolean) as FarcasterCastResponse[];

    return {
      data: casts,
      nextCursor:
        casts.length === MAX_PAGE_SIZE
          ? this.encodeCursor({
              timestamp: casts[casts.length - 1]?.timestamp,
            })
          : undefined,
    };
  }

  async getCastsByFollowing(
    request: GetFarcasterCastsByFollowingRequest,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
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
        cursor: request.cursor,
        replies: request.replies,
        minTimestamp: request.minTimestamp,
        limit: request.limit,
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

  async getChannel(
    url: string,
    viewerFid?: string,
  ): Promise<Channel | undefined> {
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
      leadFid?: number;
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
      url: channelData.url,
      channelId: channelData.id,
      name: channelData.name,
      description: channelData.description,
      imageUrl: channelData.imageUrl,
      createdAt: new Date(channelData.createdAt * 1000),
      updatedAt: new Date(),
      creatorId: channelData.leadFid?.toString(),
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

  async getChannelById(
    id: string,
    viewerFid?: string,
  ): Promise<Channel | undefined> {
    const cached = await this.cache.getChannelById(id);
    if (cached) return cached;

    const existingChannel = await this.client.farcasterParentUrl.findFirst({
      where: { channelId: id },
    });
    if (existingChannel) {
      const channel: Channel = {
        ...existingChannel,
        creatorId: existingChannel.creatorId?.toString(),
      };
      await this.cache.setChannelById(id, channel);
      return channel;
    }

    const channel = await this.fetchChannelById(id);
    if (!channel) return;

    await this.cache.setChannelById(id, channel);
    return channel;
  }

  async fetchChannelById(id: string) {
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
      leadFid?: number;
      createdAt: number;
    }[] = data?.result?.channels;
    if (!channels) {
      return;
    }

    const channelData = channels.find((channel) => channel.id === id);
    if (!channelData) {
      return;
    }

    const channel: Channel = {
      url: channelData.url,
      channelId: channelData.id,
      name: channelData.name,
      description: channelData.description,
      imageUrl: channelData.imageUrl,
      createdAt: new Date(channelData.createdAt * 1000),
      updatedAt: new Date(),
      creatorId: channelData.leadFid?.toString(),
    };

    await this.client.farcasterParentUrl.upsert({
      where: {
        url: channel.url,
      },
      update: channel,
      create: channel,
    });

    return channel;
  }

  decodeCursor(cursor?: string): { lt: Date } | undefined {
    if (!cursor) return;
    try {
      const decodedString = Buffer.from(cursor, "base64").toString("ascii");
      const decodedCursor = JSON.parse(decodedString);
      if (typeof decodedCursor === "object" && "timestamp" in decodedCursor) {
        return { lt: new Date(decodedCursor.timestamp) };
      }
      console.error(
        "Decoded cursor does not match expected format:",
        decodedCursor,
      );
    } catch (error) {
      console.error("Error decoding cursor:", error);
    }
  }

  encodeCursor(cursor?: { timestamp: number }): string | undefined {
    if (!cursor) return;
    const encodedString = JSON.stringify(cursor);
    return Buffer.from(encodedString).toString("base64");
  }
}
