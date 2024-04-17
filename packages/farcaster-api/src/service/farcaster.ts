import {
  FarcasterCast as DBFarcasterCast,
  FarcasterParentUrl,
  Prisma,
  PrismaClient,
} from "@nook/common/prisma/farcaster";
import {
  BaseFarcasterCast,
  BaseFarcasterUser,
  Channel,
  FarcasterCastResponse,
  FarcasterUser,
  GetFarcasterCastsResponse,
  GetFarcasterUsersResponse,
  UrlContentResponse,
  FarcasterUserBadges,
} from "@nook/common/types";
import {
  getCastEmbeds,
  getEmbedUrls,
  getMentions,
  hexToBuffer,
  messageToCast,
} from "@nook/common/farcaster";
import {
  decodeCursorTimestamp,
  decodeCursor,
  encodeCursor,
} from "@nook/common/utils";
import {
  getSSLHubRpcClient,
  HubRpcClient,
  UserDataType,
} from "@farcaster/hub-nodejs";
import { ContentAPIClient, FarcasterCacheClient } from "@nook/common/clients";
import { FastifyInstance } from "fastify";

export const MAX_PAGE_SIZE = 25;

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[^a-zA-Z0-9\s./]/g, "")
    .substring(0, 100);
}

export class FarcasterService {
  private client: PrismaClient;
  private cache: FarcasterCacheClient;
  private contentClient: ContentAPIClient;
  private hub: HubRpcClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.farcaster.client;
    this.cache = new FarcasterCacheClient(fastify.redis.client);
    this.contentClient = new ContentAPIClient();
    this.hub = getSSLHubRpcClient(process.env.HUB_RPC_ENDPOINT as string);
  }

  async getUserFollowingFids(fid: string) {
    const cachedFollowing = await this.cache.getUserFollowingFids(fid);
    if (cachedFollowing.length > 0) return cachedFollowing;

    const following = await this.client.farcasterLink.findMany({
      where: {
        linkType: "follow",
        fid: BigInt(fid),
        deletedAt: null,
      },
    });

    const fids = following.map((link) => link.targetFid.toString());
    await this.cache.setUserFollowingFids(fid, fids);
    return fids;
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

    if (decodedCursor?.likes !== undefined) {
      const likes = Number(decodedCursor.likes);
      if (likes > 0) {
        const cursorConditions = ["stats.likes IS NULL"];
        cursorConditions.push(`stats.likes < ${likes}`);
        cursorConditions.push(
          `(stats.likes = ${
            decodedCursor.likes
          } AND c."timestamp" < '${new Date(
            decodedCursor.timestamp,
          ).toISOString()}')`,
        );
        conditions.push(`(${cursorConditions.join(" OR ")})`);
      } else {
        conditions.push(
          `(stats.likes IS NULL OR stats.likes = 0) AND timestamp < '${new Date(
            decodedCursor.timestamp,
          ).toISOString()}'`,
        );
      }
    }

    const whereClause = conditions.join(" AND ");

    const data = await this.client.$queryRaw<
      (DBFarcasterCast & { likes: number })[]
    >(
      Prisma.sql([
        `
          SELECT c.*, "stats".likes
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
              likes: data[data.length - 1]?.likes || 0,
              timestamp: casts[casts.length - 1]?.timestamp,
            })
          : undefined,
    };
  }

  async getCastAncestors(
    cast: FarcasterCastResponse,
    viewerFid?: string,
  ): Promise<FarcasterCastResponse[]> {
    const ancestorRawCasts: BaseFarcasterCast[] = [];
    if (!cast.parentHash) return [];

    let hash: string | undefined = cast.parentHash;
    do {
      const casts = await this.getRawCasts([hash], viewerFid);
      if (casts.length === 0 || !casts[0]) break;
      ancestorRawCasts.push(casts[0]);
      hash = casts[0].parentHash;
    } while (hash);

    const hashes = ancestorRawCasts.map((cast) => cast.hash);

    await this.cache.setCast(cast.hash, {
      hash: cast.hash,
      fid: cast.user.fid.toString(),
      timestamp: cast.timestamp,
      text: cast.text,
      mentions: cast.mentions.map(({ user, position }) => ({
        fid: user.fid,
        position,
      })),
      embedHashes: cast.embedCasts.map(({ hash }) => hash),
      embedUrls: cast.embeds.map(({ uri }) => uri),
      rootParentFid: cast.rootParentFid?.toString(),
      rootParentHash: cast.rootParentHash || undefined,
      parentFid: cast.parentFid?.toString(),
      parentHash: cast.parentHash || undefined,
      parentUrl: cast.parentUrl || undefined,
      ancestors: hashes,
      appFid: cast.appFid,
      signer: cast.signer,
    });

    return await this.getCasts(ancestorRawCasts, viewerFid);
  }

  async getCastThread(
    cast: FarcasterCastResponse,
    viewerFid?: string,
  ): Promise<FarcasterCastResponse[]> {
    if (!cast.rootParentHash) return [];

    const threadCasts = await this.client.farcasterCast.findMany({
      where: {
        fid: BigInt(cast.user.fid),
        rootParentHash: cast.rootParentHash,
        deletedAt: null,
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    const threadRawCasts: DBFarcasterCast[] = [];

    let hash: string | undefined = cast.hash;
    do {
      const cast = threadCasts.find((c) => c.parentHash === hash);
      if (!cast) break;
      threadRawCasts.push(cast);
      hash = cast.hash;
    } while (hash);

    await this.cache.setCastThread(
      cast.hash,
      threadRawCasts.map((cast) => cast.hash),
    );

    return await this.getCastsFromData(threadRawCasts, viewerFid);
  }

  async getCastsFromHashes(
    hashes: string[],
    viewerFid?: string,
    withAncestors?: boolean,
  ): Promise<FarcasterCastResponse[]> {
    const casts = await this.getRawCasts(hashes, viewerFid);
    return await this.getCasts(casts, viewerFid, withAncestors ? hashes : []);
  }

  async getRawCasts(
    hashes: string[],
    viewerFid?: string,
  ): Promise<BaseFarcasterCast[]> {
    if (hashes.length === 0) return [];

    const casts = (await this.cache.getCasts(hashes)).filter(
      Boolean,
    ) as BaseFarcasterCast[];
    const cacheMap = casts.reduce(
      (acc, cast) => {
        // todo: remove this check once all cached casts have appFid?
        const hasAppFid = !!cast.appFid;
        const hasRootParentHash = !!cast.rootParentHash;
        const hasParentFid =
          !cast.parentHash || (!!cast.parentHash && !!cast.parentFid);
        if (hasAppFid && hasRootParentHash && hasParentFid) {
          acc[cast.hash] = cast;
        }
        return acc;
      },
      {} as Record<string, BaseFarcasterCast>,
    );

    const uncachedHashes = hashes.filter((hash) => !cacheMap[hash]);

    if (uncachedHashes.length > 0) {
      const data = await this.client.farcasterCast.findMany({
        where: {
          hash: {
            in: uncachedHashes,
          },
          deletedAt: null,
        },
      });

      const missingHashes = uncachedHashes.filter(
        (hash) => !data.find((cast) => cast.hash === hash),
      );

      if (missingHashes.length > 0 && viewerFid) {
        const missingCasts = await Promise.all(
          missingHashes.map(async (hash) => {
            const message = await this.hub.getCast({
              fid: Number(viewerFid),
              hash: hexToBuffer(hash),
            });
            if (message.isErr()) return;
            const cast = messageToCast(message.value);
            if (!cast) return;
            return cast;
          }),
        );
        data.push(...(missingCasts.filter(Boolean) as DBFarcasterCast[]));
      }

      const appFidsBySigner = await this.getCastSignerAppFids(data);
      const uncachedCasts = data.map((cast) => ({
        hash: cast.hash,
        fid: cast.fid.toString(),
        timestamp: cast.timestamp.getTime(),
        text: cast.text,
        mentions: getMentions(cast),
        embedHashes: getCastEmbeds(cast).map(({ hash }) => hash),
        embedUrls: getEmbedUrls(cast),
        rootParentFid: cast.rootParentFid?.toString(),
        rootParentHash: cast.rootParentHash || undefined,
        parentFid: cast.parentFid?.toString(),
        parentHash: cast.parentHash || undefined,
        parentUrl: cast.parentUrl || undefined,
        signer: cast.signer,
        appFid: appFidsBySigner[cast.signer],
      }));

      await this.cache.setCasts(uncachedCasts);

      casts.push(...uncachedCasts);
    }

    return casts;
  }

  async getCastsFromData(
    data: DBFarcasterCast[],
    viewerFid?: string,
  ): Promise<FarcasterCastResponse[]> {
    const casts = data.map((cast, i) => ({
      hash: cast.hash,
      fid: cast.fid.toString(),
      timestamp: cast.timestamp.getTime(),
      text: cast.text,
      mentions: getMentions(cast),
      embedHashes: getCastEmbeds(cast).map(({ hash }) => hash),
      embedUrls: getEmbedUrls(cast),
      parentHash: cast.parentHash || undefined,
      parentUrl: cast.parentUrl || undefined,
      signer: cast.signer,
    }));

    return await this.getCasts(casts, viewerFid);
  }

  async getCasts(
    casts: BaseFarcasterCast[],
    viewerFid?: string,
    ancestorsFor?: string[],
  ) {
    let thread: string[] = [];

    const hashes = new Set<string>();
    for (const rawCast of casts) {
      if (rawCast.parentHash) {
        hashes.add(rawCast.parentHash);
      }
      for (const embedHash of rawCast.embedHashes) {
        hashes.add(embedHash);
      }
      if (ancestorsFor?.includes(rawCast.hash)) {
        if (rawCast.ancestors) {
          for (let i = rawCast.ancestors.length - 1; i >= 0; i--) {
            hashes.add(rawCast.ancestors[i]);
          }
        }
        if (
          rawCast.rootParentHash &&
          rawCast.fid === rawCast.rootParentFid &&
          (!rawCast.parentFid || rawCast.parentFid === rawCast.fid)
        ) {
          const rawThread = await this.cache.getCastThread(
            rawCast.rootParentHash,
          );
          if (rawThread) {
            const indexOfCast = rawThread.indexOf(rawCast.hash) + 1;
            thread = rawThread.slice(indexOfCast, indexOfCast + 10);
            for (const hash of thread) {
              hashes.add(hash);
            }
          }
        }
      }
    }

    const relatedRawCasts = await this.getRawCasts(
      Array.from(hashes),
      viewerFid,
    );

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

    const [
      isLiked,
      isRecasted,
      appFids,
      likes,
      recasts,
      replies,
      quotes,
      users,
      embeds,
      channels,
    ] = await Promise.all([
      this.getCastIsLiked(
        allCasts.map((cast) => cast.hash),
        viewerFid,
      ),
      this.getCastIsRecasted(
        allCasts.map((cast) => cast.hash),
        viewerFid,
      ),
      this.getCastSignerAppFids(allCasts),
      this.getCastLikeCounts(allCasts.map((cast) => cast.hash)),
      this.getCastRecastCounts(allCasts.map((cast) => cast.hash)),
      this.getCastReplyCounts(allCasts.map((cast) => cast.hash)),
      this.getCastQuoteCounts(allCasts.map((cast) => cast.hash)),
      this.getUsers(Array.from(fids), viewerFid),
      this.contentClient.getContents(Array.from(embedUrls)),
      this.getChannels(Array.from(channelUrls), Array.from(channelIds)),
    ]);

    const castToIndex = allCasts.reduce(
      (acc, cast, index) => {
        acc[cast.hash] = index;
        return acc;
      },
      {} as Record<string, number>,
    );

    const userMap = users.reduce(
      (acc, user) => {
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUser>,
    );

    const channelMap = channels.reduce(
      (acc, channel) => {
        if (!channel) return acc;
        acc[channel.url] = channel;
        acc[channel.channelId] = channel;
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
        const potentialChannelMentions = cast.text.split(" ").reduce(
          (acc, word) => {
            if (word.startsWith("/")) {
              const position = cast.text.indexOf(word, acc.lastIndex);
              acc.mentions.push({ word, position });
              acc.lastIndex = position + word.length;
            }
            return acc;
          },
          { mentions: [], lastIndex: 0 } as {
            mentions: { word: string; position: number }[];
            lastIndex: number;
          },
        ).mentions;

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
          channel: cast.parentUrl ? channelMap[cast.parentUrl] : undefined,
          channelMentions: potentialChannelMentions
            .map((mention) => {
              const channel = channelMap[mention.word.slice(1)];
              if (!channel) return;
              return {
                channel,
                position: Buffer.from(
                  cast.text.slice(0, mention.position),
                ).length.toString(),
              };
            })
            .filter(Boolean) as { channel: Channel; position: string }[],
          ancestors: [],
          thread: [],
          appFid: cast.appFid || appFids[cast.signer],
          context: {
            liked: isLiked[castToIndex[cast.hash]],
            recasted: isRecasted[castToIndex[cast.hash]],
          },
          engagement: {
            likes: likes[castToIndex[cast.hash]],
            recasts: recasts[castToIndex[cast.hash]],
            replies: replies[castToIndex[cast.hash]],
            quotes: quotes[castToIndex[cast.hash]],
          },
        };
        return acc;
      },
      {} as Record<string, FarcasterCastResponse>,
    );

    return casts.map((cast) => {
      if (ancestorsFor?.includes(cast.hash)) {
        castMap[cast.hash].ancestors = cast.ancestors
          ?.map((hash) => castMap[hash])
          .filter(Boolean);
        castMap[cast.hash].thread = thread
          ?.map((hash) => castMap[hash])
          .filter(Boolean);
      }

      return castMap[cast.hash];
    });
  }

  async searchChannels(query: string, limit?: number, cursor?: string) {
    const conditions: string[] = [
      `(name ILIKE '%${sanitizeInput(
        query,
      )}%' OR "channelId" ILIKE '%${sanitizeInput(query)}%')`,
    ];

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
          LIMIT ${limit || MAX_PAGE_SIZE}
        `,
      ]),
    );

    return {
      data: await this.getChannels(rawChannels.map((channel) => channel.url)),
      nextCursor:
        rawChannels.length === MAX_PAGE_SIZE
          ? encodeCursor({
              casts: rawChannels[rawChannels.length - 1].casts,
            })
          : undefined,
    };
  }

  async getChannels(urls?: string[], ids?: string[]) {
    const keys = (urls || []).concat(ids || []);
    const channels = await this.cache.getChannels(keys);
    const channelMap = channels.reduce(
      (acc, channel) => {
        if (!channel) return acc;
        acc[channel.url] = channel;
        acc[channel.channelId] = channel;
        return acc;
      },
      {} as Record<string, Channel>,
    );

    const missingUrls = urls?.filter((url) => !channelMap[url]) || [];
    const missingIds = ids?.filter((id) => !channelMap[id]) || [];

    if (missingUrls.length > 0 || missingIds.length > 0) {
      const data = await this.client.farcasterParentUrl.findMany({
        where: {
          OR: [
            {
              channelId: {
                in: missingIds,
              },
            },
            {
              url: {
                in: missingUrls,
              },
            },
          ],
        },
      });

      const fetchedChannels = data.map((channel) => ({
        ...channel,
        creatorId: channel.creatorId?.toString(),
      }));

      await this.cache.setChannels(fetchedChannels);

      for (const channel of fetchedChannels) {
        channelMap[channel.url] = channel;
        channelMap[channel.channelId] = channel;
      }
    }

    const stillMissingUrls = missingUrls.filter((url) => !channelMap[url]);
    const stillMissingIds = missingIds.filter((id) => !channelMap[id]);
    const missingFollowerCount = Object.values(channelMap)
      .filter((channel) => !channel.followerCount)
      .map((channel) => channel.channelId);

    if (
      stillMissingUrls.length > 0 ||
      stillMissingIds.length > 0 ||
      missingFollowerCount.length > 0
    ) {
      const response = await fetch("https://api.warpcast.com/v2/all-channels");
      const data = await response.json();
      const channelsFromWarpcast: {
        id: string;
        url: string;
        name: string;
        description: string;
        imageUrl: string;
        leadFid?: number;
        createdAt: number;
        followerCount: number;
        hostFids: number[];
      }[] = data?.result?.channels || [];

      const channelsToUpsert = channelsFromWarpcast.filter((channel) => {
        return (
          stillMissingUrls.includes(channel.url) ||
          stillMissingIds.includes(channel.id) ||
          missingFollowerCount.includes(channel.id)
        );
      });

      const upsertedChannels = await Promise.all(
        channelsToUpsert.map(async (channel) => {
          const channelData = {
            url: channel.url,
            channelId: channel.id,
            name: channel.name,
            description: channel.description,
            imageUrl: channel.imageUrl,
            createdAt: new Date(channel.createdAt * 1000),
            updatedAt: new Date(),
            creatorId: channel.leadFid?.toString(),
          };

          await this.client.farcasterParentUrl.upsert({
            where: {
              url: channel.url,
            },
            update: channelData,
            create: channelData,
          });

          return {
            ...channelData,
            followerCount: channel.followerCount,
            hostFids: channel.hostFids?.map((h: number) => h.toString()),
          };
        }),
      );

      for (const channel of upsertedChannels) {
        channelMap[channel.url] = channel;
        channelMap[channel.channelId] = channel;
      }

      await this.cache.setChannels(upsertedChannels);
    }

    return keys.map((key) => channelMap[key]);
  }

  async searchUsers(
    query?: string,
    limit?: number,
    cursor?: string,
    viewerFid?: string,
  ) {
    const decodedCursor = decodeCursor(cursor);

    const conditions: string[] = [];
    if (query) {
      conditions.push(
        `((to_tsvector('english', "value") @@ to_tsquery('english', '${sanitizeInput(
          query,
        ).replaceAll(
          " ",
          "<->",
        )}')) OR (type = 6 AND value LIKE '${sanitizeInput(
          query,
        ).toLowerCase()}%'))`,
      );
    }

    if (decodedCursor?.followers) {
      conditions.push(`stats.followers < ${decodedCursor.followers}`);
    }

    const whereClause =
      conditions.length > 0 ? conditions.join(" AND ") : "true";

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
          LIMIT ${limit || MAX_PAGE_SIZE}
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

  async getUsersForAddresses(addresses: string[], viewerFid?: string) {
    const fids = await this.client.farcasterVerification.findMany({
      where: {
        address: {
          in: addresses,
        },
        protocol: 0,
      },
    });

    return await this.getUsers(
      fids.map(({ fid }) => fid.toString()),
      viewerFid,
    );
  }

  async getUsers(fids: string[], viewerFid?: string): Promise<FarcasterUser[]> {
    if (fids.length === 0) return [];

    const [users, powerBadges, followers, following, isFollowing, isFollower] =
      await Promise.all([
        this.getUserDatas(fids),
        this.getUserBadges(fids),
        this.getUserFollowerCounts(fids),
        this.getUserFollowingCounts(fids),
        this.getUserIsFollowing(fids, viewerFid),
        this.getUserIsFollower(fids, viewerFid),
      ]);

    return users.map((user, i) => ({
      ...user,
      engagement: {
        followers: followers[i],
        following: following[i],
      },
      context: {
        following: isFollowing[i],
        followers: isFollower[i],
      },
      badges: powerBadges[i] || { powerBadge: false },
    }));
  }

  async getUserDatas(fids: string[]) {
    const users = await this.cache.getUsers(fids);
    const cacheMap = users.reduce(
      (acc, user) => {
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, BaseFarcasterUser>,
    );

    const uncachedFids = fids.filter(
      (fid) => !cacheMap[fid] || cacheMap[fid].verifiedAddresses === undefined,
    );

    if (uncachedFids.length > 0) {
      const fids = uncachedFids.map((fid) => BigInt(fid));
      const [userDatas, addresses] = await Promise.all([
        this.client.farcasterUserData.findMany({
          where: { fid: { in: fids } },
        }),
        this.client.farcasterVerification.findMany({
          where: { fid: { in: fids }, deletedAt: null },
        }),
      ]);

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
        const verifiedAddresses = addresses
          .filter((address) => address.fid === BigInt(fid))
          .map((address) => ({
            protocol: address.protocol,
            address: address.address,
          }));

        const baseUser: BaseFarcasterUser = {
          fid,
          username: username?.value,
          pfp: pfp?.value,
          displayName: displayName?.value,
          bio: bio?.value,
          url: url?.value,
          verifiedAddresses,
        };

        return baseUser;
      });

      await this.cache.setUsers(uncachedUsers);

      users.push(...uncachedUsers);
    }

    return users;
  }

  async getUserFollowerCounts(fids: string[]): Promise<number[]> {
    const counts = await this.cache.getUserEngagements("followers", fids);
    const countMap = counts.reduce(
      (acc, count, i) => {
        if (count === undefined) return acc;
        acc[fids[i]] = count;
        return acc;
      },
      {} as Record<string, number>,
    );

    const missing = fids.filter((fid) => countMap[fid] === undefined);

    if (missing.length > 0) {
      const fetchedCounts = await this.client.farcasterUserStats.findMany({
        where: { fid: { in: missing.map((fid) => BigInt(fid)) } },
      });

      await this.cache.setUserEngagements(
        "followers",
        fetchedCounts.map((count) => count.fid.toString()),
        fetchedCounts.map((count) => count.followers),
      );

      for (const count of fetchedCounts) {
        countMap[count.fid.toString()] = count.followers;
      }
    }

    return fids.map((fid) => countMap[fid] || 0);
  }

  async getUserFollowingCounts(fids: string[]): Promise<number[]> {
    const counts = await this.cache.getUserEngagements("following", fids);
    const countMap = counts.reduce(
      (acc, count, i) => {
        if (count === undefined) return acc;
        acc[fids[i]] = count;
        return acc;
      },
      {} as Record<string, number>,
    );

    const missing = fids.filter((fid) => countMap[fid] === undefined);

    if (missing.length > 0) {
      const fetchedCounts = await this.client.farcasterUserStats.findMany({
        where: { fid: { in: missing.map((fid) => BigInt(fid)) } },
      });

      await this.cache.setUserEngagements(
        "following",
        fetchedCounts.map((count) => count.fid.toString()),
        fetchedCounts.map((count) => count.following),
      );

      for (const count of fetchedCounts) {
        countMap[count.fid.toString()] = count.following;
      }
    }

    return fids.map((fid) => countMap[fid] || 0);
  }

  async getUserBadges(fids: string[]): Promise<FarcasterUserBadges[]> {
    const powerBadges = await this.cache.getUserPowerBadges(fids);
    return powerBadges.map((powerBadge) => ({ powerBadge }));
  }

  async getUserIsFollower(
    fids: string[],
    viewerFid?: string,
  ): Promise<boolean[]> {
    if (!viewerFid) return [];

    const isFollower = await this.cache.getUserContexts(
      "followers",
      viewerFid,
      fids,
    );
    const isFollowerMap = isFollower.reduce(
      (acc, follower, i) => {
        if (follower === undefined) return acc;
        acc[fids[i]] = follower;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    const missing = fids.filter((fid) => isFollowerMap[fid] === undefined);

    if (missing.length > 0) {
      const fetchedIsFollower = await this.client.farcasterLink.findMany({
        where: {
          linkType: "follow",
          targetFid: BigInt(viewerFid),
          fid: {
            in: missing.map((fid) => BigInt(fid)),
          },
          deletedAt: null,
        },
      });

      await this.cache.setUserContexts(
        "followers",
        viewerFid,
        fetchedIsFollower.map((link) => link.fid.toString()),
        fetchedIsFollower.map(() => true),
      );

      for (const link of fetchedIsFollower) {
        isFollowerMap[link.fid.toString()] = true;
      }
    }

    const stillMissing = fids.filter((fid) => isFollowerMap[fid] === undefined);
    if (stillMissing.length > 0) {
      await this.cache.setUserContexts(
        "followers",
        viewerFid,
        stillMissing,
        stillMissing.map(() => false),
      );
    }

    return fids.map((fid) => isFollowerMap[fid] || false);
  }

  async getUserIsFollowing(
    fids: string[],
    viewerFid?: string,
  ): Promise<boolean[]> {
    if (!viewerFid) return [];

    const isFollowing = await this.cache.getUserContexts(
      "following",
      viewerFid,
      fids,
    );
    const isFollowingMap = isFollowing.reduce(
      (acc, following, i) => {
        if (following === undefined) return acc;
        acc[fids[i]] = following;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    const missing = fids.filter((fid) => isFollowingMap[fid] === undefined);

    if (missing.length > 0) {
      const fetchedIsFollowing = await this.client.farcasterLink.findMany({
        where: {
          linkType: "follow",
          fid: BigInt(viewerFid),
          targetFid: {
            in: missing.map((fid) => BigInt(fid)),
          },
          deletedAt: null,
        },
      });

      await this.cache.setUserContexts(
        "following",
        viewerFid,
        fetchedIsFollowing.map((link) => link.targetFid.toString()),
        fetchedIsFollowing.map(() => true),
      );

      for (const link of fetchedIsFollowing) {
        isFollowingMap[link.targetFid.toString()] = true;
      }
    }

    const stillMissing = fids.filter(
      (fid) => isFollowingMap[fid] === undefined,
    );
    if (stillMissing.length > 0) {
      await this.cache.setUserContexts(
        "following",
        viewerFid,
        stillMissing,
        stillMissing.map(() => false),
      );
    }

    return fids.map((fid) => isFollowingMap[fid] || false);
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

  async getCastLikeCounts(hashes: string[]): Promise<number[]> {
    const counts = await this.cache.getCastEngagements("likes", hashes);
    const countMap = counts.reduce(
      (acc, count, i) => {
        if (count === undefined) return acc;
        acc[hashes[i]] = count;
        return acc;
      },
      {} as Record<string, number>,
    );

    const missing = hashes.filter((hash) => countMap[hash] === undefined);

    if (missing.length > 0) {
      const fetchedCounts = await this.client.farcasterCastStats.findMany({
        where: {
          hash: {
            in: missing,
          },
        },
      });

      await this.cache.setCastEngagements(
        "likes",
        fetchedCounts.map((count) => count.hash),
        fetchedCounts.map((count) => count.likes),
      );

      for (const count of fetchedCounts) {
        countMap[count.hash] = count.likes;
      }
    }

    return hashes.map((hash) => countMap[hash] || 0);
  }

  async getCastRecastCounts(hashes: string[]): Promise<number[]> {
    const counts = await this.cache.getCastEngagements("recasts", hashes);
    const countMap = counts.reduce(
      (acc, count, i) => {
        if (count === undefined) return acc;
        acc[hashes[i]] = count;
        return acc;
      },
      {} as Record<string, number>,
    );

    const missing = hashes.filter((hash) => countMap[hash] === undefined);

    if (missing.length > 0) {
      const fetchedCounts = await this.client.farcasterCastStats.findMany({
        where: {
          hash: {
            in: missing,
          },
        },
      });

      await this.cache.setCastEngagements(
        "recasts",
        fetchedCounts.map((count) => count.hash),
        fetchedCounts.map((count) => count.recasts),
      );

      for (const count of fetchedCounts) {
        countMap[count.hash] = count.recasts;
      }
    }

    return hashes.map((hash) => countMap[hash] || 0);
  }

  async getCastReplyCounts(hashes: string[]): Promise<number[]> {
    const counts = await this.cache.getCastEngagements("replies", hashes);
    const countMap = counts.reduce(
      (acc, count, i) => {
        if (count === undefined) return acc;
        acc[hashes[i]] = count;
        return acc;
      },
      {} as Record<string, number>,
    );

    const missing = hashes.filter((hash) => countMap[hash] === undefined);

    if (missing.length > 0) {
      const fetchedCounts = await this.client.farcasterCastStats.findMany({
        where: {
          hash: {
            in: missing,
          },
        },
      });

      await this.cache.setCastEngagements(
        "replies",
        fetchedCounts.map((count) => count.hash),
        fetchedCounts.map((count) => count.replies),
      );

      for (const count of fetchedCounts) {
        countMap[count.hash] = count.replies;
      }
    }

    return hashes.map((hash) => countMap[hash] || 0);
  }

  async getCastQuoteCounts(hashes: string[]): Promise<number[]> {
    const counts = await this.cache.getCastEngagements("quotes", hashes);
    const countMap = counts.reduce(
      (acc, count, i) => {
        if (count === undefined) return acc;
        acc[hashes[i]] = count;
        return acc;
      },
      {} as Record<string, number>,
    );

    const missing = hashes.filter((hash) => countMap[hash] === undefined);

    if (missing.length > 0) {
      const fetchedCounts = await this.client.farcasterCastStats.findMany({
        where: {
          hash: {
            in: missing,
          },
        },
      });

      await this.cache.setCastEngagements(
        "quotes",
        fetchedCounts.map((count) => count.hash),
        fetchedCounts.map((count) => count.quotes),
      );

      for (const count of fetchedCounts) {
        countMap[count.hash] = count.quotes;
      }
    }

    return hashes.map((hash) => countMap[hash] || 0);
  }

  async getCastIsLiked(
    hashes: string[],
    viewerFid?: string,
  ): Promise<boolean[]> {
    if (!viewerFid) return [];

    const isLiked = await this.cache.getCastContexts(
      "likes",
      viewerFid,
      hashes,
    );
    const isLikedMap = isLiked.reduce(
      (acc, liked, i) => {
        if (liked === undefined) return acc;
        acc[hashes[i]] = liked;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    const missing = hashes.filter((hash) => isLikedMap[hash] === undefined);
    if (missing.length > 0) {
      const fetchedIsLiked = await this.client.farcasterCastReaction.findMany({
        where: {
          reactionType: 1,
          fid: BigInt(viewerFid),
          targetHash: {
            in: missing,
          },
          deletedAt: null,
        },
      });

      await this.cache.setCastContexts(
        "likes",
        viewerFid,
        fetchedIsLiked.map((reaction) => reaction.targetHash),
        fetchedIsLiked.map(() => true),
      );

      for (const reaction of fetchedIsLiked) {
        isLikedMap[reaction.targetHash] = true;
      }
    }

    const stillMissing = hashes.filter(
      (hash) => isLikedMap[hash] === undefined,
    );
    if (stillMissing.length > 0) {
      await this.cache.setCastContexts(
        "likes",
        viewerFid,
        stillMissing,
        stillMissing.map(() => false),
      );
    }

    return hashes.map((hash) => isLikedMap[hash] || false);
  }

  async getCastIsRecasted(
    hashes: string[],
    viewerFid?: string,
  ): Promise<boolean[]> {
    if (!viewerFid) return [];

    const isRecasted = await this.cache.getCastContexts(
      "recasts",
      viewerFid,
      hashes,
    );
    const isRecastedMap = isRecasted.reduce(
      (acc, recasted, i) => {
        if (recasted === undefined) return acc;
        acc[hashes[i]] = recasted;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    const missing = hashes.filter((hash) => isRecastedMap[hash] === undefined);
    if (missing.length > 0) {
      const fetchedIsRecasted =
        await this.client.farcasterCastReaction.findMany({
          where: {
            reactionType: 2,
            fid: BigInt(viewerFid),
            targetHash: {
              in: missing,
            },
            deletedAt: null,
          },
        });

      await this.cache.setCastContexts(
        "recasts",
        viewerFid,
        fetchedIsRecasted.map((reaction) => reaction.targetHash),
        fetchedIsRecasted.map(() => true),
      );

      for (const reaction of fetchedIsRecasted) {
        isRecastedMap[reaction.targetHash] = true;
      }
    }

    const stillMissing = hashes.filter(
      (hash) => isRecastedMap[hash] === undefined,
    );
    if (stillMissing.length > 0) {
      await this.cache.setCastContexts(
        "recasts",
        viewerFid,
        stillMissing,
        stillMissing.map(() => false),
      );
    }

    return hashes.map((hash) => isRecastedMap[hash] || false);
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
      embeds.map(({ hash }) => hash),
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

  /**
   * Get the appFids for all signers in a list of casts. Results are keyed by signer, not cast.
   * @param casts A list of casts, with signer and fid.
   * @returns A map of signer to appFid.
   */
  async getCastSignerAppFids(
    casts: { fid: string | bigint; signer: string }[],
  ): Promise<{ [key: string]: string }> {
    // dedupe
    const signerToFid: { [key: string]: string } = casts.reduce((prev, acc) => {
      prev[acc.signer] = acc.fid.toString();
      return prev;
    }, {} as { [key: string]: string });
    const cachedAppFids = await this.cache.getAppFidsBySigners(
      Object.keys(signerToFid),
    );

    const uncachedSigners = Object.keys(signerToFid).filter(
      (signer) => !cachedAppFids[signer],
    );

    await Promise.all(
      uncachedSigners.map(async (signer) => {
        cachedAppFids[signer] = await this.fetchAppFidForSigner(
          signerToFid[signer],
          signer,
        );
      }),
    );

    return cachedAppFids as { [key: string]: string };
  }

  async fetchAppFidForSigner(
    userFid: string,
    signer: string,
  ): Promise<string | undefined> {
    // query rpc to get signer fid
    const response = await this.hub.getOnChainSigner({
      fid: parseInt(userFid),
      signer: Buffer.from(signer.replace("0x", ""), "hex"),
    });
    if (response.isErr()) {
      console.error(
        `ERROR: Failed to get signer appId. userId: ${userFid} signer: ${signer}`,
        response.error,
      );
      return;
    }
    const event = response.value;
    if (!event.signerEventBody?.metadata) {
      throw new Error(
        `No signerEventBody or metadata for signer event. userId: ${userFid} signer: ${signer}`,
      );
    }
    const metadata = event.signerEventBody.metadata;
    // metadata is abi-encoded; skip the first 32 bytes which contain the pointer
    // to start of struct
    const clientFid = BigInt(
      `0x${Buffer.from(metadata.subarray(32, 64)).toString("hex")}`,
    );

    if (!clientFid) {
      throw new Error(
        `Failed to parse event metadata. userId: ${userFid} signer: ${signer}`,
      );
    }

    const clientFidString = clientFid.toString();
    await this.cache.setAppFidBySigner(signer, clientFidString);
    return clientFidString;
  }

  /**
   * Get the appFid for a cast by hash. Mostly for testing.
   * @param hash
   * @returns
   */
  async getCastAppFidByHash(hash: string) {
    const casts = await this.getRawCasts([hash]);
    this.cache.removeAppFidBySigner(casts[0].signer);
    return casts[0].appFid;
  }
}
