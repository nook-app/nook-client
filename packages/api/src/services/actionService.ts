import { FastifyInstance } from "fastify";
import { SignerPublicData } from "../../types";
import {
  CastId,
  FarcasterNetwork,
  HubRpcClient,
  NobleEd25519Signer,
  makeCastAdd,
  Message as HubMessage,
  makeCastRemove,
  makeReactionAdd,
  makeReactionRemove,
  makeLinkAdd,
  makeLinkRemove,
} from "@farcaster/hub-nodejs";
import { FarcasterAPIClient, NookClient } from "@nook/common/clients";
import { bufferToHex, hexToBuffer } from "@nook/common/farcaster";

export const MAX_FEED_ITEMS = 25;

export class ActionService {
  private nookClient: NookClient;
  private hub: HubRpcClient;
  private farcasterClient: FarcasterAPIClient;

  constructor(fastify: FastifyInstance) {
    this.nookClient = fastify.nook.client;
    this.hub = fastify.hub.client;
    this.farcasterClient = new FarcasterAPIClient();
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

  async getUsernameProof(name: string) {
    const proof = await this.hub.getUsernameProof({
      name: new Uint8Array(Buffer.from(name)),
    });
    if (proof.isErr()) return;
    return proof.value.fid;
  }

  async submitMessage(message: HubMessage): Promise<HubMessage> {
    const result = await this.hub.submitMessage(message);
    if (result.isErr()) {
      throw new Error(result.error.message);
    }
    return result.value;
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
          const fid = await this.getUsernameProof(name);
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

    const result = await this.submitMessage(castAddMessage.value);

    return bufferToHex(result.hash);
  }

  async deleteCast(userId: string, hash: string) {
    const signer = await this.nookClient.getSigner(userId, true);
    if (!signer?.fid) {
      throw new Error("Signer not found");
    }

    const castRemoveMessage = await makeCastRemove(
      {
        targetHash: hexToBuffer(hash),
      },
      {
        fid: parseInt(signer.fid, 10),
        network: FarcasterNetwork.MAINNET,
      },
      new NobleEd25519Signer(
        Buffer.from(signer.privateKey.substring(2), "hex"),
      ),
    );

    if (castRemoveMessage.isErr()) {
      throw new Error(castRemoveMessage.error.message);
    }

    const result = await this.submitMessage(castRemoveMessage.value);

    return bufferToHex(result.hash);
  }

  async createReaction(userId: string, hash: string, reactionType: number) {
    const signer = await this.nookClient.getSigner(userId, true);
    if (!signer?.fid) {
      throw new Error("Signer not found");
    }

    const cast = await this.farcasterClient.getCast(hash);
    if (!cast) {
      throw new Error("Cast not found");
    }

    const reactionAddMessage = await makeReactionAdd(
      {
        targetCastId: {
          fid: parseInt(cast.user.fid, 10),
          hash: hexToBuffer(hash),
        },
        type: reactionType,
      },
      {
        fid: parseInt(signer.fid, 10),
        network: FarcasterNetwork.MAINNET,
      },
      new NobleEd25519Signer(
        Buffer.from(signer.privateKey.substring(2), "hex"),
      ),
    );

    if (reactionAddMessage.isErr()) {
      throw new Error(reactionAddMessage.error.message);
    }

    const result = await this.submitMessage(reactionAddMessage.value);

    return bufferToHex(result.hash);
  }

  async deleteReaction(userId: string, hash: string, reactionType: number) {
    const signer = await this.nookClient.getSigner(userId, true);
    if (!signer?.fid) {
      throw new Error("Signer not found");
    }

    const cast = await this.farcasterClient.getCast(hash);
    if (!cast) {
      throw new Error("Cast not found");
    }

    const reactionRemoveMessage = await makeReactionRemove(
      {
        targetCastId: {
          fid: parseInt(cast.user.fid, 10),
          hash: hexToBuffer(hash),
        },
        type: reactionType,
      },
      {
        fid: parseInt(signer.fid, 10),
        network: FarcasterNetwork.MAINNET,
      },
      new NobleEd25519Signer(
        Buffer.from(signer.privateKey.substring(2), "hex"),
      ),
    );

    if (reactionRemoveMessage.isErr()) {
      throw new Error(reactionRemoveMessage.error.message);
    }

    const result = await this.submitMessage(reactionRemoveMessage.value);

    return bufferToHex(result.hash);
  }

  async createLink(userId: string, fid: string, linkType: string) {
    const signer = await this.nookClient.getSigner(userId, true);
    if (!signer?.fid) {
      throw new Error("Signer not found");
    }

    const linkAddMessage = await makeLinkAdd(
      {
        targetFid: parseInt(fid, 10),
        type: linkType,
      },
      {
        fid: parseInt(signer.fid, 10),
        network: FarcasterNetwork.MAINNET,
      },
      new NobleEd25519Signer(
        Buffer.from(signer.privateKey.substring(2), "hex"),
      ),
    );

    if (linkAddMessage.isErr()) {
      throw new Error(linkAddMessage.error.message);
    }

    await this.submitMessage(linkAddMessage.value);

    return fid;
  }

  async deleteLink(userId: string, fid: string, linkType: string) {
    const signer = await this.nookClient.getSigner(userId, true);
    if (!signer?.fid) {
      throw new Error("Signer not found");
    }

    const linkRemoveMessage = await makeLinkRemove(
      {
        targetFid: parseInt(fid, 10),
        type: linkType,
      },
      {
        fid: parseInt(signer.fid, 10),
        network: FarcasterNetwork.MAINNET,
      },
      new NobleEd25519Signer(
        Buffer.from(signer.privateKey.substring(2), "hex"),
      ),
    );

    if (linkRemoveMessage.isErr()) {
      throw new Error(linkRemoveMessage.error.message);
    }

    await this.submitMessage(linkRemoveMessage.value);

    return fid;
  }
}
