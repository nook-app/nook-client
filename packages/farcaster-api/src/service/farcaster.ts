import {
  FarcasterCast as DBFarcasterCast,
  FarcasterParentUrl,
  Prisma,
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
  UserEngagementType,
  GetFarcasterCastsResponse,
  GetFarcasterUsersResponse,
  UrlContentResponse,
  FarcasterFeedArgs,
  UserFilterType,
  UserFilter,
} from "@nook/common/types";
import {
  getCastEmbeds,
  getEmbedUrls,
  getMentions,
} from "@nook/common/farcaster";
import {
  decodeCursorTimestamp,
  decodeCursor,
  encodeCursor,
} from "@nook/common/utils";
import { UserDataType } from "@farcaster/hub-nodejs";
import { ContentAPIClient, FarcasterCacheClient } from "@nook/common/clients";
import { FastifyInstance } from "fastify";

export const MAX_PAGE_SIZE = 25;

function sanitizeInput(input: string): string {
  // Basic example: remove non-alphanumeric characters and truncate
  return input.replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 100);
}

export class FarcasterService {
  private client: PrismaClient;
  private cache: FarcasterCacheClient;
  private contentClient: ContentAPIClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.farcaster.client;
    this.cache = new FarcasterCacheClient(fastify.redis.client);
    this.contentClient = new ContentAPIClient();
  }

  async getAddresses(req: UserFilter, viewerFid?: string) {
    const fids = await this.getFeedFids(req, viewerFid);
    if (!fids) return { data: [] };

    const addresses = await this.client.farcasterVerification.findMany({
      where: {
        fid: {
          in: fids.map((fid) => BigInt(fid)),
        },
        protocol: 0,
      },
    });

    return {
      data: addresses.map(({ address }) => address),
    };
  }

  async getFeed(
    req: FarcasterFeedArgs,
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    const fids = req.userFilter
      ? await this.getFeedFids(req.userFilter, viewerFid)
      : undefined;

    if (req.contentFilter) {
      const references = await this.contentClient.getContentReferences(
        {
          ...req.contentFilter,
          fids,
        },
        cursor,
        viewerFid,
      );
      const hashes = references.data.map((i) => i.hash);
      const casts = await this.getCastsFromHashes(hashes, viewerFid);
      const castMap = casts.reduce(
        (acc, cast) => {
          acc[cast.hash] = cast;
          return acc;
        },
        {} as Record<string, FarcasterCastResponse>,
      );

      return {
        data: references.data
          .map((ref) => {
            if (!castMap[ref.hash]) return;
            return {
              ...castMap[ref.hash],
              reference: ref.uri,
            };
          })
          .filter(Boolean) as FarcasterCastResponse[],
        nextCursor: references.nextCursor,
      };
    }

    let parentUrls: string[] | undefined;
    if (req.channelFilter) {
      const channels = await this.getChannelsById(req.channelFilter.channelIds);
      parentUrls = channels.map((channel) => channel.url);
    }

    const conditions: string[] = ['"deletedAt" IS NULL'];

    if (req.textFilter?.query) {
      conditions.push(
        `(to_tsvector('english', "text") @@ plainto_tsquery('english', '${sanitizeInput(
          req.textFilter.query,
        )}'))`,
      );
    }
    if (fids) {
      conditions.push(`"fid" IN (${fids.map((fid) => BigInt(fid)).join(",")})`);
    }
    if (parentUrls) {
      conditions.push(`"parentUrl" IN ('${parentUrls.join("','")}')`);
    }
    if (cursor) {
      const cursorTimestamp = decodeCursorTimestamp(cursor)?.lt.toISOString();
      if (cursorTimestamp)
        conditions.push(`"timestamp" < '${cursorTimestamp}'`);
    }
    if (req.replies === true) {
      conditions.push(`"parentHash" IS NOT NULL`);
    } else if (req.replies === false) {
      conditions.push(`"parentHash" IS NULL`);
    }

    const whereClause = conditions.join(" AND ");

    const rawCasts = await this.client.$queryRaw<DBFarcasterCast[]>(
      Prisma.sql([
        `
          SELECT *
          FROM "FarcasterCast"
          WHERE ${whereClause}
          ORDER BY "timestamp" DESC
          LIMIT ${MAX_PAGE_SIZE}
        `,
      ]),
    );

    const casts = await this.getCastsFromData(rawCasts, viewerFid);

    return {
      data: casts,
      nextCursor:
        casts.length === MAX_PAGE_SIZE
          ? encodeCursor({
              timestamp: casts[casts.length - 1]?.timestamp,
            })
          : undefined,
    };
  }

  async getFeedFids(
    filter: UserFilter,
    viewerFid?: string,
  ): Promise<string[] | undefined> {
    switch (filter.type) {
      case UserFilterType.Fids:
        return filter.args.fids;
      case UserFilterType.Following: {
        const fid = filter.args.fid || viewerFid;
        if (!fid) return;
        return await this.getFollowingFids([fid], filter.args.degree);
      }
      default:
        return undefined;
    }
  }

  async getFollowingFids(fids: string[], degree?: number) {
    const following = await this.client.farcasterLink.findMany({
      where: {
        linkType: "follow",
        fid: {
          in: fids.map((fid) => BigInt(fid)),
        },
        deletedAt: null,
      },
    });

    const followingFids = following.map((link) => link.targetFid.toString());

    if (!degree || degree === 1) {
      return followingFids;
    }

    const followingOfFollowing = await this.client.farcasterLink.findMany({
      where: {
        linkType: "follow",
        fid: {
          in: following.map((link) => link.targetFid),
        },
        deletedAt: null,
      },
    });

    const followingOfFollowingFids = followingOfFollowing.map((link) =>
      link.targetFid.toString(),
    );

    if (degree === 2) {
      return followingOfFollowingFids.filter(
        (fid) => !followingFids.includes(fid.toString()) && !fids.includes(fid),
      );
    }

    const followingOfFollowingOfFollowing =
      await this.client.farcasterLink.findMany({
        where: {
          linkType: "follow",
          fid: {
            in: followingOfFollowing.map((link) => link.targetFid),
          },
          deletedAt: null,
        },
      });

    const followingOfFollowingOfFollowingFids =
      followingOfFollowingOfFollowing.map((link) => link.targetFid.toString());

    return followingOfFollowingOfFollowingFids.filter(
      (fid) =>
        !followingFids.includes(fid.toString()) &&
        !followingOfFollowingFids.includes(fid.toString()) &&
        !fids.includes(fid),
    );
  }

  async getCastReplies(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    const decodedCursor = decodeCursor(cursor);

    const conditions: string[] = [
      `"parentHash" = '${sanitizeInput(hash)}'`,
      `"deletedAt" IS NULL`,
    ];

    if (decodedCursor?.likes) {
      conditions.push(
        `(stats.likes <= ${decodedCursor.likes} OR stats.likes IS NULL)`,
      );
    }
    if (decodedCursor?.timestamp) {
      conditions.push(
        `timestamp < '${new Date(decodedCursor.timestamp).toISOString()}'`,
      );
    }

    const whereClause = conditions.join(" AND ");

    const data = await this.client.$queryRaw<
      (DBFarcasterCast & { likes: number })[]
    >(
      Prisma.sql([
        `
          SELECT c.*, likes
          FROM "FarcasterCast" c
          LEFT JOIN "FarcasterCastStats" stats ON c.hash = stats.hash
          WHERE ${whereClause}
          ORDER BY stats.likes DESC NULLS LAST, timestamp DESC
          LIMIT ${MAX_PAGE_SIZE}
        `,
      ]),
    );

    const casts = await this.getCastsFromData(data, viewerFid);

    return {
      data: casts,
      nextCursor:
        casts.length === MAX_PAGE_SIZE
          ? encodeCursor({
              likes: data[data.length - 1]?.likes,
              timestamp: casts[casts.length - 1]?.timestamp,
            })
          : undefined,
    };
  }

  async getCastsFromHashes(
    hashes: string[],
    viewerFid?: string,
  ): Promise<FarcasterCastResponse[]> {
    const casts = (
      await Promise.all(hashes.map((hash) => this.getRawCast(hash, viewerFid)))
    ).filter(Boolean) as FarcasterCast[];

    return await this.getCasts(casts, viewerFid);
  }

  async getRawCast(
    hash: string,
    viewerFid?: string,
  ): Promise<FarcasterCast | undefined> {
    const [cast, engagement, context] = await Promise.all([
      this.getCastBase(hash),
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

  async getCastBase(hash: string): Promise<BaseFarcasterCast | undefined> {
    const cached = await this.cache.getCast(hash);
    if (cached) return cached;

    const cast = await this.client.farcasterCast.findFirst({
      where: { hash, deletedAt: null },
    });

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

  async getCastsFromData(
    data: DBFarcasterCast[],
    viewerFid?: string,
  ): Promise<FarcasterCastResponse[]> {
    const casts = (
      await Promise.all(
        data.map(async (cast) => {
          const [engagement, context] = await Promise.all([
            this.getCastEngagement(cast.hash),
            this.getCastContext(cast.hash, viewerFid),
          ]);
          return {
            hash: cast.hash,
            fid: cast.fid.toString(),
            timestamp: cast.timestamp.getTime(),
            text: cast.text,
            mentions: getMentions(cast),
            embedHashes: getCastEmbeds(cast).map(({ hash }) => hash),
            embedUrls: getEmbedUrls(cast),
            parentHash: cast.parentHash || undefined,
            parentUrl: cast.parentUrl || undefined,
            engagement,
            context,
          };
        }),
      )
    ).filter(Boolean) as FarcasterCast[];

    return await this.getCasts(casts, viewerFid);
  }

  async getCasts(casts: FarcasterCast[], viewerFid?: string) {
    const hashes = new Set<string>();
    for (const rawCast of casts) {
      if (rawCast.parentHash) {
        hashes.add(rawCast.parentHash);
      }
      for (const embedHash of rawCast.embedHashes) {
        hashes.add(embedHash);
      }
    }

    const relatedRawCasts = (
      await Promise.all(
        Array.from(hashes).map((hash) => this.getRawCast(hash, viewerFid)),
      )
    ).filter(Boolean) as FarcasterCast[];

    const allCasts = relatedRawCasts.concat(casts);

    const fids = new Set<string>();
    for (const cast of allCasts) {
      fids.add(cast.fid);
      for (const mention of cast.mentions) {
        fids.add(mention.fid);
      }
    }

    const channelIds = new Set<string>();
    for (const cast of allCasts) {
      const potentialChannelMentions = cast.text
        .split(" ")
        .filter((word) => word.startsWith("/"));
      for (const mention of potentialChannelMentions) {
        const channelId = mention.slice(1).trim();
        if (channelId) channelIds.add(channelId);
      }
    }

    const channelUrls = new Set<string>();
    for (const cast of allCasts) {
      if (cast.parentUrl) {
        channelUrls.add(cast.parentUrl);
      }
    }

    const embedUrls = new Set<string>();
    for (const cast of allCasts) {
      for (const embedUrl of cast.embedUrls) {
        embedUrls.add(embedUrl);
      }
    }

    const [users, embeds, channelsByUrl, channelsById] = await Promise.all([
      this.getUsers(Array.from(fids), viewerFid),
      this.contentClient.getContents(Array.from(embedUrls)),
      this.getChannels(Array.from(channelUrls)),
      this.getChannelsById(Array.from(channelIds)),
    ]);

    const userMap = users.reduce(
      (acc, user) => {
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUser>,
    );

    const channelByIdMap = channelsById.reduce(
      (acc, channel) => {
        acc[channel.channelId] = channel;
        return acc;
      },
      {} as Record<string, Channel>,
    );

    const channelByUrlMap = channelsByUrl.reduce(
      (acc, channel) => {
        acc[channel.url] = channel;
        return acc;
      },
      {} as Record<string, Channel>,
    );

    const embedMap = embeds.data.reduce(
      (acc, embed) => {
        acc[embed.uri] = embed;
        return acc;
      },
      {} as Record<string, UrlContentResponse>,
    );

    const castMap = allCasts.reduce(
      (acc, cast) => {
        const potentialChannelMentions = cast.text
          .split(" ")
          .filter((word) => word.startsWith("/"));
        acc[cast.hash] = {
          ...cast,
          user: userMap[cast.fid],
          embeds: cast.embedUrls
            .map((embed) => embedMap[embed])
            .filter(Boolean),
          mentions: cast.mentions.map((mention) => ({
            user: userMap[mention.fid],
            position: mention.position,
          })),
          embedCasts: cast.embedHashes.map((hash) => acc[hash]).filter(Boolean),
          parent: cast.parentHash ? acc[cast.parentHash] : undefined,
          channel: cast.parentUrl ? channelByUrlMap[cast.parentUrl] : undefined,
          channelMentions: potentialChannelMentions
            .map((mention) => {
              const channel = channelByIdMap[mention.slice(1)];
              if (!channel) return;
              return {
                channel,
                position: Buffer.from(
                  cast.text.slice(0, cast.text.indexOf(mention)),
                ).length.toString(),
              };
            })
            .filter(Boolean) as { channel: Channel; position: string }[],
        };
        return acc;
      },
      {} as Record<string, FarcasterCastResponse>,
    );

    return casts.map((cast) => castMap[cast.hash]);
  }

  async searchChannels(query: string, cursor?: string) {
    const conditions: string[] = [`name ILIKE '%${sanitizeInput(query)}%'`];

    if (cursor) {
      const decodedCursor = decodeCursor(cursor);
      if (decodedCursor?.casts) {
        conditions.push(`"casts" < '${decodedCursor.casts}'`);
      }
    }

    const whereClause = conditions.join(" AND ");
    const rawChannels = await this.client.$queryRaw<
      (FarcasterParentUrl & { casts: number })[]
    >(
      Prisma.sql([
        `
          SELECT u.*, casts
          FROM "FarcasterParentUrl" u
          JOIN "FarcasterParentUrlStats" stats ON u.url = stats.url
          WHERE ${whereClause}
          ORDER BY casts DESC
          LIMIT ${MAX_PAGE_SIZE}
        `,
      ]),
    );

    const channels = rawChannels.map((channel) => ({
      ...channel,
      creatorId: channel.creatorId?.toString(),
    }));

    return {
      data: channels,
      nextCursor:
        channels.length === MAX_PAGE_SIZE
          ? encodeCursor({
              casts: channels[channels.length - 1].casts,
            })
          : undefined,
    };
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

  async getChannelsById(ids: string[]): Promise<Channel[]> {
    const channels = await Promise.all(
      ids.map((id) => this.getChannelById(id)),
    );
    return channels.filter(Boolean) as Channel[];
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

  async searchUsers(query: string, cursor?: string, viewerFid?: string) {
    const decodedCursor = decodeCursor(cursor);

    const conditions: string[] = [
      `(to_tsvector('english', "value") @@ plainto_tsquery('english', '${sanitizeInput(
        query,
      )}'))`,
    ];

    if (decodedCursor?.followers) {
      conditions.push(`"stats.followers" < ${decodedCursor.followers}`);
    }

    const whereClause = conditions.join(" AND ");

    const rawUsers = await this.client.$queryRaw<
      { fid: string; followers: number }[]
    >(
      Prisma.sql([
        `
          SELECT DISTINCT u.fid AS fid, followers
          FROM "FarcasterUserData" u
          JOIN "FarcasterUserStats" stats ON u.fid = stats.fid
          WHERE ${whereClause}
          ORDER BY stats.followers DESC
          LIMIT ${MAX_PAGE_SIZE}
        `,
      ]),
    );

    const users = await this.getUsers(
      rawUsers.map((user) => user.fid.toString()),
      viewerFid,
    );
    return {
      data: users,
      nextCursor:
        users.length === MAX_PAGE_SIZE
          ? encodeCursor({
              followers: rawUsers[rawUsers.length - 1]?.followers,
            })
          : undefined,
    };
  }

  async getUsers(fids: string[], viewerFid?: string): Promise<FarcasterUser[]> {
    if (fids.length === 0) return [];

    const users = await this.cache.getUsers(fids);
    const uncachedFids = fids.filter(
      // TODO: Figure out why pfp is not getting update in some cases, temporarily try to backfill
      (fid) => !users.some((user) => user.fid === fid && user.pfp),
    );

    if (uncachedFids.length > 0) {
      const userDatas = await this.client.farcasterUserData.findMany({
        where: { fid: { in: uncachedFids.map((fid) => BigInt(fid)) } },
      });

      const uncachedUsers = uncachedFids.map((fid) => {
        const username = userDatas.find(
          (d) => d.type === UserDataType.USERNAME && d.fid === BigInt(fid),
        );
        const pfp = userDatas.find(
          (d) => d.type === UserDataType.PFP && d.fid === BigInt(fid),
        );
        const displayName = userDatas.find(
          (d) => d.type === UserDataType.DISPLAY && d.fid === BigInt(fid),
        );
        const bio = userDatas.find(
          (d) => d.type === UserDataType.BIO && d.fid === BigInt(fid),
        );
        const url = userDatas.find(
          (d) => d.type === UserDataType.URL && d.fid === BigInt(fid),
        );

        const baseUser: BaseFarcasterUser = {
          fid,
          username: username?.value,
          pfp: pfp?.value,
          displayName: displayName?.value,
          bio: bio?.value,
          url: url?.value,
        };

        return baseUser;
      });

      await this.cache.setUsers(uncachedUsers);

      users.push(...uncachedUsers);
    }

    const response = await Promise.all(
      users.map(async (user) => {
        const [engagement, context, addresses] = await Promise.all([
          this.getUserEngagement(user.fid),
          this.getUserContext(user.fid, viewerFid),
          this.getUserVerifiedAddresses(user.fid),
        ]);
        return {
          ...user,
          engagement,
          context,
          verifiedAddresses: addresses,
        };
      }),
    );

    return response;
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
    if (cached !== undefined) return cached;

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
    if (cached !== undefined) return { following: cached };

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

  async getUserFollowers(
    fid: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterUsersResponse> {
    const followers = await this.client.farcasterLink.findMany({
      where: {
        timestamp: decodeCursorTimestamp(cursor),
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
          ? encodeCursor({
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
        timestamp: decodeCursorTimestamp(cursor),
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
          ? encodeCursor({
              timestamp: following[following.length - 1]?.timestamp.getTime(),
            })
          : undefined,
    };
  }

  async getUserVerifiedAddresses(fid: string) {
    const addresses = await this.client.farcasterVerification.findMany({
      where: { fid: BigInt(fid), deletedAt: null },
    });

    return addresses.map((address) => address.address);
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
    if (cached !== undefined) return cached;

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
        timestamp: decodeCursorTimestamp(cursor),
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
          ? encodeCursor({
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
        timestamp: decodeCursorTimestamp(cursor),
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
          ? encodeCursor({
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
    const embeds = await this.client.farcasterCastEmbedCast.findMany({
      where: {
        embedHash: hash,
        timestamp: decodeCursorTimestamp(cursor),
        deletedAt: null,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: MAX_PAGE_SIZE,
    });

    const casts = await this.getCastsFromHashes(
      embeds.map(({ embedHash }) => embedHash),
      viewerFid,
    );

    return {
      data: casts,
      nextCursor:
        casts.length === MAX_PAGE_SIZE
          ? encodeCursor({
              timestamp: casts[casts.length - 1]?.timestamp,
            })
          : undefined,
    };
  }
}
