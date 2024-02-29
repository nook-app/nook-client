import { FastifyInstance } from "fastify";
import { SignerPublicData } from "../../types";
import {
  CastId,
  FarcasterNetwork,
  NobleEd25519Signer,
  makeCastAdd,
} from "@farcaster/hub-nodejs";
import { FarcasterClient, FeedClient, NookClient } from "@nook/common/clients";
import { FarcasterCastResponseWithContext } from "@nook/common/types";
import { FarcasterCast } from "@nook/common/prisma/farcaster";

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

    return {
      fid: parseInt(signer.fid, 10),
      hash: result.hash,
    };
  }

  async getCast(hash: string) {
    return this.farcasterClient.getCastWithContext(hash);
  }

  async getCasts(hashes: string[]) {
    return this.farcasterClient.getCastsWithContext(hashes);
  }

  async getCastReplies(hash: string) {
    const casts = await this.farcasterClient.getCastReplies(hash);
    return await Promise.all(
      casts.map((cast) =>
        this.farcasterClient.getCastWithContext(cast.hash, cast),
      ),
    );
  }

  async getFeed(feedId: string, cursor?: number) {
    const feed = await this.feedClient.getFeed(feedId, cursor);
    const feedCasts = await this.farcasterClient.getCastsWithContext(feed);

    if (feedCasts.length < 25) {
      const take = 25 - feedCasts.length;
      const [type, subtype, id] = feedId.split(":");

      let rawCasts: FarcasterCast[] = [];
      if (type === "channel") {
        rawCasts = await this.farcasterClient.getCastsFromChannel(
          id,
          cursor,
          take,
        );
      } else if (type === "user") {
        if (subtype === "following") {
          rawCasts = await this.farcasterClient.getCastsFromFollowing(
            BigInt(id),
            cursor,
            take,
          );
        } else {
          rawCasts = await this.farcasterClient.getCastsFromFid(
            BigInt(id),
            subtype === "replies",
            cursor,
            take,
          );
        }
      }
      const casts = (
        await Promise.all(
          rawCasts.map((cast) =>
            this.farcasterClient.getCastWithContext(cast.hash, cast),
          ),
        )
      ).filter(Boolean) as FarcasterCastResponseWithContext[];
      feedCasts.concat(casts);
      await this.feedClient.batchAddToFeed(
        feedId,
        casts.map(({ hash, timestamp }) => ({
          value: hash,
          timestamp,
        })),
      );
    }

    return {
      data: feedCasts,
      nextCursor: feedCasts[feedCasts.length - 1]?.timestamp,
    };
  }

  async getFollowers(fid: string) {
    return await this.farcasterClient.getFollowers(BigInt(fid));
  }
}
