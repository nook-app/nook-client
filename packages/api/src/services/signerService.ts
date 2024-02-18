import { PrismaClient } from "@flink/common/prisma/nook";
import { FastifyInstance } from "fastify";
import { SignerPublicData } from "../../types";
import {
  generateKeyPair,
  getWarpcastDeeplink,
  validateWarpcastSigner,
} from "../utils/signer";
import {
  CastId,
  FarcasterNetwork,
  HubRpcClient,
  NobleEd25519Signer,
  makeCastAdd,
} from "@farcaster/hub-nodejs";

export class SignerService {
  private nookClient: PrismaClient;
  private farcasterHubClient: HubRpcClient;

  constructor(fastify: FastifyInstance) {
    this.nookClient = fastify.nook.client;
    this.farcasterHubClient = fastify.farcasterHub.client;
  }

  async getFarcasterSigner(userId: string): Promise<SignerPublicData> {
    let signer = await this.nookClient.signer.findFirst({
      where: {
        userId,
        state: {
          in: ["completed", "pending"],
        },
      },
    });

    if (!signer) {
      const { publicKey, privateKey } = await generateKeyPair();
      const { token, deeplinkUrl, state } =
        await getWarpcastDeeplink(publicKey);

      signer = await this.nookClient.signer.create({
        data: {
          userId,
          publicKey,
          privateKey,
          token,
          deeplinkUrl,
          state,
        },
      });
    }

    return {
      publicKey: signer.publicKey,
      token: signer.token,
      deeplinkUrl: signer.deeplinkUrl,
      state: signer.state,
    };
  }

  async validateFarcasterSigner(token: string) {
    const { state, userFid } = await validateWarpcastSigner(token);
    if (state === "completed") {
      const signer = await this.nookClient.signer.update({
        where: {
          token,
        },
        data: {
          state,
          fid: userFid.toString(),
        },
      });

      await this.nookClient.user.update({
        where: {
          id: signer.userId,
        },
        data: {
          signerEnabled: true,
        },
      });
    }

    return { state };
  }

  async createFarcasterPost(
    userId: string,
    message: string,
    channel?: string,
    parent?: string,
  ) {
    const signer = await this.nookClient.signer.findFirst({
      where: {
        userId,
        state: "completed",
      },
    });

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
          const proof = await this.farcasterHubClient.getUsernameProof({
            name: new Uint8Array(Buffer.from(name)),
          });
          if (proof.isErr()) return;
          return {
            name,
            mention: proof.value.fid,
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

    const result = await this.farcasterHubClient.submitMessage(
      castAddMessage.value,
    );
    if (result.isErr()) {
      throw new Error(result.error.message);
    }

    return {
      fid: parseInt(signer.fid, 10),
      hash: result.value.hash,
    };
  }
}
