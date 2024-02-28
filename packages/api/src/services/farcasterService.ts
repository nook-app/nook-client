import { FastifyInstance } from "fastify";
import { FarcasterCastResponse, SignerPublicData } from "../../types";
import {
  CastId,
  FarcasterNetwork,
  NobleEd25519Signer,
  makeCastAdd,
} from "@farcaster/hub-nodejs";
import {
  EntityClient,
  FarcasterClient,
  FeedClient,
  NookClient,
} from "@nook/common/clients";
import { Entity } from "@nook/common/prisma/entity";
import { FarcasterCast } from "@nook/common/prisma/farcaster";

export class FarcasterService {
  private nookClient: NookClient;
  private feedClient: FeedClient;
  private farcasterClient: FarcasterClient;
  private entityClient: EntityClient;

  constructor(fastify: FastifyInstance) {
    this.nookClient = fastify.nook.client;
    this.farcasterClient = fastify.farcaster.client;
    this.entityClient = fastify.entity.client;
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

    return {
      fid: parseInt(signer.fid, 10),
      hash: result.hash,
    };
  }

  async getCast(hash: string) {
    const casts = await this.getCasts([hash]);
    return casts[0];
  }

  async getCasts(hashes: string[]) {
    const casts = await this.farcasterClient.getCasts(hashes);
    const fids = casts.flatMap((cast) =>
      this.farcasterClient.getFidsFromCast(cast),
    );
    const entities = await this.entityClient.getEntitiesByFid(fids);
    const entityMap = entities.reduce(
      (acc, entity) => {
        acc[entity.fid.toString()] = entity;
        return acc;
      },
      {} as Record<string, Entity>,
    );

    const relatedHashes = new Set<string>();
    for (const cast of casts) {
      if (cast.parentHash) {
        relatedHashes.add(cast.parentHash);
      }
      if (cast.rootParentHash !== cast.hash) {
        relatedHashes.add(cast.rootParentHash);
      }
    }

    const relatedCasts = await this.farcasterClient.getCasts(
      Array.from(relatedHashes),
    );

    const castMap = casts.concat(relatedCasts).reduce(
      (acc, cast) => {
        acc[cast.hash] = cast;
        return acc;
      },
      {} as Record<string, FarcasterCast>,
    );

    return hashes.map((hash) => this.formatCast(hash, entityMap, castMap));
  }

  formatCast(
    hash: string,
    entityMap: Record<string, Entity>,
    castMap: Record<string, FarcasterCast>,
  ): FarcasterCastResponse | undefined {
    const cast = castMap[hash];
    if (!cast) return;

    let parent: FarcasterCastResponse | undefined;
    if (cast.parentHash) {
      parent = this.formatCast(cast.parentHash, entityMap, castMap);
    }

    let rootParent: FarcasterCastResponse | undefined;
    if (cast.rootParentHash !== cast.hash) {
      rootParent = this.formatCast(cast.rootParentHash, entityMap, castMap);
    }

    const mentions = this.farcasterClient.getMentions(cast);
    const urlEmbeds = this.farcasterClient.getUrlEmbeds(cast);

    const castEmbeds: FarcasterCastResponse[] = [];
    for (const { hash } of this.farcasterClient.getCastEmbeds(cast)) {
      const castEmbed = this.formatCast(hash, entityMap, castMap);
      if (castEmbed) castEmbeds.push();
    }

    return {
      hash: cast.hash,
      timestamp: cast.timestamp.getTime(),
      entity: entityMap[cast.fid.toString()],
      text: cast.text,
      mentions: mentions.map((mention) => ({
        entity: entityMap[mention.mention.toString()],
        position: mention.mentionPosition,
      })),
      castEmbeds,
      urlEmbeds,
      parent,
      rootParent,
    };
  }

  async getFeed(feedId: string) {
    const feed = await this.feedClient.getFeed(feedId);
    if (feed.length === 0) {
      throw new Error("Feed not found");
    }

    const casts = await this.getCasts(feed);
    return casts;
  }
}
