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
  hexToBuffer,
  messageToCast,
} from "@nook/common/farcaster";
import {
  FarcasterCast,
  FarcasterCastStats,
  FarcasterParentUrl,
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
  FetchCastsResponse,
  FetchUsersResponse,
  UrlContentResponse,
  UserFilter,
  UserFilterType,
} from "@nook/common/types";
import {
  decodeCursor,
  decodeCursorTimestamp,
  encodeCursor,
} from "@nook/common/utils";
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
  async getCast(
    hash: string,
    viewerFid?: string,
  ): Promise<FarcasterCastV1 | undefined> {
    const casts = await this.getCastsForHashes([hash], viewerFid);
    const cast = casts[hash];
    if (!cast) return;

    let relations = await this.cache.getCastRelationsV1(hash);
    if (!relations) {
      const relatedCasts = await this.client.farcasterCast.findMany({
        where: {
          rootParentHash: cast.rootParentHash || cast.hash,
          deletedAt: null,
        },
        orderBy: {
          timestamp: "asc",
        },
        select: {
          fid: true,
          hash: true,
          parentHash: true,
          parentFid: true,
        },
      });

      const tree = relatedCasts.reduce(
        (acc, cast) => {
          acc[cast.hash] = cast.parentHash;
          return acc;
        },
        {} as Record<string, string | null>,
      );

      const ancestors: string[] = [];
      const thread: string[] = [];

      let currentHash: string | null = cast.parentHash || null;
      while (currentHash) {
        ancestors.push(currentHash);
        currentHash = tree[currentHash];
      }

      currentHash = cast.hash;
      while (currentHash) {
        const nextCast = relatedCasts.find(
          (cast) =>
            cast.parentHash === currentHash && cast.fid === cast.parentFid,
        );
        if (!nextCast) break;
        currentHash = nextCast.hash;
        thread.push(currentHash);
      }

      relations = {
        ancestors,
        thread,
      };
    }

    const allCasts = [...relations.ancestors, ...relations.thread];
    if (allCasts.length === 0) {
      return cast;
    }

    const relatedCasts = await this.getCastsForHashes(allCasts, viewerFid);

    return {
      ...cast,
      ancestors: relations.ancestors.map((hash) => relatedCasts[hash]),
      thread: relations.thread.map((hash) => relatedCasts[hash]),
    };
  }

  async getCastsForHashes(
    hashes: string[],
    viewerFid?: string,
  ): Promise<Record<string, FarcasterCastV1>> {
    const casts = await this.getBaseCasts(hashes, viewerFid);

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
      for (const embed of cast.embedCasts) {
        relatedHashes.add(embed.hash);
        relatedUsers.add(embed.user.fid);
      }
      for (const mention of cast.mentions) {
        relatedUsers.add(mention.user.fid);
      }
    }

    const [castContexts, userContexts, embeds] = await Promise.all([
      this.getCastContexts(Array.from(relatedHashes), viewerFid),
      this.getUserContexts(Array.from(relatedUsers), viewerFid),
      this.getCastRelatedEmbeds(Object.values(casts)),
    ]);

    const formatCast = (
      cast?: BaseFarcasterCastV1,
    ): FarcasterCastV1 | undefined => {
      if (!cast) return;
      return {
        ...cast,
        user: {
          ...cast.user,
          context: userContexts[cast.user.fid],
        },
        context: castContexts[cast.hash],
        embeds: cast.embedUrls.map((url) => embeds[url]).filter(Boolean),
        parent: formatCast(cast.parent),
        rootParent: formatCast(cast.rootParent),
        embedCasts: cast.embedCasts
          .map(formatCast)
          .filter(Boolean) as FarcasterCastV1[],
      };
    };

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
          parent: formatCast(cast.parent),
          rootParent: formatCast(cast.rootParent),
          embedCasts: cast.embedCasts
            .map(formatCast)
            .filter(Boolean) as FarcasterCastV1[],
          context: castContexts[cast.hash],
          embeds: cast.embedUrls.map((url) => embeds[url]).filter(Boolean),
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
    viewerFid?: string,
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

      const stillMissing = missing.filter(
        (hash) => !casts.find((cast) => cast.hash === hash),
      );
      if (stillMissing.length > 0 && viewerFid) {
        const missingCasts = await Promise.all(
          stillMissing.map(async (hash) => {
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
        casts.push(...(missingCasts.filter(Boolean) as FarcasterCast[]));
      }

      const [signerAppFids, relatedUsers, engagement, channels, relatedCasts] =
        await Promise.all([
          this.getCastSignerAppFids(casts),
          this.getCastRelatedUsers(casts),
          this.getCastEngagement(casts),
          this.getCastRelatedChannels(casts),
          disableCastEmbeds
            ? ({} as Record<string, BaseFarcasterCastV1>)
            : this.getCastRelatedCasts(casts, viewerFid),
        ]);

      const baseCasts: BaseFarcasterCastV1[] = casts.map((cast) => {
        const channelMentions = cast.text.split(" ").reduce(
          (acc, word) => {
            if (!word.startsWith("/")) return acc;
            const position = cast.text.indexOf(word, acc.lastIndex);
            const channel = channels[word.slice(1)];
            if (channel) {
              acc.mentions.push({
                channel,
                position: Buffer.from(
                  cast.text.slice(0, position),
                ).length.toString(),
              });
            }
            acc.lastIndex = position + word.length;
            return acc;
          },
          { mentions: [], lastIndex: 0 } as {
            mentions: {
              channel: Channel;
              position: string;
            }[];
            lastIndex: number;
          },
        );

        let parent = undefined;
        if (cast.parentHash) {
          parent = relatedCasts[cast.parentHash];
          if (parent) {
            parent.parent = undefined;
            parent.rootParent = undefined;
          }
        }

        const embedCasts = [];
        for (const embed of getCastEmbeds(cast)) {
          const relatedEmbed = relatedCasts[embed.hash];
          if (relatedEmbed) {
            relatedEmbed.parent = undefined;
            relatedEmbed.rootParent = undefined;
            embedCasts.push(relatedEmbed);
          }
        }

        return {
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
          embedCasts,
          rootParent: cast.rootParentHash
            ? relatedCasts[cast.rootParentHash]
            : undefined,
          rootParentFid: cast.rootParentFid?.toString(),
          rootParentHash: cast.rootParentHash || undefined,
          rootParentUrl: cast.rootParentUrl || undefined,
          parent,
          parentFid: cast.parentFid?.toString(),
          parentHash: cast.parentHash || undefined,
          parentUrl: cast.parentUrl || undefined,
          channel: cast.parentUrl ? channels[cast.parentUrl] : undefined,
          channelMentions: channelMentions.mentions,
          signer: cast.signer,
          appFid: signerAppFids[cast.signer],
          engagement: engagement[cast.hash],
        };
      });

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

    const engagementMap = engagement.reduce(
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

    const missing = casts.filter((cast) => !engagementMap[cast.hash]);
    for (const cast of missing) {
      engagementMap[cast.hash] = {
        likes: 0,
        recasts: 0,
        replies: 0,
        quotes: 0,
      };
    }

    return engagementMap;
  }

  async getCastRelatedChannels(casts: FarcasterCast[]) {
    const channelIds = new Set<string>();
    const channelUrls = new Set<string>();

    for (const cast of casts) {
      if (cast.parentUrl) {
        channelUrls.add(cast.parentUrl);
      }
      for (const channelId of this.parseChannelMentions(cast.text)) {
        channelIds.add(channelId);
      }
    }

    return await this.getChannels(
      Array.from(channelUrls),
      Array.from(channelIds),
    );
  }

  async getCastRelatedUsers(casts: FarcasterCast[]) {
    const users = new Set<string>();
    for (const cast of casts) {
      users.add(cast.fid.toString());
      for (const mention of getMentions(cast)) {
        users.add(mention.fid);
      }
    }
    return await this.getBaseUsers(Array.from(users));
  }

  async getCastRelatedCasts(casts: FarcasterCast[], viewerFid?: string) {
    const hashes = new Set<string>();
    for (const cast of casts) {
      if (cast.parentHash) hashes.add(cast.parentHash);
      if (cast.rootParentHash !== cast.hash) hashes.add(cast.rootParentHash);
      for (const embed of getCastEmbeds(cast)) {
        hashes.add(embed.hash);
      }
    }

    return await this.getBaseCasts(Array.from(hashes), viewerFid, true);
  }

  async getCastRelatedEmbeds(
    casts: BaseFarcasterCastV1[],
  ): Promise<Record<string, UrlContentResponse>> {
    const castToReference = (url: string, cast: BaseFarcasterCastV1) => ({
      fid: cast.user.fid,
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
    });

    const references = casts.flatMap((cast) => {
      const values = [];
      for (const url of cast.embedUrls) {
        values.push(castToReference(url, cast));
      }
      if (cast.parent) {
        for (const url of cast.parent.embedUrls) {
          values.push(castToReference(url, cast.parent));
        }
      }
      if (cast.rootParent) {
        for (const url of cast.rootParent.embedUrls) {
          values.push(castToReference(url, cast.rootParent));
        }
      }
      for (const embed of cast.embedCasts) {
        for (const url of embed.embedUrls) {
          values.push(castToReference(url, embed));
        }
      }
      return values;
    });

    const embeds = await this.contentApi.getReferences(references);
    return embeds.data.reduce(
      (acc, embed) => {
        if (!embed) return acc;
        acc[embed.uri] = embed;
        return acc;
      },
      {} as Record<string, UrlContentResponse>,
    );
  }

  async getCastSignerAppFids(
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
        missing.map((cast) => this.getCastSignerAppFid(cast)),
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

  async getCastSignerAppFid(cast: FarcasterCast): Promise<string | undefined> {
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

  async getUserByFid(
    fid: string,
    viewerFid?: string,
  ): Promise<FarcasterUserV1 | undefined> {
    const users = await this.getUsers([fid], viewerFid);
    return users[fid];
  }

  async getUserByUsername(
    username: string,
    viewerFid?: string,
  ): Promise<FarcasterUserV1 | undefined> {
    const usersByUsername = await this.cache.getUsersByUsernameV1([username]);
    if (usersByUsername[0]) {
      const context = await this.getUserContexts(
        [usersByUsername[0].fid],
        viewerFid,
      );
      return {
        ...usersByUsername[0],
        context: context[usersByUsername[0].fid],
      };
    }

    const userData = await this.client.farcasterUserData.findFirst({
      where: {
        type: UserDataType.USERNAME,
        value: username,
      },
    });
    if (!userData?.fid) return;

    const inputFid = userData.fid.toString();
    const users = await this.getUsers([inputFid], viewerFid);
    return users[inputFid];
  }

  async getUsersForAddresses(
    addresses: string[],
    viewerFid?: string,
  ): Promise<FarcasterUserV1[]> {
    const fids = await this.getFidsForAddresses(addresses);
    const users = await this.getUsers(fids, viewerFid);
    return Object.values(users);
  }

  async getUsersForFilter(filter: UserFilter, viewerFid?: string) {
    const fids = await this.getFidsFromUserFilter(filter);
    const users = await this.getUsers(fids, viewerFid);
    return Object.values(users);
  }

  async getAddressesForFilter(
    filter: UserFilter,
  ): Promise<{ fid: string; address: string }[]> {
    const fids = await this.getFidsFromUserFilter(filter);
    const verifications = await this.client.farcasterVerification.findMany({
      where: {
        fid: {
          in: fids.map((fid) => BigInt(fid)),
        },
        protocol: 0,
      },
    });
    return verifications.map((verification) => ({
      fid: verification.fid.toString(),
      address: verification.address,
    }));
  }

  async getFidsForAddresses(addresses: string[]): Promise<string[]> {
    const lowercased = addresses.map((address) => address.toLowerCase());
    const verifications = await this.getVerificationsForAddresses(lowercased);
    return verifications.map((verification) => verification.fid.toString());
  }

  async getVerificationsForAddresses(addresses: string[]) {
    return this.client.farcasterVerification.findMany({
      where: {
        address: {
          in: addresses.map((address) => address.toLowerCase()),
        },
        protocol: 0,
      },
    });
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
        const response = await fetch(
          "https://api.warpcast.com/v2/all-channels",
        );
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
    }

    return channelMap;
  }

  async getCasts(req: FarcasterFeedRequest, viewerFid?: string) {
    const { filter, context, cursor, limit } = req;
    const {
      channels,
      users,
      text,
      includeReplies,
      onlyReplies,
      onlyFrames,
      contentTypes,
      embeds,
    } = filter;

    if (
      onlyFrames ||
      (contentTypes && contentTypes.length > 0) ||
      (embeds && embeds.length > 0)
    ) {
      const response = await this.contentApi.getContentFeed(req);
      const casts = await this.getCastsForHashes(
        response.data,
        viewerFid || context?.viewerFid,
      );
      return {
        data: response.data.map((hash) => casts[hash]).filter(Boolean),
        nextCursor: response.nextCursor,
      };
    }

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
      this.getUserFilterCondition(users),
      this.getChannelFilterCondition(channels),
      this.getMuteFilterCondition(context?.viewerFid),
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

    const casts = await this.getCastsForHashes(
      hashes.map((hash) => hash.hash),
      viewerFid || context?.viewerFid,
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

  async getUserFilterCondition(users?: UserFilter) {
    if (!users) return;
    const fids = await this.getFidsFromUserFilter(users);
    if (fids.length === 0) return;
    return `"FarcasterCast"."fid" IN (${fids.join(",")})`;
  }

  async getChannelFilterCondition(channels?: ChannelFilter) {
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

  async getMuteFilterCondition(fid?: string) {
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

  async getFidsFromUserFilter(users: UserFilter) {
    switch (users.type) {
      case UserFilterType.FOLLOWING: {
        const fids = await this.getUserFollowingFids(users.data.fid);
        return fids.map((fid) => fid.toString());
      }
      case UserFilterType.FID:
        return [users.data.fid];
      case UserFilterType.FIDS:
        return users.data.fids;
      case UserFilterType.POWER_BADGE: {
        const [following, holders] = await Promise.all([
          users.data.fid ? this.getUserFollowingFids(users.data.fid) : [],
          this.cache.getPowerBadgeUsers(),
        ]);

        const set = new Set(following.map((fid) => fid.toString()));
        for (const fid of holders) {
          set.add(fid);
        }
        return Array.from(set);
      }
      default:
        return [];
    }
  }

  async getUserFollowingFids(fid: string) {
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

  async getUserFollowers(
    fid: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<FetchUsersResponse> {
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
      data: fids.map((fid) => users[fid]),
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
  ): Promise<FetchUsersResponse> {
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
      data: fids.map((fid) => users[fid]),
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
  ): Promise<FetchUsersResponse> {
    const mutuals = await this.getAllUserMutuals(fid, targetFid);

    const cursorFid = decodeCursor(cursor)?.fid;

    const filteredMutals = cursorFid
      ? mutuals.filter((user) => Number(user) > Number(cursorFid))
      : mutuals;

    const sortedMutals = filteredMutals
      .sort((a, b) => Number(a) - Number(b))
      .slice(0, MAX_PAGE_SIZE);

    const users = await this.getUsers(sortedMutals, fid);

    return {
      data: sortedMutals.map((fid) => users[fid.toString()]),
      nextCursor:
        sortedMutals.length === MAX_PAGE_SIZE
          ? encodeCursor({
              fid: Number(sortedMutals[sortedMutals.length - 1]),
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
      preview: Object.values(users),
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

  async searchUsers(
    query?: string,
    limit?: number,
    cursor?: string,
    viewerFid?: string,
  ): Promise<FetchUsersResponse> {
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

    const data = await this.client.$queryRaw<
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
      data.map(({ fid }) => fid.toString()),
      viewerFid,
    );
    return {
      data: data.map(({ fid }) => users[fid.toString()]),
      nextCursor:
        data.length === MAX_PAGE_SIZE
          ? encodeCursor({
              followers: data[data.length - 1]?.followers,
            })
          : undefined,
    };
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
    const data = await this.client.$queryRaw<
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

    const channels = await this.getChannels(data.map((channel) => channel.url));

    return {
      data: data.map((channel) => channels[channel.url]),
      nextCursor:
        data.length === MAX_PAGE_SIZE
          ? encodeCursor({
              casts: data[data.length - 1].casts,
            })
          : undefined,
    };
  }
  async getCastLikes(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<FetchUsersResponse> {
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
      data: fids.map((fid) => users[fid]),
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
  ): Promise<FetchUsersResponse> {
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
      data: fids.map((fid) => users[fid]),
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
  ): Promise<FetchCastsResponse> {
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

    const hashes = embeds.map((embed) => embed.hash);
    const casts = await this.getCastsForHashes(hashes, viewerFid);

    const data = hashes.map((hash) => casts[hash]);
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

  async getNewCastReplies(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<FetchCastsResponse> {
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
      const hashes = slicedCached.map((reply) => reply.hash);
      const data = await this.getCastsForHashes(hashes, viewerFid);

      return {
        data: hashes.map((hash) => data[hash]),
        nextCursor:
          slicedCached.length === MAX_PAGE_SIZE
            ? encodeCursor({
                hash: slicedCached[slicedCached.length - 1].hash,
                score: slicedCached[slicedCached.length - 1].score,
              })
            : undefined,
      };
    }

    const casts = await this.client.farcasterCast.findMany({
      where: {
        parentHash: hash,
        deletedAt: null,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    const scoredReplies = casts.map((reply) => ({
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

    const hashes = slicedReplies.map((reply) => reply.reply.hash);
    const data = await this.getCastsForHashes(hashes, viewerFid);
    return {
      data: hashes.map((hash) => data[hash]),
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
  ): Promise<FetchCastsResponse> {
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
      const hashes = slicedCached.map((reply) => reply.hash);
      const data = await this.getCastsForHashes(hashes, viewerFid);

      return {
        data: hashes.map((hash) => data[hash]),
        nextCursor:
          slicedCached.length === MAX_PAGE_SIZE
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

    const casts = await this.client.$queryRaw<
      (FarcasterCast & { likes: number })[]
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

    const scoredReplies = casts.map((reply) => ({
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
    const hashes = slicedReplies.map((reply) => reply.reply.hash);
    const data = await this.getCastsForHashes(hashes, viewerFid);

    return {
      data: hashes.map((hash) => data[hash]),
      nextCursor:
        slicedReplies.length === MAX_PAGE_SIZE
          ? encodeCursor({
              hash: slicedReplies[slicedReplies.length - 1].reply.hash,
              score: slicedReplies[slicedReplies.length - 1].score,
            })
          : undefined,
    };
  }

  async getCastReplies(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<FetchCastsResponse> {
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
      const hashes = slicedCached.map((reply) => reply.hash);
      const data = await this.getCastsForHashes(hashes, viewerFid);

      return {
        data: hashes.map((hash) => data[hash]),
        nextCursor:
          slicedCached.length === MAX_PAGE_SIZE
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
        await this.cache.getUserPowerBadges(replyFids),
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
        if (!badge) return acc;
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
    const hashes = slicedReplies.map((reply) => reply.reply.hash);
    const data = await this.getCastsForHashes(hashes, viewerFid);

    return {
      data: hashes.map((hash) => data[hash]),
      nextCursor:
        slicedReplies.length === MAX_PAGE_SIZE
          ? encodeCursor({
              hash: slicedReplies[slicedReplies.length - 1].reply.hash,
              score: slicedReplies[slicedReplies.length - 1].score,
            })
          : undefined,
    };
  }

  parseChannelMentions(text: string): string[] {
    return text
      .split(/\s+/)
      .filter((word) => word.startsWith("/"))
      .map((mention) => mention.slice(1).trim())
      .filter(Boolean);
  }
}
