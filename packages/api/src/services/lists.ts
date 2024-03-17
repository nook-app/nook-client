import { FastifyInstance } from "fastify";
import { PrismaClient } from "@nook/common/prisma/nook";
import { FarcasterAPIClient } from "@nook/common/clients";
import {
  Channel,
  ChannelList,
  FarcasterUser,
  ListMetadata,
  UserList,
} from "@nook/common/types";

export class ListService {
  private nookClient: PrismaClient;
  private farcaster: FarcasterAPIClient;

  constructor(fastify: FastifyInstance) {
    this.nookClient = fastify.nook.client;
    this.farcaster = new FarcasterAPIClient();
  }

  async getUserLists(fid: string, viewerFid?: string) {
    const response = await this.nookClient.userList.findMany({
      where: {
        creatorFid: fid,
      },
      include: {
        users: true,
      },
    });

    const users = await this.farcaster.getUsers(
      { fids: response.flatMap((list) => list.users.map((user) => user.fid)) },
      viewerFid,
    );

    const userMap = users.data.reduce(
      (acc, user) => {
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUser>,
    );

    return response.map((list) => ({
      id: list.id,
      creatorFid: list.creatorFid,
      name: list.name,
      description: list.description,
      imageUrl: list.imageUrl,
      users: list.users.map((user) => userMap[user.fid]),
    }));
  }

  async getUserList(listId: string, viewerFid?: string) {
    const list = await this.nookClient.userList.findUnique({
      where: {
        id: listId,
      },
      include: {
        users: true,
      },
    });

    if (!list) {
      return;
    }

    const users = await this.farcaster.getUsers(
      { fids: list.users.map((user) => user.fid) },
      viewerFid,
    );

    const userMap = users.data.reduce(
      (acc, user) => {
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUser>,
    );

    return {
      id: list.id,
      creatorFid: list.creatorFid,
      name: list.name,
      description: list.description,
      imageUrl: list.imageUrl,
      users: list.users.map((user) => userMap[user.fid]),
    };
  }

  async createUserList(fid: string, list: UserList) {
    return this.nookClient.userList.create({
      data: {
        ...list,
        creatorFid: fid,
        users: {
          createMany: {
            data: list.users.map((user) => ({
              fid: user.fid,
            })),
            skipDuplicates: true,
          },
        },
      },
    });
  }

  async updateUserList(listId: string, list: ListMetadata) {
    return this.nookClient.userList.update({
      where: {
        id: listId,
      },
      data: list,
    });
  }

  async deleteUserList(listId: string) {
    return this.nookClient.userList.delete({
      where: {
        id: listId,
      },
    });
  }

  async addToUserList(listId: string, fid: string) {
    return this.nookClient.userList.update({
      where: {
        id: listId,
      },
      data: {
        users: {
          create: {
            fid,
          },
        },
      },
    });
  }

  async removeFromUserList(listId: string, fid: string) {
    return this.nookClient.userList.update({
      where: {
        id: listId,
      },
      data: {
        users: {
          delete: {
            listId_fid: {
              listId,
              fid,
            },
          },
        },
      },
    });
  }

  async getChannelLists(fid: string, viewerFid?: string) {
    const response = await this.nookClient.channelList.findMany({
      where: {
        creatorFid: fid,
      },
      include: {
        channels: true,
      },
    });

    const channels = await this.farcaster.getChannels({
      channelIds: response.flatMap((list) =>
        list.channels.map((channel) => channel.channelId),
      ),
    });

    const channelMap = channels.data.reduce(
      (acc, channel) => {
        acc[channel.channelId] = channel;
        return acc;
      },
      {} as Record<string, Channel>,
    );

    return response.map((list) => ({
      id: list.id,
      creatorFid: list.creatorFid,
      name: list.name,
      description: list.description,
      imageUrl: list.imageUrl,
      channels: list.channels.map((channel) => channelMap[channel.channelId]),
    }));
  }

  async getChannelList(listId: string, viewerFid?: string) {
    const list = await this.nookClient.channelList.findUnique({
      where: {
        id: listId,
      },
      include: {
        channels: true,
      },
    });

    if (!list) {
      return;
    }

    const channels = await this.farcaster.getChannels({
      channelIds: list.channels.map((channel) => channel.channelId),
    });

    const channelMap = channels.data.reduce(
      (acc, channel) => {
        acc[channel.channelId] = channel;
        return acc;
      },
      {} as Record<string, Channel>,
    );

    return {
      id: list.id,
      creatorFid: list.creatorFid,
      name: list.name,
      description: list.description,
      imageUrl: list.imageUrl,
      channels: list.channels.map((channel) => channelMap[channel.channelId]),
    };
  }

  async createChannelList(fid: string, list: ChannelList) {
    return this.nookClient.channelList.create({
      data: {
        ...list,
        creatorFid: fid,
        channels: {
          createMany: {
            data: list.channels.map((channel) => ({
              channelId: channel.channelId,
            })),
            skipDuplicates: true,
          },
        },
      },
    });
  }

  async updateChannelList(listId: string, list: ListMetadata) {
    return this.nookClient.channelList.update({
      where: {
        id: listId,
      },
      data: list,
    });
  }

  async deleteChannelList(listId: string) {
    return this.nookClient.channelList.delete({
      where: {
        id: listId,
      },
    });
  }

  async addToChannelList(listId: string, channelId: string) {
    return this.nookClient.channelList.update({
      where: {
        id: listId,
      },
      data: {
        channels: {
          create: { channelId },
        },
      },
    });
  }

  async removeFromChannelList(listId: string, channelId: string) {
    return this.nookClient.channelList.update({
      where: {
        id: listId,
      },
      data: {
        channels: {
          delete: {
            listId_channelId: {
              listId,
              channelId,
            },
          },
        },
      },
    });
  }
}
