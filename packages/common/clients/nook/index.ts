import { Channel, PrismaClient } from "../../prisma/nook";
import { RedisClient } from "../../redis";
import {
  generateKeyPair,
  getWarpcastDeeplink,
  validateWarpcastSigner,
} from "../../signer";
import { EntityResponse, NookMetadata, NookResponse } from "../../types";
import { EntityClient } from "../entity";

export class NookClient {
  private client: PrismaClient;
  private redis: RedisClient;
  private entityClient: EntityClient;

  FEED_CACHE_PREFIX = "feed";
  CHANNEL_CACHE_PREFIX = "channel";
  NOOK_CACHE_PREFIX = "nook";

  constructor() {
    this.client = new PrismaClient();
    this.redis = new RedisClient();
    this.entityClient = new EntityClient();
  }

  async connect() {
    await this.client.$connect();
    await this.redis.connect();
  }

  async close() {
    await this.client.$disconnect();
    await this.redis.close();
  }

  async getUser(id: string) {
    return await this.client.user.findUnique({
      where: {
        id,
      },
    });
  }

  async createUser(id: string, refreshToken: string) {
    const date = new Date();
    return await this.client.user.create({
      data: {
        id,
        signedUpAt: date,
        loggedInAt: date,
        refreshToken,
        signerEnabled: false,
      },
    });
  }

  async getNooksByUser(id: string) {
    const memberships = await this.client.nookMembership.findMany({
      where: {
        userId: id,
      },
    });

    return await Promise.all(
      memberships.map((membership) => this.getNook(membership.nookId)),
    );
  }

  async getSigner(id: string, active?: boolean) {
    const states = [];
    if (active) {
      states.push("completed");
    } else {
      states.push("completed");
      states.push("pending");
    }

    return await this.client.signer.findFirst({
      where: {
        userId: id,
        state: {
          in: states,
        },
      },
    });
  }

  async createPendingSigner(id: string) {
    const { publicKey, privateKey } = await generateKeyPair();
    const { token, deeplinkUrl, state } = await getWarpcastDeeplink(publicKey);

    return await this.client.signer.create({
      data: {
        userId: id,
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
          id: signer.userId,
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

    const creator = await this.entityClient.getEntity(nook.creatorId);

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

  async getChannels(ids: string[]) {
    return await Promise.all(ids.map((id) => this.getChannel(id)));
  }

  async getChannel(id: string) {
    const cached = await this.redis.getJson(
      `${this.CHANNEL_CACHE_PREFIX}:${id}`,
    );
    if (cached) {
      return cached;
    }

    let channel = await this.fetchChannel(id);

    if (!channel) {
      channel = await this.createChannel(id);
    }

    if (channel) {
      await this.redis.setJson(`${this.CHANNEL_CACHE_PREFIX}:${id}`, channel);
    }

    return channel;
  }

  async fetchChannel(id: string) {
    return await this.client.channel.findUnique({
      where: {
        id,
      },
    });
  }

  async createChannel(id: string) {
    const channel = await this.fetchChannelFromSource(id);
    if (!channel) return null;

    await this.client.channel.upsert({
      where: {
        id,
      },
      update: channel,
      create: channel,
    });

    return channel;
  }

  async fetchChannelFromSource(id: string) {
    const response = await fetch("https://api.warpcast.com/v2/all-channels");
    if (!response.ok) {
      throw new Error("Failed to fetch channels");
    }

    const data = await response.json();
    const channels: {
      id: string;
      url: string;
      name: string;
      description: string;
      imageUrl: string;
      leadFid: number;
      createdAt: number;
    }[] = data?.result?.channels;
    if (!channels) {
      throw new Error("Channel not found");
    }

    const channelData = channels.find((channel) => channel.url === id);
    if (!channelData) {
      throw new Error("Channel not found");
    }

    let creator: EntityResponse | undefined;
    if (channelData.leadFid) {
      creator = await this.entityClient.getEntityByFid(
        BigInt(channelData.leadFid),
      );
    }

    const channel: Channel = {
      id,
      channelId: channelData.id,
      name: channelData.name,
      description: channelData.description,
      imageUrl: channelData.imageUrl,
      createdAt: new Date(channelData.createdAt * 1000),
      updatedAt: new Date(),
      creatorId: creator?.id || null,
    };

    return channel;
  }

  async getAllChannels() {
    return await this.client.channel.findMany({
      take: 25,
    });
  }
}
