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
  CastAddMessage,
  toFarcasterTime,
  makeUserDataAdd,
  CastType,
} from "@farcaster/hub-nodejs";
import { bufferToHex, hexToBuffer } from "@nook/common/farcaster";
import { PrismaClient, Signer } from "@nook/common/prisma/signer";
import {
  generateKeyPair,
  getWarpcastDeeplink,
  signMessage,
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
  SubmitUserDataAddRequest,
  ValidateSignerResponse,
} from "@nook/common/types";
import { hexToBytes } from "viem";
import { PendingCast } from "@nook/common/prisma/nook";

export class SignerService {
  private client: PrismaClient;
  private hub: HubRpcClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.signer.client;
    this.hub = fastify.hub.client;
  }

  async getPendingSigner(address: string) {
    const signer = await this.client.signerPending.findFirst({
      where: {
        address,
      },
    });
    if (signer) {
      return {
        address,
        publicKey: signer.publicKey,
        signature: signer.signature,
        deadline: signer.deadline,
        requestFid: signer.requestFid,
        requestAddress: signer.requestAddress,
      };
    }

    const { publicKey, privateKey } = await generateKeyPair();
    const { signature, deadline, requestFid, requestAddress } =
      await signMessage(publicKey);

    await this.client.signerPending.create({
      data: {
        address,
        publicKey,
        privateKey,
        signature,
        deadline,
        requestFid,
        requestAddress,
      },
    });

    return {
      address,
      publicKey,
      signature,
      deadline,
      requestFid,
      requestAddress,
    };
  }

  async upgradePendingSigner(fid: string, address: string) {
    const pendingSigner = await this.client.signerPending.findFirst({
      where: {
        address,
      },
    });
    if (pendingSigner) {
      await this.client.signer.deleteMany({
        where: {
          fid,
          state: "pending",
        },
      });

      return await this.client.signer.create({
        data: {
          fid,
          publicKey: pendingSigner.publicKey,
          privateKey: pendingSigner.privateKey,
          state: "completed",
        },
      });
    }
    return null;
  }

  async createSigner(fid: string, address?: string) {
    if (address) {
      const pendingSigner = await this.upgradePendingSigner(fid, address);
      if (pendingSigner) return pendingSigner;
    }

    const { publicKey, privateKey } = await generateKeyPair();
    const {
      token,
      deeplinkUrl,
      state,
      requestAddress,
      requestFid,
      signature,
      deadline,
    } = await getWarpcastDeeplink(publicKey);

    return await this.client.signer.create({
      data: {
        requestAddress,
        requestFid,
        signature,
        deadline,
        fid,
        publicKey,
        privateKey,
        token,
        deeplinkUrl,
        state,
      },
    });
  }

  async updateSignerToken(signer: { fid: string; publicKey: `0x${string}` }) {
    const {
      token,
      deeplinkUrl,
      state,
      requestAddress,
      requestFid,
      signature,
      deadline,
    } = await getWarpcastDeeplink(signer.publicKey);
    return await this.client.signer.update({
      where: {
        fid_publicKey: { fid: signer.fid, publicKey: signer.publicKey },
      },
      data: {
        requestAddress,
        requestFid,
        signature,
        deadline,
        token,
        deeplinkUrl,
        state,
      },
    });
  }

  async getSigner(fid: string, address?: string): Promise<GetSignerResponse> {
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
      signer = await this.createSigner(fid, address);
    } else if (signer.state === "pending") {
      if (address) {
        const pendingSigner = await this.upgradePendingSigner(fid, address);
        if (pendingSigner) signer = pendingSigner;
      }
      if (
        signer.state === "pending" &&
        (!signer.signature ||
          signer.updatedAt.getTime() < Date.now() - 86400 * 1000)
      ) {
        // tokens expire after 1 day; update if expired
        signer = await this.updateSignerToken(
          signer as { fid: string; publicKey: `0x${string}` },
        );
      }
    }

    return {
      publicKey: signer.publicKey as `0x${string}`,
      token: signer.token || undefined,
      deeplinkUrl: signer.deeplinkUrl || undefined,
      state: signer.state || undefined,
      requestAddress: signer.requestAddress as `0x${string}` | undefined,
      requestFid: signer.requestFid || undefined,
      signature: signer.signature as `0x${string}` | undefined,
      deadline: signer.deadline || undefined,
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

  async validateSignerByPublicKey(
    publicKey: string,
  ): Promise<ValidateSignerResponse> {
    await this.client.signer.updateMany({
      where: {
        publicKey,
      },
      data: {
        state: "completed",
      },
    });

    return { state: "completed" };
  }

  async validateSigner(token: string): Promise<ValidateSignerResponse> {
    const { state, userFid } = await validateSignerRegistration(token);
    if (state !== "completed") return { state };

    const signer = await this.client.signer.findFirst({
      where: {
        token,
      },
    });

    if (!signer || !userFid) return { state: "pending" };

    if (signer.fid !== userFid.toString()) {
      await this.client.signer.updateMany({
        where: {
          token,
        },
        data: {
          deeplinkUrl: signer.deeplinkUrl || null,
          publicKey: signer.publicKey,
          token,
          state,
          fid: userFid.toString(),
        },
      });

      return { state: "pending" };
    }

    await this.client.signer.updateMany({
      where: {
        token,
      },
      data: {
        state,
      },
    });

    return { state: "completed" };
  }

  async submitCastAddThread(
    fid: string,
    data: SubmitCastAddRequest[],
  ): Promise<SubmitMessageResponse | SubmitMessageError> {
    const signer = await this.getActiveSigner(fid);
    if (!signer) {
      return {
        message: "Signer not found",
      };
    }

    let lastParentFid: string | undefined;
    let lastParentHash: string | undefined;

    const castAddMessages: CastAddMessage[] = [];
    for (const req of data) {
      const castAddMessage = await this.formatCastAdd(fid, signer, {
        ...req,
        parentFid: req.parentFid || lastParentFid,
        parentHash: req.parentHash || lastParentHash,
      });
      if (castAddMessage.isErr()) {
        return {
          message: castAddMessage.error.message,
        };
      }

      const value = castAddMessage.value;
      castAddMessages.push(value);

      await this.submitMessage(value);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      lastParentFid = value.data.fid.toString();
      lastParentHash = bufferToHex(value.hash);
    }

    const hashes = castAddMessages.map((r) => bufferToHex(r.hash));

    return {
      hashes,
      hash: hashes[hashes.length - 1],
    };
  }

  async formatCastAdd(
    fid: string,
    signer: Signer,
    req: SubmitCastAddRequest,
    timestamp?: number,
  ) {
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

    return await makeCastAdd(
      {
        text: replacedText,
        mentions: mentions.map(({ mention }) => mention),
        mentionsPositions: mentions.map(({ position }) => position),
        embeds,
        embedsDeprecated: [],
        parentCastId,
        parentUrl: req.parentUrl,
        type: CastType.CAST,
      },
      {
        fid: parseInt(fid, 10),
        network: FarcasterNetwork.MAINNET,
        timestamp: timestamp
          ? toFarcasterTime(timestamp).unwrapOr(undefined)
          : undefined,
      },
      new NobleEd25519Signer(
        Buffer.from(signer.privateKey.substring(2), "hex"),
      ),
    );
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

    const castAddMessage = await this.formatCastAdd(fid, signer, req);
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

  async submitPendingCast(
    cast: PendingCast,
  ): Promise<{ id: string; hash: string | null }> {
    const fid = cast.fid;
    console.log("getting signer");
    const signer = await this.getActiveSigner(fid);
    if (!signer) return { id: cast.id, hash: null };

    console.log("formatting cast add");
    const castAddMessage = await this.formatCastAdd(
      fid,
      signer,
      {
        text: cast.text,
        parentUrl: cast.parentUrl || undefined,
        parentFid: cast.parentFid || undefined,
        parentHash: cast.parentHash || undefined,
        castEmbedFid: cast.castEmbedFid || undefined,
        castEmbedHash: cast.castEmbedHash || undefined,
        embeds: cast.embeds || undefined,
      },
      cast.scheduledFor?.getTime(),
    );

    if (castAddMessage.isErr()) {
      return { id: cast.id, hash: null };
    }

    console.log("submitting message");
    const response = await this.submitMessage(castAddMessage.value);
    return { id: cast.id, hash: bufferToHex(response.hash) };
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

  async submitUserDataAdd(
    fid: string,
    req: SubmitUserDataAddRequest,
  ): Promise<SubmitMessageResponse | SubmitMessageError> {
    const signer = await this.getActiveSigner(fid);
    if (!signer) {
      return {
        message: "Signer not found",
      };
    }

    const userDataAddMessage = await makeUserDataAdd(
      {
        type: req.type,
        value: req.value,
      },
      {
        fid: parseInt(fid, 10),
        network: FarcasterNetwork.MAINNET,
      },
      new NobleEd25519Signer(
        Buffer.from(signer.privateKey.substring(2), "hex"),
      ),
    );

    if (userDataAddMessage.isErr()) {
      return {
        message: userDataAddMessage.error.message,
      };
    }

    const result = await this.submitMessage(userDataAddMessage.value);

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
        url: new Uint8Array(Buffer.from(req.url)),
        buttonIndex: req.buttonIndex,
        castId: {
          fid: parseInt(req.castFid, 10),
          hash: new Uint8Array(Buffer.from(req.castHash.substring(2), "hex")),
        },
        inputText: req.inputText
          ? new Uint8Array(Buffer.from(req.inputText))
          : undefined,
        state: req.state ? new Uint8Array(Buffer.from(req.state)) : undefined,
        address: req.address ? hexToBytes(req.address) : undefined,
        transactionId: req.transactionId
          ? hexToBytes(req.transactionId)
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
