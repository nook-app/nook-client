import { PrismaClient } from "@flink/common/prisma/nook";
import { FastifyInstance } from "fastify";
import { SignerPublicData } from "../../types";
import {
  generateKeyPair,
  getWarpcastDeeplink,
  validateWarpcastSigner,
} from "../utils/signer";

export class SignerService {
  private nookClient: PrismaClient;
  constructor(fastify: FastifyInstance) {
    this.nookClient = fastify.nook.client;
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
    const { state } = await validateWarpcastSigner(token);
    if (state === "completed") {
      const signer = await this.nookClient.signer.update({
        where: {
          token,
        },
        data: {
          state,
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
}
