import { FastifyInstance } from "fastify";
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
  makeFrameAction,
  FrameActionBody,
  Embed,
} from "@farcaster/hub-nodejs";
import { bufferToHex, hexToBuffer } from "@nook/common/farcaster";
import { PrismaClient } from "@nook/common/prisma/signer";
import {
  generateKeyPair,
  getWarpcastDeeplink,
  validateSignerRegistration,
} from "../utils";
import {
  GetSignerResponse,
  SubmitCastAddRequest,
  SubmitCastRemoveRequest,
  SubmitFrameActionRequest,
  SubmitLinkAddRequest,
  SubmitLinkRemoveRequest,
  SubmitMessageError,
  SubmitMessageResponse,
  SubmitReactionAddRequest,
  SubmitReactionRemoveRequest,
  ValidateSignerResponse,
} from "@nook/common/types";

export class SignerService {
  private client: PrismaClient;
  private hub: HubRpcClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.signer.client;
    this.hub = fastify.hub.client;
  }

  async createSigner(fid: string) {
    const { publicKey, privateKey } = await generateKeyPair();
    const { token, deeplinkUrl, state } = await getWarpcastDeeplink(publicKey);

    return await this.client.signer.create({
      data: {
        fid,
        publicKey,
        privateKey,
        token,
        deeplinkUrl,
        state,
      },
    });
  }

  async getSigner(fid: string): Promise<GetSignerResponse> {
    let signer = await this.client.signer.findFirst({
      where: {
        fid,
        state: {
          in: ["completed", "pending"],
        },
      },
      orderBy: {
        state: "asc",
      },
    });
    if (!signer) {
      signer = await this.createSigner(fid);
    }

    return {
      publicKey: signer.publicKey,
      token: signer.token,
      deeplinkUrl: signer.deeplinkUrl,
      state: signer.state,
    };
  }

  async getActiveSigner(fid: string) {
    return await this.client.signer.findFirst({
      where: {
        fid,
        state: "completed",
      },
    });
  }

  async validateSigner(token: string): Promise<ValidateSignerResponse> {
    const { state, userFid } = await validateSignerRegistration(token);
    if (state !== "completed") return { state };

    const signer = await this.client.signer.findUnique({
      where: {
        token,
      },
    });

    if (!signer || !userFid) return { state: "pending" };

    if (signer.fid !== userFid.toString()) {
      await this.client.signer.upsert({
        where: {
          token,
        },
        create: {
          ...signer,
          state,
          fid: userFid.toString(),
        },
        update: {
          ...signer,
          state,
          fid: userFid.toString(),
        },
      });

      return { state: "pending" };
    }

    await this.client.signer.update({
      where: {
        token,
      },
      data: {
        state,
      },
    });

    return { state: "completed" };
  }

  async submitCastAdd(
    fid: string,
    req: SubmitCastAddRequest,
  ): Promise<SubmitMessageResponse | SubmitMessageError> {
    const signer = await this.getActiveSigner(fid);
    if (!signer) {
      return {
        message: "Signer not found",
      };
    }

    const mentionRegex = /(^|\s|\.)(@[a-z0-9][a-z0-9-]{0,15}(?:\.eth)?)/gi;
    const rawMentions = [...req.text.matchAll(mentionRegex)].map((match) => ({
      name: match[2],
      position: (match.index || 0) + match[1].length,
    }));

    const formattedMentions = [];

    let replacedText = "";
    let lastPosition = 0;
    for (const mention of rawMentions) {
      replacedText += req.text.slice(lastPosition, mention.position);
      const formattedPosition = new TextEncoder().encode(replacedText).length;
      formattedMentions.push({
        name: mention.name,
        position: formattedPosition,
      });
      lastPosition = mention.position + mention.name.length;
    }
    replacedText += req.text.slice(lastPosition);

    const mentions = (
      await Promise.all(
        formattedMentions.map(async ({ name, position }) => {
          const fid = await this.getUsernameProof(name.slice(1));
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

    let parentCastId: CastId | undefined;
    if (req.parentFid && req.parentHash) {
      parentCastId = {
        fid: parseInt(req.parentFid, 10),
        hash: new Uint8Array(Buffer.from(req.parentHash.substring(2), "hex")),
      };
    }

    const embeds: Embed[] = req.embeds?.map((embed) => ({ url: embed })) || [];
    if (req.castEmbedFid && req.castEmbedHash) {
      embeds.push({
        castId: {
          fid: parseInt(req.castEmbedFid, 10),
          hash: new Uint8Array(
            Buffer.from(req.castEmbedHash.substring(2), "hex"),
          ),
        },
      });
    }

    const castAddMessage = await makeCastAdd(
      {
        text: replacedText,
        mentions: mentions.map(({ mention }) => mention),
        mentionsPositions: mentions.map(({ position }) => position),
        embeds,
        embedsDeprecated: [],
        parentCastId,
        parentUrl: req.parentUrl,
      },
      {
        fid: parseInt(fid, 10),
        network: FarcasterNetwork.MAINNET,
      },
      new NobleEd25519Signer(
        Buffer.from(signer.privateKey.substring(2), "hex"),
      ),
    );

    if (castAddMessage.isErr()) {
      return {
        message: castAddMessage.error.message,
      };
    }

    const result = await this.submitMessage(castAddMessage.value);
    return {
      hash: bufferToHex(result.hash),
    };
  }

  async submitCastRemove(
    fid: string,
    req: SubmitCastRemoveRequest,
  ): Promise<SubmitMessageResponse | SubmitMessageError> {
    const signer = await this.getActiveSigner(fid);
    if (!signer) {
      return {
        message: "Signer not found",
      };
    }

    const castRemoveMessage = await makeCastRemove(
      {
        targetHash: hexToBuffer(req.hash),
      },
      {
        fid: parseInt(fid, 10),
        network: FarcasterNetwork.MAINNET,
      },
      new NobleEd25519Signer(
        Buffer.from(signer.privateKey.substring(2), "hex"),
      ),
    );

    if (castRemoveMessage.isErr()) {
      return {
        message: castRemoveMessage.error.message,
      };
    }

    const result = await this.submitMessage(castRemoveMessage.value);

    return {
      hash: bufferToHex(result.hash),
    };
  }

  async submitReactionAdd(
    fid: string,
    req: SubmitReactionAddRequest,
  ): Promise<SubmitMessageResponse | SubmitMessageError> {
    const signer = await this.getActiveSigner(fid);
    if (!signer) {
      return {
        message: "Signer not found",
      };
    }

    const reactionAddMessage = await makeReactionAdd(
      {
        targetCastId: {
          fid: parseInt(req.targetFid, 10),
          hash: hexToBuffer(req.targetHash),
        },
        type: req.reactionType,
      },
      {
        fid: parseInt(fid, 10),
        network: FarcasterNetwork.MAINNET,
      },
      new NobleEd25519Signer(
        Buffer.from(signer.privateKey.substring(2), "hex"),
      ),
    );

    if (reactionAddMessage.isErr()) {
      return {
        message: reactionAddMessage.error.message,
      };
    }

    const result = await this.submitMessage(reactionAddMessage.value);

    return {
      hash: bufferToHex(result.hash),
    };
  }

  async submitReactionRemove(
    fid: string,
    req: SubmitReactionRemoveRequest,
  ): Promise<SubmitMessageResponse | SubmitMessageError> {
    const signer = await this.getActiveSigner(fid);
    if (!signer) {
      throw new Error("Signer not found");
    }

    const reactionRemoveMessage = await makeReactionRemove(
      {
        targetCastId: {
          fid: parseInt(req.targetFid, 10),
          hash: hexToBuffer(req.targetHash),
        },
        type: req.reactionType,
      },
      {
        fid: parseInt(fid, 10),
        network: FarcasterNetwork.MAINNET,
      },
      new NobleEd25519Signer(
        Buffer.from(signer.privateKey.substring(2), "hex"),
      ),
    );

    if (reactionRemoveMessage.isErr()) {
      return {
        message: reactionRemoveMessage.error.message,
      };
    }

    const result = await this.submitMessage(reactionRemoveMessage.value);

    return {
      hash: bufferToHex(result.hash),
    };
  }

  async submitLinkAdd(
    fid: string,
    req: SubmitLinkAddRequest,
  ): Promise<SubmitMessageResponse | SubmitMessageError> {
    const signer = await this.getActiveSigner(fid);
    if (!signer) {
      return {
        message: "Signer not found",
      };
    }

    const linkAddMessage = await makeLinkAdd(
      {
        targetFid: parseInt(req.targetFid, 10),
        type: req.linkType,
      },
      {
        fid: parseInt(fid, 10),
        network: FarcasterNetwork.MAINNET,
      },
      new NobleEd25519Signer(
        Buffer.from(signer.privateKey.substring(2), "hex"),
      ),
    );

    if (linkAddMessage.isErr()) {
      return {
        message: linkAddMessage.error.message,
      };
    }

    const result = await this.submitMessage(linkAddMessage.value);

    return {
      hash: bufferToHex(result.hash),
    };
  }

  async submitLinkRemove(
    fid: string,
    req: SubmitLinkRemoveRequest,
  ): Promise<SubmitMessageResponse | SubmitMessageError> {
    const signer = await this.getActiveSigner(fid);
    if (!signer) {
      return {
        message: "Signer not found",
      };
    }

    const linkRemoveMessage = await makeLinkRemove(
      {
        targetFid: parseInt(req.targetFid, 10),
        type: req.linkType,
      },
      {
        fid: parseInt(fid, 10),
        network: FarcasterNetwork.MAINNET,
      },
      new NobleEd25519Signer(
        Buffer.from(signer.privateKey.substring(2), "hex"),
      ),
    );

    if (linkRemoveMessage.isErr()) {
      return {
        message: linkRemoveMessage.error.message,
      };
    }

    const result = await this.submitMessage(linkRemoveMessage.value);

    return {
      hash: bufferToHex(result.hash),
    };
  }

  async signFrameAction(
    fid: string,
    req: SubmitFrameActionRequest,
  ): Promise<SubmitMessageResponse | SubmitMessageError> {
    const signer = await this.getActiveSigner(fid);
    if (!signer) {
      return {
        message: "Signer not found",
      };
    }

    const frameActionMessage = await makeFrameAction(
      FrameActionBody.create({
        url: new Uint8Array(Buffer.from(req.postUrl)),
        buttonIndex: req.buttonIndex,
        castId: {
          fid: parseInt(req.castFid, 10),
          hash: new Uint8Array(Buffer.from(req.castHash.substring(2), "hex")),
        },
        inputText: req.inputText
          ? new Uint8Array(Buffer.from(req.inputText))
          : undefined,
        state: req.state ? new Uint8Array(Buffer.from(req.state)) : undefined,
        address: req.address
          ? new Uint8Array(Buffer.from(req.address))
          : undefined,
        transactionId: req.transactionId
          ? new Uint8Array(Buffer.from(req.transactionId))
          : undefined,
      }),
      {
        fid: parseInt(fid, 10),
        network: FarcasterNetwork.MAINNET,
      },
      new NobleEd25519Signer(
        Buffer.from(signer.privateKey.substring(2), "hex"),
      ),
    );

    if (frameActionMessage.isErr()) {
      return {
        message: frameActionMessage.error.message,
      };
    }

    const trustedBytes = bufferToHex(
      HubMessage.encode(frameActionMessage._unsafeUnwrap()).finish(),
    );

    return {
      hash: bufferToHex(frameActionMessage.value.hash),
      trustedBytes,
    };
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
}
