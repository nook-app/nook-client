import { FastifyInstance } from "fastify";
import { SignerPublicData } from "../../types";
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
import { FARCASTER_OG_FIDS } from "@nook/common/farcaster";
import { BaseFarcasterCast } from "@nook/common/types";

export class FarcasterService {
  private nookClient: NookClient;
  private feedClient: FeedClient;
  private farcasterClient: FarcasterClient;
  private entityClient: EntityClient;

  constructor(fastify: FastifyInstance) {
    this.nookClient = fastify.nook.client;
    this.farcasterClient = fastify.farcaster.client;
    this.feedClient = fastify.feed.client;
    this.entityClient = fastify.entity.client;
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

  async getCast(hash: string) {
    return this.farcasterClient.getCast(hash);
  }

  async getCastReplies(hash: string) {
    return this.farcasterClient.getCastReplies(hash);
  }

  async getFeed(feedId: string, cursor?: number) {
    const feed = await this.feedClient.getFeed(feedId, cursor);

    const promises = [];
    promises.push(
      this.farcasterClient.getCasts(feed).then((response) => response.data),
    );

    if (feed.length < 25) {
      promises.push(this.backfillFeed(feedId, cursor, 25 - feed.length));
    }

    const casts = (await Promise.all(promises)).flat();

    return {
      data: casts,
      nextCursor: casts[casts.length - 1]?.timestamp,
    };
  }

  async backfillFeed(feedId: string, cursor?: number, take?: number) {
    const [type, subtype, id] = feedId.split(":");

    let rawCasts: BaseFarcasterCast[] = [];
    if (type === "channel") {
      const response = await this.farcasterClient.getCastsByParentUrl(
        id,
        cursor,
        take,
      );
      rawCasts = response.data;
    } else if (type === "user") {
      if (subtype === "following") {
        const response = await this.farcasterClient.getCastsFromFollowing(
          id,
          cursor,
          take,
        );
        rawCasts = response.data;
      } else {
        const response = await this.farcasterClient.getCastsByFid(
          id,
          subtype === "replies",
          cursor,
          take,
        );
        rawCasts = response.data;
      }
    } else if (type === "custom") {
      if (subtype === "farcaster-og") {
        const response = await this.farcasterClient.getCastsFromFids(
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
