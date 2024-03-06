import { PrismaClient } from "../../prisma/nook";
import { RedisClient } from "../cache/base";
import {
  generateKeyPair,
  getWarpcastDeeplink,
  validateWarpcastSigner,
} from "../../signer";
import { NookMetadata, NookResponse } from "../../types";
import { FarcasterAPIClient } from "../api/farcaster";

export class NookClient {
  private client: PrismaClient;
  private redis: RedisClient;
  private farcasterClient: FarcasterAPIClient;

  CHANNEL_CACHE_PREFIX = "channel";
  NOOK_CACHE_PREFIX = "nook";
  ENTITY_CACHE_PREFIX = "entity";
  FID_CACHE_PREFIX = "fid";

  constructor() {
    this.client = new PrismaClient();
    this.redis = new RedisClient();
    this.farcasterClient = new FarcasterAPIClient();
  }

  async connect() {
    await this.client.$connect();
    await this.redis.connect();
  }

  async close() {
    await this.client.$disconnect();
    await this.redis.close();
  }

  async getUser(fid: string) {
    return await this.client.user.findFirst({
      where: {
        fid,
      },
    });
  }

  async createUser(fid: string, refreshToken: string) {
    const date = new Date();
    return await this.client.user.create({
      data: {
        fid,
        signedUpAt: date,
        loggedInAt: date,
        refreshToken,
        signerEnabled: false,
      },
    });
  }

  async getNooksByUser(fid: string) {
    const memberships = await this.client.nookMembership.findMany({
      where: {
        user: {
          fid,
        },
      },
    });

    return await Promise.all(
      memberships.map((membership) => this.getNook(membership.nookId)),
    );
  }

  async getSigner(fid: string, active?: boolean) {
    const states = [];
    if (active) {
      states.push("completed");
    } else {
      states.push("completed");
      states.push("pending");
    }

    return await this.client.signer.findFirst({
      where: {
        fid,
        state: {
          in: states,
        },
      },
    });
  }

  async createPendingSigner(fid: string) {
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

  async validateSigner(token: string) {
    const { state, userFid } = await validateWarpcastSigner(token);
    if (state === "completed") {
      const signer = await this.client.signer.update({
        where: {
          token,
        },
        data: {
          state,
          fid: userFid.toString(),
        },
      });

      await this.client.user.update({
        where: {
          fid: signer.fid,
        },
        data: {
          signerEnabled: true,
        },
      });
    }

    return state;
  }

  async getNook(id: string): Promise<NookResponse> {
    const cached = await this.redis.getJson(`${this.NOOK_CACHE_PREFIX}:${id}`);
    if (cached) {
      return cached;
    }

    const nook = await this.fetchNook(id);
    if (!nook) {
      throw new Error(`Nook not found ${id}`);
    }

    const creator = await this.farcasterClient.getUser(nook.creatorFid);

    const nookResponse: NookResponse = {
      id: nook.id,
      name: nook.name,
      description: nook.description || undefined,
      imageUrl: nook.imageUrl || undefined,
      creator: creator,
      metadata: nook.metadata as NookMetadata,
      createdAt: nook.createdAt.getTime(),
      updatedAt: nook.updatedAt.getTime(),
    };

    await this.redis.setJson(`${this.NOOK_CACHE_PREFIX}:${id}`, nookResponse);

    return nookResponse;
  }

  async fetchNook(id: string) {
    return await this.client.nook.findUnique({
      where: {
        id,
      },
    });
  }
}
