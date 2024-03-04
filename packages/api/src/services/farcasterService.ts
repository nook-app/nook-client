import { FastifyInstance } from "fastify";
import { SignerPublicData } from "../../types";
import {
  CastId,
  FarcasterNetwork,
  NobleEd25519Signer,
  makeCastAdd,
} from "@farcaster/hub-nodejs";
import { FarcasterClient, FeedClient, NookClient } from "@nook/common/clients";
import { FARCASTER_OG_FIDS } from "@nook/common/farcaster";
import {
  BaseFarcasterCast,
  BaseFarcasterCastWithContext,
  EntityResponse,
  FarcasterCastResponse,
} from "@nook/common/types";

export class FarcasterService {
  private nookClient: NookClient;
  private feedClient: FeedClient;
  private farcasterClient: FarcasterClient;

  constructor(fastify: FastifyInstance) {
    this.nookClient = fastify.nook.client;
    this.farcasterClient = fastify.farcaster.client;
    this.feedClient = fastify.feed.client;
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
      if (cast.rootParentHash) {
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

    const relatedFids = new Set<string>();
    for (const cast of Object.values(castMap)) {
      relatedFids.add(cast.fid);
      for (const { fid } of cast.mentions) {
        relatedFids.add(fid);
      }
    }
    const relatedEntities = await this.farcasterClient.fetchUsers(
      Array.from(relatedFids),
    );
    const entityMap = relatedEntities.data.reduce(
      (acc, entity) => {
        acc[entity.farcaster.fid] = entity;
        return acc;
      },
      {} as Record<string, EntityResponse>,
    );

    return casts.map(({ hash }) => this.formatCast(hash, castMap, entityMap));
  }

  formatCast(
    hash: string,
    castMap: Record<string, BaseFarcasterCastWithContext>,
    entityMap: Record<string, EntityResponse>,
  ): FarcasterCastResponse {
    const cast = castMap[hash];
    return {
      ...cast,
      entity: entityMap[cast.fid],
      mentions: cast.mentions.map((mention) => ({
        entity: entityMap[mention.fid],
        position: mention.position,
      })),
      embedCasts: cast.embedHashes.map((hash) =>
        this.formatCast(hash, castMap, entityMap),
      ),
      parent: cast.parentHash
        ? this.formatCast(cast.parentHash, castMap, entityMap)
        : undefined,
      rootParent: cast.rootParentHash
        ? this.formatCast(cast.rootParentHash, castMap, entityMap)
        : undefined,
    };
  }

  async getCastReplies(hash: string) {
    const replies = await this.farcasterClient.fetchCastReplies(hash);
    const casts = await this.getCasts(replies.data);
    return casts;
  }

  async getFeed(feedId: string, cursor?: number) {
    const feed = await this.feedClient.getFeed(feedId, cursor);

    const promises = [];
    promises.push(
      this.farcasterClient
        .fetchCasts(feed)
        .then((response) => this.getCasts(response.data)),
    );

    if (feed.length < 25) {
      promises.push(
        this.backfillFeed(feedId, cursor, 25 - feed.length).then((response) =>
          this.getCasts(response),
        ),
      );
    }

    const casts = (await Promise.all(promises)).flat();

    return {
      data: casts,
      nextCursor: casts[casts.length - 1]?.timestamp,
    };
  }

  async backfillFeed(feedId: string, cursor?: number, take?: number) {
    const [type, subtype, id] = feedId.split(":");

    let rawCasts: BaseFarcasterCastWithContext[] = [];
    if (type === "channel") {
      const response = await this.farcasterClient.fetchCastsByParentUrl(
        id,
        cursor,
        take,
      );
      rawCasts = response.data;
    } else if (type === "user") {
      if (subtype === "following") {
        const response = await this.farcasterClient.fetchCastsFromFollowing(
          id,
          cursor,
          take,
        );
        rawCasts = response.data;
      } else {
        const response = await this.farcasterClient.fetchCastsByFid(
          id,
          subtype === "replies",
          cursor,
          take,
        );
        rawCasts = response.data;
      }
    } else if (type === "custom") {
      if (subtype === "farcaster-og") {
        const response = await this.farcasterClient.fetchCastsFromFids(
          FARCASTER_OG_FIDS,
          false,
          cursor,
          take,
        );
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
