import {
  HubRpcClient,
  UserDataType,
  getSSLHubRpcClient,
} from "@farcaster/hub-nodejs";
import {
  ContentAPIClient,
  FarcasterCacheClient,
  NookCacheClient,
} from "@nook/common/clients";
import {
  getCastEmbeds,
  getEmbedUrls,
  getMentions,
} from "@nook/common/farcaster";
import {
  FarcasterCast,
  Prisma,
  PrismaClient,
} from "@nook/common/prisma/farcaster";
import {
  BaseFarcasterCastV1,
  BaseFarcasterUserV1,
  Channel,
  ChannelFilter,
  ChannelFilterType,
  FarcasterCastContext,
  FarcasterCastEngagement,
  FarcasterCastV1,
  FarcasterFeedRequest,
  FarcasterUserContext,
  FarcasterUserV1,
  UrlContentResponse,
  UserFilter,
  UserFilterType,
} from "@nook/common/types";
import { decodeCursor, encodeCursor } from "@nook/common/utils";
import { FastifyInstance } from "fastify";

const MAX_PAGE_SIZE = 25;

function sanitizeInput(input: string): string {
  return input.replace(/[^a-zA-Z0-9\s./$]/g, "").substring(0, 100);
}

export class FarcasterService {
  private client: PrismaClient;
  private cache: FarcasterCacheClient;
  private contentApi: ContentAPIClient;
  private nook: NookCacheClient;
  private hub: HubRpcClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.farcaster.client;
    this.cache = new FarcasterCacheClient(fastify.redis.client);
    this.contentApi = new ContentAPIClient();
    this.nook = new NookCacheClient(fastify.redis.client);
    this.hub = getSSLHubRpcClient(process.env.HUB_RPC_ENDPOINT as string);
  }

  async getCasts(
    hashes: string[],
    viewerFid?: string,
  ): Promise<Record<string, FarcasterCastV1>> {
    const casts = await this.getBaseCasts(hashes);

    const relatedHashes = new Set<string>();
    const relatedUsers = new Set<string>();
    for (const cast of Object.values(casts)) {
      relatedHashes.add(cast.hash);
      relatedUsers.add(cast.user.fid);
      if (cast.parent) {
        relatedHashes.add(cast.parent.hash);
        relatedUsers.add(cast.parent.user.fid);
      }
      if (cast.rootParent) {
        relatedHashes.add(cast.rootParent.hash);
        relatedUsers.add(cast.rootParent.user.fid);
      }
      for (const embed of cast.embeds.casts) {
        relatedHashes.add(embed.hash);
        relatedUsers.add(embed.user.fid);
      }
      for (const mention of cast.mentions) {
        relatedUsers.add(mention.user.fid);
      }
    }

    const [castContexts, userContexts] = await Promise.all([
      this.getCastContexts(Array.from(relatedHashes), viewerFid),
      this.getUserContexts(Array.from(relatedUsers), viewerFid),
    ]);

    return Object.values(casts).reduce(
      (acc, cast) => {
        acc[cast.hash] = {
          ...cast,
          user: {
            ...cast.user,
            context: userContexts[cast.user.fid],
          },
          mentions: cast.mentions.map(({ user, position }) => ({
            user: {
              ...user,
              context: userContexts[user.fid],
            },
            position,
          })),
          parent: cast.parent
            ? {
                ...cast.parent,
                user: {
                  ...cast.parent.user,
                  context: userContexts[cast.parent.user.fid],
                },
                context: castContexts[cast.parent.hash],
              }
            : undefined,
          rootParent: cast.rootParent
            ? {
                ...cast.rootParent,
                user: {
                  ...cast.rootParent.user,
                  context: userContexts[cast.rootParent.user.fid],
                },
                context: castContexts[cast.rootParent.hash],
              }
            : undefined,
          embeds: {
            ...cast.embeds,
            casts: cast.embeds.casts.map((embed) => ({
              ...embed,
              user: {
                ...embed.user,
                context: userContexts[embed.user.fid],
              },
              context: castContexts[embed.hash],
            })),
          },
          context: castContexts[cast.hash],
        };
        return acc;
      },
      {} as Record<string, FarcasterCastV1>,
    );
  }

  async getCastContexts(
    hashes: string[],
    viewerFid?: string,
  ): Promise<Record<string, FarcasterCastContext>> {
    if (!viewerFid) return {};

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
    if (missing.length > 0) {
      const reactions = await this.client.farcasterCastReaction.findMany({
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

      const contexts: Record<string, FarcasterCastContext> = {};
      for (const reaction of reactions) {
        if (!contexts[reaction.targetHash]) {
          contexts[reaction.targetHash] = {
            liked: false,
            recasted: false,
          };
          if (reaction.reactionType === 1) {
            contexts[reaction.targetHash].liked = true;
          }
          if (reaction.reactionType === 2) {
            contexts[reaction.targetHash].recasted = true;
          }
        }
      }

      const stillMissing = missing.filter((hash) => !contexts[hash]);
      for (const hash of stillMissing) {
        contexts[hash] = {
          liked: false,
          recasted: false,
        };
      }

      await this.cache.setCastContext(viewerFid, Object.entries(contexts));

      for (const [hash, context] of Object.entries(contexts)) {
        cacheMap[hash] = context;
      }
    }

    return cacheMap;
  }

  async getBaseCasts(
    hashes: string[],
    disableCastEmbeds?: boolean,
  ): Promise<Record<string, BaseFarcasterCastV1>> {
    const cached = await this.cache.getCastsV1(hashes);
    const cacheMap = cached.reduce(
      (acc, cast) => {
        if (!cast) return acc;
        acc[cast.hash] = cast;
        return acc;
      },
      {} as Record<string, BaseFarcasterCastV1>,
    );

    const missing = hashes.filter((hash) => !cacheMap[hash]);
    if (missing.length > 0) {
      const casts = await this.client.farcasterCast.findMany({
        where: {
          hash: {
            in: missing,
          },
          deletedAt: null,
        },
      });

      const [signerAppFids, content, relatedUsers, engagement, relatedCasts] =
        await Promise.all([
          this.getSignerAppFids(casts),
          this.getUrlEmbeds(casts),
          this.getRelatedUsers(casts),
          this.getCastEngagement(casts),
          disableCastEmbeds
            ? ({} as Record<string, BaseFarcasterCastV1>)
            : this.getRelatedCasts(casts),
        ]);

      const baseCasts: BaseFarcasterCastV1[] = casts.map((cast) => ({
        hash: cast.hash,
        user: relatedUsers[cast.fid.toString()],
        timestamp: cast.timestamp.getTime(),
        text: cast.text,
        mentions: getMentions(cast).map(({ fid, position }) => ({
          user: relatedUsers[fid],
          position,
        })),
        embedHashes: getCastEmbeds(cast).map(({ hash }) => hash),
        embedUrls: getEmbedUrls(cast),
        rootParentFid: cast.rootParentFid?.toString(),
        rootParentHash: cast.rootParentHash || undefined,
        rootParentUrl: cast.rootParentUrl || undefined,
        parentFid: cast.parentFid?.toString(),
        parentHash: cast.parentHash || undefined,
        parentUrl: cast.parentUrl || undefined,
        signer: cast.signer,
        appFid: signerAppFids[cast.signer],
        parent: cast.parentHash ? relatedCasts[cast.parentHash] : undefined,
        rootParent: cast.rootParentHash
          ? relatedCasts[cast.rootParentHash]
          : undefined,
        embeds: {
          urls: getEmbedUrls(cast).map((url) => content[url]),
          casts: getCastEmbeds(cast).map(({ hash }) => relatedCasts[hash]),
        },
        engagement: engagement[cast.hash],
      }));

      await this.cache.setCastsV1(baseCasts);

      for (const cast of baseCasts) {
        cacheMap[cast.hash] = cast;
      }
    }

    return cacheMap;
  }

  async getCastEngagement(
    casts: FarcasterCast[],
  ): Promise<Record<string, FarcasterCastEngagement>> {
    const engagement = await this.client.farcasterCastStats.findMany({
      where: {
        hash: {
          in: casts.map((cast) => cast.hash),
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

    return engagement.reduce(
      (acc, cast) => {
        acc[cast.hash] = {
          likes: cast.likes,
          recasts: cast.recasts,
          replies: cast.replies,
          quotes: cast.quotes,
        };
        return acc;
      },
      {} as Record<string, FarcasterCastEngagement>,
    );
  }

  async getRelatedUsers(casts: FarcasterCast[]) {
    const users = new Set<string>();
    for (const cast of casts) {
      users.add(cast.fid.toString());
      for (const mention of getMentions(cast)) {
        users.add(mention.fid);
      }
    }
    return await this.getBaseUsers(Array.from(users));
  }

  async getRelatedCasts(casts: FarcasterCast[]) {
    const hashes = new Set<string>();
    for (const cast of casts) {
      if (cast.parentHash) hashes.add(cast.parentHash);
      if (cast.rootParentHash !== cast.hash) hashes.add(cast.rootParentHash);
      for (const embed of getCastEmbeds(cast)) {
        hashes.add(embed.hash);
      }
    }

    return await this.getBaseCasts(Array.from(hashes), true);
  }

  async getUrlEmbeds(
    casts: FarcasterCast[],
  ): Promise<Record<string, UrlContentResponse>> {
    const references = casts.flatMap((cast) => {
      const embeds = getEmbedUrls(cast);
      return embeds.map((url) => ({
        fid: cast.fid.toString(),
        hash: cast.hash,
        parentFid: cast.parentFid?.toString(),
        parentHash: cast.parentHash || undefined,
        parentUrl: cast.parentUrl || undefined,
        uri: url,
        timestamp: new Date(cast.timestamp),
        text: cast.text,
        rootParentFid: cast.rootParentFid?.toString(),
        rootParentHash: cast.rootParentHash || undefined,
        rootParentUrl: cast.rootParentUrl || undefined,
      }));
    });

    const embeds = await this.contentApi.getReferences(references);
    return embeds.data.reduce(
      (acc, embed) => {
        acc[embed.uri] = embed;
        return acc;
      },
      {} as Record<string, UrlContentResponse>,
    );
  }

  async getUsers(
    fids: string[],
    viewerFid?: string,
  ): Promise<Record<string, FarcasterUserV1>> {
    const [users, contexts] = await Promise.all([
      this.getBaseUsers(fids),
      this.getUserContexts(fids, viewerFid),
    ]);

    return fids.reduce(
      (acc, fid) => {
        acc[fid] = {
          ...users[fid],
          context: contexts[fid],
        };
        return acc;
      },
      {} as Record<string, FarcasterUserV1>,
    );
  }

  async getUserContexts(
    fids: string[],
    viewerFid?: string,
  ): Promise<Record<string, FarcasterUserContext>> {
    if (!viewerFid) return {};

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
    if (missing.length > 0) {
      const links = await this.client.farcasterLink.findMany({
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

      const contexts: Record<string, FarcasterUserContext> = {};
      for (const link of links) {
        const fid = link.fid.toString();
        const targetFid = link.targetFid.toString();
        if (fid === viewerFid) {
          if (!contexts[targetFid]) {
            contexts[targetFid] = {
              following: false,
              followers: false,
            };
          }
          contexts[targetFid].following = true;
        } else {
          if (!contexts[fid]) {
            contexts[fid] = {
              following: false,
              followers: false,
            };
          }
          contexts[fid].followers = true;
        }
      }

      const stillMissing = missing.filter((fid) => !contexts[fid]);
      for (const fid of stillMissing) {
        contexts[fid] = {
          following: false,
          followers: false,
        };
      }

      await this.cache.setUserContext(viewerFid, Object.entries(contexts));

      for (const [fid, context] of Object.entries(contexts)) {
        cacheMap[fid] = context;
      }
    }

    return cacheMap;
  }

  async getBaseUsers(
    fids: string[],
  ): Promise<Record<string, BaseFarcasterUserV1>> {
    const uniqueFids = Array.from(new Set(fids));
    const cached = await this.cache.getUsersV1(uniqueFids);
    const cacheMap = cached.reduce(
      (acc, user) => {
        if (!user) return acc;
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, BaseFarcasterUserV1>,
    );

    const missing = fids.filter((fid) => !cacheMap[fid]);
    if (missing.length > 0) {
      const missingFids = missing.map((fid) => BigInt(fid));
      const [userDatas, verifications, engagement, badges] = await Promise.all([
        this.client.farcasterUserData.findMany({
          where: {
            fid: {
              in: missingFids,
            },
          },
        }),
        this.client.farcasterVerification.findMany({
          where: {
            fid: {
              in: missingFids,
            },
          },
        }),
        this.client.farcasterUserStats.findMany({
          where: {
            fid: {
              in: missingFids,
            },
          },
        }),
        this.cache.getUserPowerBadges(missing),
      ]);

      const users: Record<string, BaseFarcasterUserV1> = {};
      for (const userData of userDatas) {
        const fid = userData.fid.toString();
        if (!users[fid]) {
          users[fid] = {
            fid,
            verifiedAddresses: [],
            engagement: {
              followers: 0,
              following: 0,
            },
            badges: {
              powerBadge: false,
            },
          };
        }
        switch (userData.type) {
          case UserDataType.USERNAME:
            users[fid].username = userData.value;
            break;
          case UserDataType.PFP:
            users[fid].pfp = userData.value;
            break;
          case UserDataType.DISPLAY:
            users[fid].displayName = userData.value;
            break;
          case UserDataType.BIO:
            users[fid].bio = userData.value;
            break;
          case UserDataType.URL:
            users[fid].url = userData.value;
            break;
        }
      }

      for (const verification of verifications) {
        const fid = verification.fid.toString();
        if (!users[fid]) {
          users[fid] = {
            fid,
            verifiedAddresses: [],
            engagement: {
              followers: 0,
              following: 0,
            },
            badges: {
              powerBadge: false,
            },
          };
        }
        users[fid].verifiedAddresses.push({
          protocol: verification.protocol,
          address: verification.address,
        });
      }

      for (const stat of engagement) {
        const fid = stat.fid.toString();
        if (!users[fid]) {
          users[fid] = {
            fid,
            verifiedAddresses: [],
            engagement: {
              followers: 0,
              following: 0,
            },
            badges: {
              powerBadge: false,
            },
          };
        }
        users[fid].engagement.followers = stat.followers;
        users[fid].engagement.following = stat.following;
      }

      for (let i = 0; i < missing.length; i++) {
        const fid = missing[i];
        if (!users[fid]) {
          users[fid] = {
            fid,
            verifiedAddresses: [],
            engagement: {
              followers: 0,
              following: 0,
            },
            badges: {
              powerBadge: false,
            },
          };
        }
        users[fid].badges = {
          powerBadge: badges[i],
        };
      }

      await this.cache.setUsersV1(Object.values(users));

      for (const user of Object.values(users)) {
        cacheMap[user.fid] = user;
      }
    }

    return cacheMap;
  }

  async getSignerAppFids(
    casts: FarcasterCast[],
  ): Promise<Record<string, string>> {
    const uniqueSigners = Array.from(new Set(casts.map((cast) => cast.signer)));
    const cached = await this.cache.getAppFidsV1(uniqueSigners);
    const cacheMap = cached.reduce(
      (acc, fid, i) => {
        if (!fid) return acc;
        acc[uniqueSigners[i]] = fid;
        return acc;
      },
      {} as Record<string, string>,
    );

    const missing = casts.filter((cast) => !cacheMap[cast.signer]);
    if (missing.length > 0) {
      const appFids = await Promise.all(
        missing.map((cast) => this.getSignerAppFid(cast)),
      );

      const appFidMap: Record<string, string> = {};
      for (const [i, cast] of missing.entries()) {
        const appFid = appFids[i];
        if (!appFid) continue;
        appFidMap[cast.signer] = appFid;
        cacheMap[cast.signer] = appFid;
      }

      await this.cache.setAppFidsV1(
        Object.entries(appFidMap).map(([signer, fid]) => [signer, fid]),
      );
    }

    return cacheMap;
  }

  async getSignerAppFid(cast: FarcasterCast): Promise<string | undefined> {
    const response = await this.hub.getOnChainSigner({
      fid: Number(cast.fid),
      signer: Buffer.from(cast.signer.replace("0x", ""), "hex"),
    });
    if (response.isErr()) {
      console.error(
        `ERROR: Failed to get signer appId. userId: ${cast.fid} signer: ${cast.signer}`,
        response.error,
      );
      return;
    }
    const event = response.value;
    if (!event.signerEventBody?.metadata) {
      console.error(
        `No signerEventBody or metadata for signer event. userId: ${cast.fid} signer: ${cast.signer}`,
      );
      return;
    }
    const metadata = event.signerEventBody.metadata;
    // metadata is abi-encoded; skip the first 32 bytes which contain the pointer
    // to start of struct
    const clientFid = BigInt(
      `0x${Buffer.from(metadata.subarray(32, 64)).toString("hex")}`,
    );

    if (!clientFid) {
      console.error(
        `Failed to parse event metadata. userId: ${cast.fid} signer: ${cast.signer}`,
      );
      return;
    }

    return clientFid.toString();
  }

  async getCastFeed(req: FarcasterFeedRequest, viewerFid?: string) {
    const { filter, context, cursor, limit } = req;
    const { channels, users, text, includeReplies, onlyReplies, minTimestamp } =
      filter;

    const conditions: string[] = ['"deletedAt" IS NULL'];

    if (text) {
      const queryConditions = text.map(
        (q) =>
          `(to_tsvector('english', "text") @@ to_tsquery('english', '${sanitizeInput(
            q,
          ).replaceAll(" ", "<->")}'))`,
      );
      conditions.push(`(${queryConditions.join(" OR ")})`);
    }

    const [userCondition, channelCondition, muteCondition] = await Promise.all([
      this.getUserFilter(users),
      this.getChannelFilter(channels),
      this.getMuteFilter(context?.viewerFid),
    ]);

    if (userCondition) {
      conditions.push(userCondition);
    }
    if (channelCondition) {
      conditions.push(channelCondition);
    }
    if (muteCondition?.words) {
      conditions.push(
        `NOT (${muteCondition.words
          .map(
            (word) =>
              `to_tsvector('english', "text") @@ to_tsquery('english', '${sanitizeInput(
                word,
              ).replaceAll(" ", "<->")}')`,
          )
          .join(" OR ")})`,
      );
    }

    if (muteCondition?.users) {
      conditions.push(
        `"fid" NOT IN (${muteCondition.users
          .map((fid) => BigInt(fid))
          .join(",")})`,
      );
    }

    if (muteCondition?.channels) {
      if (onlyReplies)
        conditions.push(
          `"rootParentUrl" NOT IN ('${muteCondition.channels.join("','")}')`,
        );
    }

    if (cursor) {
      const decodedCursor = decodeCursor(cursor);
      if (decodedCursor) {
        conditions.push(
          `"timestamp" < '${new Date(decodedCursor.timestamp).toISOString()}'`,
        );
      }
    }

    if (minTimestamp) {
      conditions.push(
        `"timestamp" > '${new Date(minTimestamp).toISOString()}'`,
      );
    }

    if (onlyReplies) {
      conditions.push(`"parentHash" IS NOT NULL`);
    } else if (!includeReplies) {
      conditions.push(`"parentHash" IS NULL`);
    }

    const hashes = await this.client.$queryRaw<{ hash: string }[]>(
      Prisma.sql([
        `
            SELECT "hash"
            FROM "FarcasterCast"
            WHERE ${conditions.join(" AND ")}
            ORDER BY "timestamp" DESC
            LIMIT ${limit || MAX_PAGE_SIZE}
          `,
      ]),
    );

    const casts = await this.getCasts(
      hashes.map((hash) => hash.hash),
      viewerFid,
    );
    const data = hashes.map((hash) => casts[hash.hash]);

    return {
      data,
      nextCursor:
        data.length === MAX_PAGE_SIZE
          ? encodeCursor({
              timestamp: data[data.length - 1]?.timestamp,
            })
          : undefined,
    };
  }

  async getUserFilter(users?: UserFilter) {
    if (!users) return;

    switch (users.type) {
      case UserFilterType.FOLLOWING: {
        const fids = await this.getFollowingFids(users.data.fid);
        if (fids.length > 0) {
          return `"FarcasterCast"."fid" IN (${fids.join(",")})`;
        }
        break;
      }
      case UserFilterType.FIDS:
        if (users.data.fids.length > 0) {
          return `"FarcasterCast"."fid" IN (${users.data.fids
            .map((fid) => BigInt(fid))
            .join(",")})`;
        }
        break;
      case UserFilterType.POWER_BADGE: {
        const [following, holders] = await Promise.all([
          users.data.fid ? this.getFollowingFids(users.data.fid) : [],
          this.cache.getPowerBadgeUsers(),
        ]);

        const set = new Set(following);
        for (const fid of holders) {
          set.add(BigInt(fid));
        }
        return `"FarcasterCast"."fid" IN (${Array.from(set).join(",")})`;
      }
    }
  }

  async getFollowingFids(fid: string) {
    const cachedFollowing = await this.cache.getUserFollowingFids(fid);
    if (cachedFollowing.length > 0) {
      return cachedFollowing.map((fid) => BigInt(fid));
    }
    const following = await this.client.farcasterLink.findMany({
      where: {
        linkType: "follow",
        fid: BigInt(fid),
        deletedAt: null,
      },
    });
    await this.cache.setUserFollowingFids(
      fid,
      following.map((link) => link.targetFid.toString()),
    );
    return following.map((link) => link.targetFid);
  }

  async getChannelFilter(channels?: ChannelFilter) {
    if (!channels) return;

    switch (channels.type) {
      case ChannelFilterType.CHANNEL_IDS: {
        const response = (
          await this.cache.getChannels(channels.data.channelIds)
        ).filter(Boolean) as Channel[];
        return `"rootParentUrl" IN ('${response
          .map((c) => c.url)
          .join("','")}')`;
      }
      case ChannelFilterType.CHANNEL_URLS: {
        return `"rootParentUrl" IN ('${channels.data.urls.join("','")}')`;
      }
    }
  }

  async getMuteFilter(fid?: string) {
    if (!fid) return;

    let mutes: string[] = [];
    if (fid) {
      try {
        mutes = await this.nook.getUserMutes(fid);
      } catch (e) {}
    }

    const channels = mutes
      .filter((m) => m.startsWith("channel:"))
      .map((m) => m.split(":")[1]);

    const users = mutes
      .filter((m) => m.startsWith("user:"))
      .map((m) => m.split(":")[1]);

    const words = mutes
      .filter((m) => m.startsWith("word:"))
      .map((m) => m.split(":")[1]);

    return {
      channels: channels.length > 0 ? channels : undefined,
      users: users.length > 0 ? users : undefined,
      words: words.length > 0 ? words : undefined,
    };
  }
}
