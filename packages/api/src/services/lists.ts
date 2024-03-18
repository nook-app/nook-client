import { FastifyInstance } from "fastify";
import { List, ListItem, PrismaClient } from "@nook/common/prisma/nook";
import { FarcasterAPIClient } from "@nook/common/clients";
import {
  FarcasterUser,
  ListMetadata,
  Channel,
  CreateListRequest,
} from "@nook/common/types";

export class ListService {
  private nookClient: PrismaClient;
  private farcaster: FarcasterAPIClient;

  constructor(fastify: FastifyInstance) {
    this.nookClient = fastify.nook.client;
    this.farcaster = new FarcasterAPIClient();
  }

  async getList(listId: string) {
    return await this.nookClient.list.findUnique({
      where: {
        id: listId,
      },
      include: {
        items: true,
      },
    });
  }

  async getUserLists(fid: string, viewerFid?: string) {
    const response = await this.nookClient.list.findMany({
      where: {
        creatorFid: fid,
        visibility: "PUBLIC",
      },
      include: {
        items: true,
      },
    });

    return this.formatUserLists(response, viewerFid);
  }

  async formatUserLists(
    lists: (List & { items: ListItem[] })[],
    viewerFid?: string,
  ) {
    const fids = [];
    for (const list of lists) {
      if (list.type === "USER") {
        fids.push(...list.items.map((user) => user.id));
      }
    }

    const users = await this.farcaster.getUsers({ fids }, viewerFid);

    const userMap = users?.data.reduce(
      (acc, user) => {
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUser>,
    );

    return lists.map((list) => ({
      id: list.id,
      creatorFid: list.creatorFid,
      name: list.name,
      description: list.description,
      imageUrl: list.imageUrl,
      items: list.items.map((user) => userMap[user.id]),
    }));
  }

  async getChannelLists(fid: string, viewerFid?: string) {
    const response = await this.nookClient.list.findMany({
      where: {
        creatorFid: fid,
        visibility: "PUBLIC",
      },
      include: {
        items: true,
      },
    });
    return this.formatChannelLists(response, viewerFid);
  }

  async formatChannelLists(
    lists: (List & { items: ListItem[] })[],
    viewerFid?: string,
  ) {
    const channelIds = [];
    for (const list of lists) {
      if (list.type === "CHANNEL") {
        channelIds.push(...list.items.map((channel) => channel.id));
      }
    }

    const channels = await this.farcaster.getChannels(
      { channelIds },
      viewerFid,
    );

    const channelMap = channels?.data.reduce(
      (acc, channel) => {
        acc[channel.channelId] = channel;
        return acc;
      },
      {} as Record<string, Channel>,
    );

    return lists.map((list) => ({
      id: list.id,
      creatorFid: list.creatorFid,
      name: list.name,
      description: list.description,
      imageUrl: list.imageUrl,
      items: list.items.map((channel) => channelMap[channel.id]),
    }));
  }

  async createList(fid: string, list: CreateListRequest) {
    return this.nookClient.list.create({
      data: {
        ...list,
        creatorFid: fid,
        items: {
          createMany: {
            data: list.itemIds.map((id) => ({
              id,
            })),
            skipDuplicates: true,
          },
        },
      },
    });
  }

  async updateList(listId: string, list: ListMetadata) {
    return this.nookClient.list.update({
      where: {
        id: listId,
      },
      data: list,
    });
  }

  async deleteList(listId: string) {
    return this.nookClient.list.updateMany({
      where: {
        id: listId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async addToList(listId: string, id: string) {
    return this.nookClient.list.update({
      where: {
        id: listId,
      },
      data: {
        items: {
          create: {
            id,
          },
        },
      },
    });
  }

  async removeFromList(listId: string, id: string) {
    return this.nookClient.list.update({
      where: {
        id: listId,
      },
      data: {
        items: {
          delete: {
            listId_id: {
              listId,
              id,
            },
          },
        },
      },
    });
  }
}
