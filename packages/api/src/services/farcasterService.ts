import { FastifyInstance } from "fastify";
import { SignerPublicData } from "../../types";
import {
  CastId,
  FarcasterNetwork,
  NobleEd25519Signer,
  makeCastAdd,
} from "@farcaster/hub-nodejs";
import {
  ContentClient,
  EntityClient,
  FarcasterClient,
  FeedClient,
  NookClient,
} from "@nook/common/clients";
import { FARCASTER_OG_FIDS } from "@nook/common/farcaster";
import {
  BaseFarcasterCastWithContext,
  EntityResponse,
  FarcasterCastResponse,
  UrlContentResponse,
} from "@nook/common/types";

export const MAX_FEED_ITEMS = 25;

export class FarcasterService {
  private nookClient: NookClient;
  private feedClient: FeedClient;
  private farcasterClient: FarcasterClient;
  private entityClient: EntityClient;
  private contentClient: ContentClient;

  constructor(fastify: FastifyInstance) {
    this.nookClient = fastify.nook.client;
    this.farcasterClient = fastify.farcaster.client;
    this.feedClient = fastify.feed.client;
    this.entityClient = fastify.entity.client;
    this.contentClient = fastify.content.client;
  }

  async getSigner(userId: string): Promise<SignerPublicData> {
    let signer = await this.nookClient.getSigner(userId);
    if (!signer) {
      signer = await this.nookClient.createPendingSigner(userId);
    }

    return {
      publicKey: signer.publicKey,
      token: signer.token,
      deeplinkUrl: signer.deeplinkUrl,
      state: signer.state,
    };
  }

  async validateSigner(token: string) {
    return this.nookClient.validateSigner(token);
  }

  async createCast(
    userId: string,
    message: string,
    channel?: string,
    parent?: string,
  ) {
    const signer = await this.nookClient.getSigner(userId, true);
    if (!signer?.fid) {
      throw new Error("Signer not found");
    }

    const parsedMentions = [];
    const mentionRegex = /@(\w+)(?=\s|$|\W(?!\w))/g;
    let match = mentionRegex.exec(message);
    while (match !== null) {
      parsedMentions.push({ name: match[1], position: match.index });
      match = mentionRegex.exec(message);
    }

    const mentions = (
      await Promise.all(
        parsedMentions.map(async ({ name, position }) => {
          const fid = await this.farcasterClient.getUsernameProof(name);
          return {
            name,
            mention: fid,
            position,
          };
        }),
      )
    ).filter(Boolean) as {
      name: string;
      mention: number;
      position: number;
    }[];

    const namesToReplace = mentions.map((mention) => mention.name);
    const text = message.replace(
      new RegExp(`@(${namesToReplace.join("|")})\\b`, "g"),
      "",
    );

    let parentCastId: CastId | undefined;
    if (parent?.startsWith("farcaster://cast/")) {
      const [fid, hash] = parent.replace("farcaster://cast/", "").split("/");
      parentCastId = {
        fid: parseInt(fid, 10),
        hash: new Uint8Array(Buffer.from(hash.substring(2), "hex")),
      };
    }

    const castAddMessage = await makeCastAdd(
      {
        text,
        mentions: mentions.map(({ mention }) => mention),
        mentionsPositions: mentions.map(({ position }) => position),
        embeds: [],
        embedsDeprecated: [],
        parentCastId,
        parentUrl: channel,
      },
      {
        fid: parseInt(signer.fid, 10),
        network: FarcasterNetwork.MAINNET,
      },
      new NobleEd25519Signer(
        Buffer.from(signer.privateKey.substring(2), "hex"),
      ),
    );

    if (castAddMessage.isErr()) {
      throw new Error(castAddMessage.error.message);
    }

    const result = await this.farcasterClient.submitMessage(
      castAddMessage.value,
    );

    return result.hash;
  }

  async getCast(hash: string): Promise<FarcasterCastResponse> {
    const cast = await this.farcasterClient.fetchCast(hash);
    const casts = await this.getCasts([cast]);
    return casts[0];
  }

  async getCasts(
    casts: BaseFarcasterCastWithContext[],
  ): Promise<FarcasterCastResponse[]> {
    const castMap = await this.getCastMap(casts);
    const [entityMap, contentMap] = await Promise.all([
      this.getEntityMap(Object.values(castMap)),
      this.getContentMap(Object.values(castMap)),
    ]);

    return casts
      .map(({ hash }) => this.formatCast(hash, castMap, entityMap, contentMap))
      .filter(Boolean) as FarcasterCastResponse[];
  }

  async getCastMap(casts: BaseFarcasterCastWithContext[]) {
    const castMap = casts.reduce(
      (acc, cast) => {
        acc[cast.hash] = cast;
        return acc;
      },
      {} as Record<string, BaseFarcasterCastWithContext>,
    );
    const relatedCastHashes = new Set<string>();
    for (const cast of casts) {
      if (cast.parentHash) {
        relatedCastHashes.add(cast.parentHash);
      }
      if (cast.rootParentHash && cast.rootParentHash !== cast.hash) {
        relatedCastHashes.add(cast.rootParentHash);
      }
      for (const hash of cast.embedHashes) {
        relatedCastHashes.add(hash);
      }
    }
    const relatedCasts = await this.farcasterClient.fetchCasts(
      Array.from(relatedCastHashes),
    );
    for (const cast of relatedCasts.data) {
      castMap[cast.hash] = cast;
    }
    return castMap;
  }

  async getEntityMap(casts: BaseFarcasterCastWithContext[]) {
    const fids = new Set<string>();
    for (const cast of casts) {
      fids.add(cast.fid);
      for (const { fid } of cast.mentions) {
        fids.add(fid);
      }
    }
    const relatedEntities = await this.entityClient.getEntitiesForFids(
      Array.from(fids),
    );
    return relatedEntities.reduce(
      (acc, entity) => {
        acc[entity.farcaster.fid] = entity;
        return acc;
      },
      {} as Record<string, EntityResponse>,
    );
  }

  async getContentMap(casts: BaseFarcasterCastWithContext[]) {
    const embedUrls = new Set<string>();
    for (const cast of casts) {
      for (const url of cast.embedUrls) {
        embedUrls.add(url);
      }
    }
    const content = await this.contentClient.getContents(Array.from(embedUrls));
    return content.reduce(
      (acc, content) => {
        acc[content.uri] = content;
        return acc;
      },
      {} as Record<string, UrlContentResponse>,
    );
  }

  formatCast(
    hash: string,
    castMap: Record<string, BaseFarcasterCastWithContext>,
    entityMap: Record<string, EntityResponse>,
    contentMap: Record<string, UrlContentResponse>,
  ): FarcasterCastResponse | undefined {
    const cast = castMap[hash];
    if (!cast) return;
    return {
      ...cast,
      entity: entityMap[cast.fid],
      mentions: cast.mentions.map((mention) => ({
        entity: entityMap[mention.fid],
        position: mention.position,
      })),
      embedCasts: cast.embedHashes
        .map((hash) => this.formatCast(hash, castMap, entityMap, contentMap))
        .filter(Boolean) as FarcasterCastResponse[],
      parent: cast.parentHash
        ? this.formatCast(cast.parentHash, castMap, entityMap, contentMap)
        : undefined,
      rootParent: cast.rootParentHash
        ? this.formatCast(cast.rootParentHash, castMap, entityMap, contentMap)
        : undefined,
      embeds: cast.embedUrls.map((url) => contentMap[url]),
    };
  }

  async getCastReplies(hash: string) {
    const replies = await this.farcasterClient.fetchCastReplies(hash);
    const casts = await this.getCasts(replies.data);
    return casts;
  }

  async getFeed(feedId: string, cursor?: number) {
    const feed = await this.feedClient.getFeed(feedId, cursor);
    const startCursor = feed[0]?.score;
    const endCursor = feed[feed.length - 1]?.score;

    const promises = [];
    promises.push(
      this.farcasterClient
        .fetchCasts(feed.map((item) => item.value))
        .then((response) => this.getCasts(response.data)),
    );

    if (!cursor) {
      promises.push(this.getNewFeedItems(feedId, startCursor));
    }

    if (feed.length < 25) {
      promises.push(
        this.backfillFeed(feedId, cursor || endCursor, 25 - feed.length).then(
          (response) => this.getCasts(response),
        ),
      );
    }

    const casts = (await Promise.all(promises))
      .flat()
      .sort((a, b) => {
        return b.timestamp - a.timestamp;
      })
      .slice(0, 25);

    return {
      data: casts,
      nextCursor: casts[casts.length - 1]?.timestamp,
    };
  }

  async getNewFeedItems(feedId: string, cursor?: number) {
    const [type, subtype, id] = feedId.split(":");
    if (type !== "user" || subtype !== "following") {
      return [];
    }

    const response = await this.farcasterClient.fetchCastsFromFollowing({
      fid: id,
      minCursor: cursor,
      limit: MAX_FEED_ITEMS,
    });

    await this.feedClient.batchAddToFeed(
      feedId,
      response.data.map(({ hash, timestamp }) => ({
        value: hash,
        timestamp,
      })),
    );

    return await this.getCasts(response.data);
  }

  async backfillFeed(feedId: string, cursor?: number, take?: number) {
    const [type, subtype, id] = feedId.split(":");

    let rawCasts: BaseFarcasterCastWithContext[] = [];
    if (type === "channel") {
      const response = await this.farcasterClient.fetchCastsByParentUrl({
        parentUrl: id,
        maxCursor: cursor,
        limit: take,
      });
      rawCasts = response.data;
    } else if (type === "user") {
      if (subtype === "following") {
        const response = await this.farcasterClient.fetchCastsFromFollowing({
          fid: id,
          maxCursor: cursor,
          limit: take,
        });
        rawCasts = response.data;
      } else {
        const response = await this.farcasterClient.fetchCastsFromFids({
          fids: [id],
          replies: subtype === "replies",
          maxCursor: cursor,
          limit: take,
        });
        rawCasts = response.data;
      }
    } else if (type === "custom") {
      if (subtype === "farcaster-og") {
        const response = await this.farcasterClient.fetchCastsFromFids({
          fids: FARCASTER_OG_FIDS,
          replies: false,
          maxCursor: cursor,
          limit: take,
        });
        rawCasts = response.data;
      }
    }

    await this.feedClient.batchAddToFeed(
      feedId,
      rawCasts.map(({ hash, timestamp }) => ({
        value: hash,
        timestamp,
      })),
    );

    return rawCasts;
  }
}
