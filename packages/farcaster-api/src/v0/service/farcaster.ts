import {
  FarcasterCast as DBFarcasterCast,
  FarcasterCastStats,
  FarcasterParentUrl,
  Prisma,
  PrismaClient,
} from "@nook/common/prisma/farcaster";
import {
  BaseFarcasterCast,
  BaseFarcasterUser,
  Channel,
  FarcasterCastV1,
  FarcasterUserV1,
  GetFarcasterCastsResponse,
  GetFarcasterUsersResponse,
  UrlContentResponse,
  FarcasterUserBadges,
  UserFilter,
  UserFilterType,
  FarcasterCastEngagement,
  FarcasterCastContext,
  FarcasterUserEngagement,
  FarcasterUserContext,
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

  async getUserFollowerFids(fid: string) {
    const cachedFollowing = await this.cache.getUserFollowersFids(fid);
    if (cachedFollowing.length > 0) return cachedFollowing;

    const followers = await this.client.farcasterLink.findMany({
      where: {
        linkType: "follow",
        targetFid: BigInt(fid),
        deletedAt: null,
      },
    });

    const fids = followers.map((link) => link.fid.toString());
    await this.cache.setUserFollowersFids(fid, fids);
    return fids;
  }

  async getNewCastReplies(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    const decodedCursor = decodeCursor(cursor);

    const cached = await this.cache.getCastReplies(hash, "new");

    const sortedCached = cached.sort(
      (a, b) => b.score - a.score || a.hash.localeCompare(b.hash),
    );

    let filteredCached = sortedCached;
    if (decodedCursor?.score && decodedCursor?.hash) {
      filteredCached = sortedCached.filter(
        (reply) =>
          reply.score < Number(decodedCursor.score) ||
          (reply.score === Number(decodedCursor.score) &&
            reply.hash.localeCompare(decodedCursor.hash) > 0),
      );
    }
    const slicedCached = filteredCached.slice(0, MAX_PAGE_SIZE);

    if (slicedCached.length > 0) {
      const data = await this.getCastsFromHashes(
        slicedCached.map((reply) => reply.hash),
        viewerFid,
      );

      return {
        data,
        nextCursor:
          data.length === MAX_PAGE_SIZE
            ? encodeCursor({
                hash: slicedCached[slicedCached.length - 1].hash,
                score: slicedCached[slicedCached.length - 1].score,
              })
            : undefined,
      };
    }

    const data = await this.client.farcasterCast.findMany({
      where: {
        parentHash: hash,
        deletedAt: null,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    const scoredReplies = data.map((reply) => ({
      reply,
      score: reply.timestamp.getTime(),
    }));

    await this.cache.addCastReplies(
      hash,
      scoredReplies.map((reply) => ({
        hash: reply.reply.hash,
        score: reply.score,
      })),
      "new",
    );

    const sortedReplies = scoredReplies.sort(
      (a, b) => b.score - a.score || a.reply.hash.localeCompare(b.reply.hash),
    );

    let filteredReplies = sortedReplies;
    if (decodedCursor?.score && decodedCursor?.hash) {
      filteredReplies = sortedReplies.filter(
        (reply) =>
          reply.score < Number(decodedCursor.score) ||
          (reply.score === Number(decodedCursor.score) &&
            reply.reply.hash.localeCompare(decodedCursor.hash) < 0),
      );
    }

    const slicedReplies = filteredReplies.slice(0, MAX_PAGE_SIZE);

    return {
      data: await this.getCastsFromData(
        slicedReplies.map((reply) => reply.reply),
        viewerFid,
      ),
      nextCursor:
        slicedReplies.length === MAX_PAGE_SIZE
          ? encodeCursor({
              hash: slicedReplies[slicedReplies.length - 1].reply.hash,
              score: slicedReplies[slicedReplies.length - 1].score,
            })
          : undefined,
    };
  }

  async getTopCastReplies(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    const decodedCursor = decodeCursor(cursor);

    const cached = await this.cache.getCastReplies(hash, "top");

    const sortedCached = cached.sort(
      (a, b) => b.score - a.score || a.hash.localeCompare(b.hash),
    );

    let filteredCached = sortedCached;
    if (decodedCursor?.score && decodedCursor?.hash) {
      filteredCached = sortedCached.filter(
        (reply) =>
          reply.score < Number(decodedCursor.score) ||
          (reply.score === Number(decodedCursor.score) &&
            reply.hash.localeCompare(decodedCursor.hash) > 0),
      );
    }
    const slicedCached = filteredCached.slice(0, MAX_PAGE_SIZE);

    if (slicedCached.length > 0) {
      const data = await this.getCastsFromHashes(
        slicedCached.map((reply) => reply.hash),
        viewerFid,
      );

      return {
        data,
        nextCursor:
          data.length === MAX_PAGE_SIZE
            ? encodeCursor({
                hash: slicedCached[slicedCached.length - 1].hash,
                score: slicedCached[slicedCached.length - 1].score,
              })
            : undefined,
      };
    }

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
        `,
      ]),
    );

    const scoredReplies = data.map((reply) => ({
      reply,
      score: reply.likes || 0,
    }));

    await this.cache.addCastReplies(
      hash,
      scoredReplies.map((reply) => ({
        hash: reply.reply.hash,
        score: reply.score,
      })),
      "top",
    );

    const sortedReplies = scoredReplies.sort(
      (a, b) => b.score - a.score || a.reply.hash.localeCompare(b.reply.hash),
    );

    let filteredReplies = sortedReplies;
    if (decodedCursor?.score && decodedCursor?.hash) {
      filteredReplies = sortedReplies.filter(
        (reply) =>
          reply.score < Number(decodedCursor.score) ||
          (reply.score === Number(decodedCursor.score) &&
            reply.reply.hash.localeCompare(decodedCursor.hash) < 0),
      );
    }

    const slicedReplies = filteredReplies.slice(0, MAX_PAGE_SIZE);

    return {
      data: await this.getCastsFromData(
        slicedReplies.map((reply) => reply.reply),
        viewerFid,
      ),
      nextCursor:
        slicedReplies.length === MAX_PAGE_SIZE
          ? encodeCursor({
              hash: slicedReplies[slicedReplies.length - 1].reply.hash,
              score: slicedReplies[slicedReplies.length - 1].score,
            })
          : undefined,
    };
  }

  async getCastReplies(hash: string, cursor?: string, viewerFid?: string) {
    const decodedCursor = decodeCursor(cursor);

    const cached = await this.cache.getCastReplies(hash, "best");

    const sortedCached = cached.sort(
      (a, b) => b.score - a.score || a.hash.localeCompare(b.hash),
    );

    let filteredCached = sortedCached;
    if (decodedCursor?.score && decodedCursor?.hash) {
      filteredCached = sortedCached.filter(
        (reply) =>
          reply.score < Number(decodedCursor.score) ||
          (reply.score === Number(decodedCursor.score) &&
            reply.hash.localeCompare(decodedCursor.hash) > 0),
      );
    }
    const slicedCached = filteredCached.slice(0, MAX_PAGE_SIZE);

    if (slicedCached.length > 0) {
      const data = await this.getCastsFromHashes(
        slicedCached.map((reply) => reply.hash),
        viewerFid,
      );

      return {
        data,
        nextCursor:
          data.length === MAX_PAGE_SIZE
            ? encodeCursor({
                hash: slicedCached[slicedCached.length - 1].hash,
                score: slicedCached[slicedCached.length - 1].score,
              })
            : undefined,
      };
    }

    const [cast, replies] = await Promise.all([
      await this.client.farcasterCast.findUnique({
        where: {
          hash,
        },
      }),
      await this.client.farcasterCast.findMany({
        where: {
          parentHash: hash,
          deletedAt: null,
        },
        orderBy: {
          timestamp: "desc",
        },
      }),
    ]);

    if (!cast) {
      throw new Error("Cast not found");
    }

    const op = cast.fid;
    const replyHashes = replies.map((reply) => reply.hash);
    const replyFids = replies.map((reply) => reply.fid.toString());

    const [opLikes, opReplies, opFollows, powerBadges, stats] =
      await Promise.all([
        await this.client.farcasterCastReaction.findMany({
          where: {
            fid: BigInt(op),
            targetHash: {
              in: replyHashes,
            },
          },
        }),
        await this.client.farcasterCast.findMany({
          where: {
            fid: BigInt(op),
            parentHash: {
              in: replyHashes,
            },
          },
        }),
        await this.client.farcasterLink.findMany({
          where: {
            fid: BigInt(op),
            linkType: "follow",
            targetFid: {
              in: replyFids.map((fid) => BigInt(fid)),
            },
          },
        }),
        await this.getUserBadges(replyFids),
        await this.client.farcasterCastStats.findMany({
          where: {
            hash: {
              in: replyHashes,
            },
          },
        }),
      ]);

    const opLikeMap = opLikes.reduce(
      (acc, like) => {
        acc[like.targetHash] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    const opReplyMap = opReplies.reduce(
      (acc, reply) => {
        if (!reply.parentHash) return acc;
        acc[reply.parentHash] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    const opFollowMap = opFollows.reduce(
      (acc, follow) => {
        acc[follow.targetFid.toString()] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    const badgesMap = powerBadges.reduce(
      (acc, badge, i) => {
        acc[replyFids[i]] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    const statsMap = stats.reduce(
      (acc, stat) => {
        acc[stat.hash] = stat;
        return acc;
      },
      {} as Record<string, FarcasterCastStats>,
    );

    const scoredReplies = replies.map((reply) => {
      let score = statsMap[reply.hash]?.likes || 0;
      if (reply.fid === reply.parentFid) {
        score += 5_000_000;
      } else if (opReplyMap[reply.hash]) {
        score += 4_000_000;
      } else if (opLikeMap[reply.hash]) {
        score += 3_000_000;
      } else if (opFollowMap[reply.fid.toString()]) {
        score += 2_000_000;
      } else if (badgesMap[reply.fid.toString()]) {
        score += 1_000_000;
      }
      return {
        reply,
        score,
      };
    });

    await this.cache.addCastReplies(
      hash,
      scoredReplies.map((reply) => ({
        hash: reply.reply.hash,
        score: reply.score,
      })),
      "best",
    );

    const sortedReplies = scoredReplies.sort(
      (a, b) => b.score - a.score || a.reply.hash.localeCompare(b.reply.hash),
    );

    let filteredReplies = sortedReplies;
    if (decodedCursor?.score && decodedCursor?.hash) {
      filteredReplies = sortedReplies.filter(
        (reply) =>
          reply.score < Number(decodedCursor.score) ||
          (reply.score === Number(decodedCursor.score) &&
            reply.reply.hash.localeCompare(decodedCursor.hash) < 0),
      );
    }

    const slicedReplies = filteredReplies.slice(0, MAX_PAGE_SIZE);

    return {
      data: await this.getCastsFromData(
        slicedReplies.map((reply) => reply.reply),
        viewerFid,
      ),
      nextCursor:
        slicedReplies.length === MAX_PAGE_SIZE
          ? encodeCursor({
              hash: slicedReplies[slicedReplies.length - 1].reply.hash,
              score: slicedReplies[slicedReplies.length - 1].score,
            })
          : undefined,
    };
  }

  async getCastAncestors(
    cast: FarcasterCastV1,
    viewerFid?: string,
  ): Promise<FarcasterCastV1[]> {
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
    cast: FarcasterCastV1,
    viewerFid?: string,
  ): Promise<FarcasterCastV1[]> {
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
  ): Promise<FarcasterCastV1[]> {
    const casts = await this.getRawCasts(hashes, viewerFid);
    return await this.getCasts(casts, viewerFid, withAncestors ? hashes : []);
  }

  async getCastFromHub(
    hash: string,
    viewerFid?: string,
  ): Promise<FarcasterCastV1 | undefined> {
    const message = await this.hub.getCast({
      fid: Number(viewerFid),
      hash: hexToBuffer(hash),
    });
    if (message.isErr()) return;
    const cast = messageToCast(message.value);
    if (!cast) return;

    return (await this.getCastsFromData([cast], viewerFid))[0];
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
        rootParentUrl: cast.rootParentUrl || undefined,
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
    extraHashes?: string[],
  ): Promise<FarcasterCastV1[]> {
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

    return await this.getCasts(casts, viewerFid, undefined, extraHashes);
  }

  async getCasts(
    casts: BaseFarcasterCast[],
    viewerFid?: string,
    ancestorsFor?: string[],
    extraHashes?: string[],
  ) {
    let thread: string[] = [];

    const hashes = new Set<string>();
    if (extraHashes) {
      for (const hash of extraHashes) {
        hashes.add(hash);
      }
    }

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

    const allCasts = Array.from(new Set(relatedRawCasts.concat(casts)));

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
        .split(/\s+/)
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

    const [appFids, context, engagement, channels, users, embeds] =
      await Promise.all([
        this.getCastSignerAppFids(allCasts),
        this.getCastContext(
          allCasts.map((cast) => cast.hash),
          viewerFid,
        ),
        this.getCastEngagement(allCasts.map((cast) => cast.hash)),
        this.getChannels(Array.from(channelUrls), Array.from(channelIds)),
        this.getUsers(Array.from(fids), viewerFid),
        this.contentClient.getReferences(
          allCasts.flatMap((cast) =>
            cast.embedUrls.map((uri) => ({
              fid: cast.fid,
              hash: cast.hash,
              parentFid: cast.parentFid,
              parentHash: cast.parentHash,
              parentUrl: cast.parentUrl,
              uri,
              timestamp: new Date(cast.timestamp),
              text: cast.text,
              rootParentFid: cast.rootParentFid,
              rootParentHash: cast.rootParentHash,
              rootParentUrl: cast.rootParentUrl,
            })),
          ),
          true,
        ),
      ]);

    const userMap = users.reduce(
      (acc, user) => {
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUserV1>,
    );

    const channelMap = channels.reduce(
      (acc, channel) => {
        if (!channel || Object.keys(channel).length === 0) return acc;
        acc[channel.url] = channel;
        acc[channel.channelId] = channel;
        return acc;
      },
      {} as Record<string, Channel>,
    );

    const embedMap = embeds.data.reduce(
      (acc, embed) => {
        if (!embed) return acc;
        acc[embed.uri] = embed;
        return acc;
      },
      {} as Record<string, UrlContentResponse>,
    );

    const castMap = allCasts.reduce(
      (acc, cast, i) => {
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
          context: context[i],
          engagement: engagement[i],
        };
        return acc;
      },
      {} as Record<string, FarcasterCastV1>,
    );

    const castsToReturn = casts.map((cast) => {
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

    if (extraHashes) {
      castsToReturn.push(...extraHashes.map((hash) => castMap[hash]));
    }

    return castsToReturn;
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

    if (missingUrls.length === 0 && missingIds.length === 0) {
      return keys.map((key) => channelMap[key]);
    }

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

    const stillMissingKeys = keys.filter((key) => !channelMap[key]);
    if (stillMissingKeys.length > 0) {
      await this.cache.setNotChannels(stillMissingKeys);
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
        `(((to_tsvector('english', "value") @@ to_tsquery('english', '${sanitizeInput(
          query,
        ).replaceAll(
          " ",
          "<->",
        )}')) AND type IN (2, 6)) OR (type = 6 AND value LIKE '${sanitizeInput(
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

  async getAddressesForUserFilter(users: UserFilter) {
    let fidRequests: bigint[] = [];
    switch (users.type) {
      case UserFilterType.FID: {
        const user = (await this.getUserDatas([users.data.fid]))[0];
        return (
          user?.verifiedAddresses
            ?.filter(({ protocol }) => protocol === 0)
            .map(({ address }) => ({
              address,
              fid: user.fid,
            })) || []
        );
      }
      case UserFilterType.FOLLOWING: {
        const fids = await this.getUserFollowingFids(users.data.fid);
        if (fids.length > 0) {
          fidRequests = fids.map((fid) => BigInt(fid));
        }
        break;
      }
      case UserFilterType.FIDS: {
        const usersData = await this.getUserDatas(users.data.fids);
        return usersData.flatMap(
          (user) =>
            user.verifiedAddresses
              ?.filter(({ protocol }) => protocol === 0)
              .map(({ address }) => ({
                address,
                fid: user.fid,
              })) || [],
        );
      }
      case UserFilterType.POWER_BADGE: {
        const [following, holders] = await Promise.all([
          users.data.fid ? this.getUserFollowingFids(users.data.fid) : [],
          this.cache.getPowerBadgeUsers(),
        ]);

        const set = new Set(following);
        for (const fid of holders) {
          set.add(fid);
        }

        fidRequests = Array.from(set).map((fid) => BigInt(fid));
        break;
      }
    }

    const addresses = await this.client.farcasterVerification.findMany({
      where: {
        fid: {
          in: fidRequests,
        },
        protocol: 0,
        deletedAt: null,
      },
    });

    return addresses.map((address) => ({
      fid: address.fid.toString(),
      address: address.address,
    }));
  }

  async getFidsForAddresses(addresses: string[]) {
    const lowercasedAddresses = addresses.map((address) =>
      address.toLowerCase(),
    );
    const fids = await this.client.farcasterVerification.findMany({
      where: {
        address: {
          in: lowercasedAddresses,
        },
        protocol: 0,
      },
    });

    const addressMap = fids.reduce(
      (acc, cur) => {
        acc[cur.address] = cur.fid.toString();
        return acc;
      },
      {} as Record<string, string>,
    );

    return lowercasedAddresses.map((address) => addressMap[address]);
  }

  async getUsersForAddresses(addresses: string[], viewerFid?: string) {
    const fids = await this.client.farcasterVerification.findMany({
      where: {
        address: {
          in: addresses.map((address) => address.toLowerCase()),
        },
        protocol: 0,
      },
    });

    return await this.getUsers(
      fids.map(({ fid }) => fid.toString()),
      viewerFid,
    );
  }

  async getUsersForFilter(users: UserFilter, viewerFid?: string) {
    switch (users.type) {
      case UserFilterType.FID: {
        return await this.getUsers([users.data.fid], viewerFid);
      }
      case UserFilterType.FOLLOWING: {
        const fids = await this.getUserFollowingFids(users.data.fid);
        return await this.getUsers(fids, viewerFid);
      }
      case UserFilterType.FIDS: {
        return await this.getUsers(users.data.fids, viewerFid);
      }
      case UserFilterType.POWER_BADGE: {
        const [following, holders] = await Promise.all([
          users.data.fid ? this.getUserFollowingFids(users.data.fid) : [],
          this.cache.getPowerBadgeUsers(),
        ]);
        const set = new Set(following);
        for (const fid of holders) {
          set.add(fid);
        }
        return await this.getUsers(
          Array.from(set).map((fid) => fid.toString()),
          viewerFid,
        );
      }
    }
  }

  async getFidsForUsernames(usernames: string[]) {
    const cached = await this.cache.getFidsForUsernames(usernames);
    const cacheMap = cached.reduce(
      (acc, fid, i) => {
        if (!usernames[i] || !fid) return acc;
        acc[usernames[i]] = fid;
        return acc;
      },
      {} as Record<string, string>,
    );

    const missing = usernames.filter((username) => !cacheMap[username]);
    if (missing.length > 0) {
      const fetched = await this.client.farcasterUserData.findMany({
        where: {
          type: UserDataType.USERNAME,
          value: {
            in: missing,
          },
        },
      });

      for (const user of fetched) {
        cacheMap[user.value] = user.fid.toString();
      }

      await this.cache.setFidsForUsernames(
        missing.map((username) => cacheMap[username]),
        missing,
      );
    }

    return usernames.map((username) => cacheMap[username]);
  }

  async getUsers(
    fids: string[],
    viewerFid?: string,
  ): Promise<FarcasterUserV1[]> {
    if (fids.length === 0) return [];

    const [users, powerBadges, context, engagement] = await Promise.all([
      this.getUserDatas(fids),
      this.getUserBadges(fids),
      this.getUserContext(fids, viewerFid),
      this.getUserEngagement(fids),
    ]);

    return users.map((user, i) => ({
      ...user,
      engagement: engagement[i],
      context: context[i],
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

  async getUserEngagement(fids: string[]) {
    const cached = await this.cache.getUserEngagement(fids);
    const cacheMap = cached.reduce(
      (acc, engagement, i) => {
        if (!engagement) return acc;
        acc[fids[i]] = engagement;
        return acc;
      },
      {} as Record<string, FarcasterUserEngagement>,
    );

    const missing = fids.filter((fid) => !cacheMap[fid]);
    if (missing.length === 0) {
      return fids.map((fid) => cacheMap[fid]);
    }

    const fetched = await this.client.farcasterUserStats.findMany({
      where: { fid: { in: missing.map((fid) => BigInt(fid)) } },
      select: {
        fid: true,
        followers: true,
        following: true,
      },
    });

    const fetchedMap = fetched.reduce(
      (acc, engagement) => {
        acc[engagement.fid.toString()] = engagement;
        return acc;
      },
      {} as Record<string, FarcasterUserEngagement>,
    );

    const emptyState = {
      followers: 0,
      following: 0,
    };

    const stillMissing = missing.filter((fid) => !fetchedMap[fid]);
    for (const fid of stillMissing) {
      fetchedMap[fid] = emptyState;
    }

    await this.cache.setUserEngagement(
      Object.entries(fetchedMap).map(([fid, engagement]) => ({
        fid,
        ...engagement,
      })),
    );

    return fids.map((fid) => cacheMap[fid] || fetchedMap[fid]);
  }

  async getUserContext(
    fids: string[],
    viewerFid?: string,
  ): Promise<FarcasterUserContext[]> {
    if (!viewerFid) return [];

    const cached = await this.cache.getUserContext(viewerFid, fids);

    const cacheMap = cached.reduce(
      (acc, context, i) => {
        if (!context) return acc;
        acc[fids[i]] = context;
        return acc;
      },
      {} as Record<string, FarcasterUserContext>,
    );

    const missing = fids.filter((fid) => !cacheMap[fid]);
    if (missing.length === 0) {
      return fids.map((fid) => cacheMap[fid]);
    }

    const fetched = await this.client.farcasterLink.findMany({
      where: {
        OR: [
          {
            linkType: "follow",
            targetFid: BigInt(viewerFid),
            fid: {
              in: missing.map((fid) => BigInt(fid)),
            },
            deletedAt: null,
          },
          {
            linkType: "follow",
            fid: BigInt(viewerFid),
            targetFid: {
              in: missing.map((fid) => BigInt(fid)),
            },
            deletedAt: null,
          },
        ],
      },
    });

    const fetchedMap = fetched.flat().reduce(
      (acc, link) => {
        const fid = link.fid.toString();
        const targetFid = link.targetFid.toString();
        const key = fid === viewerFid ? targetFid : fid;
        if (!acc[key]) {
          acc[key] = { following: false, followers: false };
        }
        if (fid === viewerFid) {
          acc[key].following = true;
        } else {
          acc[key].followers = true;
        }
        return acc;
      },
      {} as Record<string, FarcasterUserContext>,
    );

    const stillMissing = missing.filter((fid) => !fetchedMap[fid]);
    for (const fid of stillMissing) {
      fetchedMap[fid] = { following: false, followers: false };
    }

    await this.cache.setUserContext(
      viewerFid,
      Object.entries(fetchedMap).map(([fid, context]) => [fid, context]),
    );

    return fids.map((fid) => cacheMap[fid] || fetchedMap[fid]);
  }

  async getUserBadges(fids: string[]): Promise<FarcasterUserBadges[]> {
    const powerBadges = await this.cache.getUserPowerBadges(fids);
    return powerBadges.map((powerBadge) => ({ powerBadge }));
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

  async getUserMutuals(
    fid: string,
    targetFid: string,
    cursor?: string,
  ): Promise<GetFarcasterUsersResponse> {
    const mutuals = await this.getAllUserMutuals(fid, targetFid);

    const cursorFid = decodeCursor(cursor)?.fid;

    const filteredMutals = cursorFid
      ? mutuals.filter((user) => Number(user) > Number(cursorFid))
      : mutuals;

    const users = await this.getUsers(
      filteredMutals
        .sort((a, b) => Number(a) - Number(b))
        .slice(0, MAX_PAGE_SIZE),
      fid,
    );

    return {
      data: users,
      nextCursor:
        users.length === MAX_PAGE_SIZE
          ? encodeCursor({
              fid: Number(users[users.length - 1]?.fid),
            })
          : undefined,
    };
  }

  async getUserMutualsPreview(fid: string, targetFid: string) {
    const cached = await this.cache.getMutualPreview(fid, targetFid);
    if (cached) return cached;

    const mutuals = await this.getAllUserMutuals(fid, targetFid);
    const users = await this.getUsers(mutuals.slice(0, 3));

    const data = {
      preview: users,
      total: mutuals.length,
    };

    await this.cache.setMutualPreview(fid, targetFid, data);

    return data;
  }

  async getAllUserMutuals(fid: string, targetFid: string) {
    const cached = await this.cache.getMutualFids(fid, targetFid);
    if (cached && cached.length > 0) return cached;

    const following = await this.getUserFollowingFids(fid);
    const mutuals = await this.client.farcasterLink.findMany({
      where: {
        fid: {
          in: following.map((user) => BigInt(user)),
        },
        targetFid: BigInt(targetFid),
        deletedAt: null,
      },
    });

    const mutualFids = mutuals.map((mutual) => mutual.fid.toString());

    await this.cache.setMutualFids(fid, targetFid, mutualFids);

    return mutualFids;
  }

  async getUserVerifiedAddresses(fid: string) {
    const addresses = await this.client.farcasterVerification.findMany({
      where: { fid: BigInt(fid), deletedAt: null },
    });

    return addresses.map((address) => address.address);
  }

  async getCastEngagement(
    hashes: string[],
  ): Promise<FarcasterCastEngagement[]> {
    const cached = await this.cache.getCastEngagement(hashes);
    const cacheMap = cached.reduce(
      (acc, engagement, i) => {
        if (!engagement) return acc;
        acc[hashes[i]] = engagement;
        return acc;
      },
      {} as Record<string, FarcasterCastEngagement>,
    );

    const missing = hashes.filter((hash) => !cacheMap[hash]);
    if (missing.length === 0) {
      return hashes.map((hash) => cacheMap[hash]);
    }

    const fetched = await this.client.farcasterCastStats.findMany({
      where: {
        hash: {
          in: missing,
        },
      },
      select: {
        hash: true,
        likes: true,
        recasts: true,
        replies: true,
        quotes: true,
      },
    });

    const fetchedMap = fetched.reduce(
      (acc, engagement) => {
        acc[engagement.hash] = engagement;
        return acc;
      },
      {} as Record<string, FarcasterCastEngagement>,
    );

    const emptyState = {
      likes: 0,
      recasts: 0,
      replies: 0,
      quotes: 0,
    };

    const stillMissing = missing.filter((hash) => !fetchedMap[hash]);
    for (const hash of stillMissing) {
      fetchedMap[hash] = emptyState;
    }

    await this.cache.setCastEngagement(
      Object.entries(fetchedMap).map(([hash, engagement]) => ({
        hash,
        ...engagement,
      })),
    );

    return hashes.map((hash) => cacheMap[hash] || fetchedMap[hash]);
  }

  async getCastContext(
    hashes: string[],
    viewerFid?: string,
  ): Promise<FarcasterCastContext[]> {
    if (!viewerFid) return [];

    const cached = await this.cache.getCastContext(viewerFid, hashes);

    const cacheMap = cached.reduce(
      (acc, context, i) => {
        if (!context) return acc;
        acc[hashes[i]] = context;
        return acc;
      },
      {} as Record<string, FarcasterCastContext>,
    );

    const missing = hashes.filter((hash) => !cacheMap[hash]);
    if (missing.length === 0) {
      return hashes.map((hash) => cacheMap[hash]);
    }

    const fetched = await this.client.farcasterCastReaction.findMany({
      where: {
        fid: BigInt(viewerFid),
        reactionType: {
          in: [0, 1],
        },
        targetHash: {
          in: missing,
        },
        deletedAt: null,
      },
    });

    const fetchedMap = fetched.reduce(
      (acc, reaction) => {
        if (!acc[reaction.targetHash]) {
          acc[reaction.targetHash] = {
            liked: false,
            recasted: false,
          };
        }
        if (reaction.reactionType === 1) {
          acc[reaction.targetHash].liked = true;
        }
        if (reaction.reactionType === 2) {
          acc[reaction.targetHash].recasted = true;
        }
        return acc;
      },
      {} as Record<string, FarcasterCastContext>,
    );

    const stillMissing = missing.filter((hash) => !fetchedMap[hash]);
    for (const hash of stillMissing) {
      fetchedMap[hash] = {
        liked: false,
        recasted: false,
      };
    }

    await this.cache.setCastContext(
      viewerFid,
      Object.entries(fetchedMap).map(([hash, context]) => [hash, context]),
    );

    return hashes.map((hash) => cacheMap[hash] || fetchedMap[hash]);
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
