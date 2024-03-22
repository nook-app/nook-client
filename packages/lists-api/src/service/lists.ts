import { FastifyInstance } from "fastify";
import {
  UserList,
  UserListItem,
  PrismaClient,
  ChannelList,
  ChannelListItem,
} from "@nook/common/prisma/lists";
import { FarcasterAPIClient } from "@nook/common/clients";
import {
  FarcasterUser,
  ListMetadata,
  Channel,
  CreateUserListRequest,
  CreateChannelListRequest,
} from "@nook/common/types";

export class ListsService {
  private listsClient: PrismaClient;
  private farcaster: FarcasterAPIClient;

  constructor(fastify: FastifyInstance) {
    this.listsClient = fastify.lists.client;
    this.farcaster = new FarcasterAPIClient();
  }

  async getUserList(listId: string) {
    return await this.listsClient.userList.findUnique({
      where: {
        id: listId,
      },
      include: {
        items: true,
      },
    });
  }

  async getUserLists(fid: string, viewerFid?: string) {
    const response = await this.listsClient.userList.findMany({
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
    lists: (UserList & { items: UserListItem[] })[],
    viewerFid?: string,
  ) {
    const fids = [];
    for (const list of lists) {
      fids.push(...list.items.map((user) => user.fid));
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
      items: list.items.map((user) => userMap[user.fid]),
    }));
  }

  async createUserList(fid: string, list: CreateUserListRequest) {
    return this.listsClient.userList.create({
      data: {
        ...list,
        creatorFid: fid,
        items: {
          createMany: {
            data: list.fids.map((fid) => ({
              fid,
            })),
            skipDuplicates: true,
          },
        },
      },
    });
  }

  async updateUserList(listId: string, list: ListMetadata) {
    return this.listsClient.userList.update({
      where: {
        id: listId,
      },
      data: list,
    });
  }

  async deleteUserList(listId: string) {
    return this.listsClient.userList.updateMany({
      where: {
        id: listId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async addToUserList(listId: string, fid: string) {
    return this.listsClient.userList.update({
      where: {
        id: listId,
      },
      data: {
        items: {
          create: {
            fid,
          },
        },
      },
    });
  }

  async removeFromUserList(userListId: string, fid: string) {
    return this.listsClient.userList.update({
      where: {
        id: userListId,
      },
      data: {
        items: {
          delete: {
            userListId_fid: {
              userListId: userListId,
              fid,
            },
          },
        },
      },
    });
  }

  async getChannelList(listId: string) {
    return await this.listsClient.channelList.findUnique({
      where: {
        id: listId,
      },
      include: {
        items: true,
      },
    });
  }

  async getChannelLists(fid: string, viewerFid?: string) {
    const response = await this.listsClient.channelList.findMany({
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
    lists: (ChannelList & { items: ChannelListItem[] })[],
    viewerFid?: string,
  ) {
    const channelIds = [];
    for (const list of lists) {
      channelIds.push(...list.items.map((channel) => channel.id));
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

  async createChannelList(fid: string, list: CreateChannelListRequest) {
    return this.listsClient.channelList.create({
      data: {
        ...list,
        creatorFid: fid,
        items: {
          createMany: {
            data: list.channelIds.map((channelId) => ({
              id: channelId,
            })),
            skipDuplicates: true,
          },
        },
      },
    });
  }

  async updateChannelList(listId: string, list: ListMetadata) {
    return this.listsClient.channelList.update({
      where: {
        id: listId,
      },
      data: list,
    });
  }

  async deleteChannelList(listId: string) {
    return this.listsClient.channelList.updateMany({
      where: {
        id: listId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async addToChannelList(listId: string, channelId: string) {
    return this.listsClient.channelList.update({
      where: {
        id: listId,
      },
      data: {
        items: {
          create: {
            id: channelId,
          },
        },
      },
    });
  }

  async removeFromChannelList(channelListId: string, channelId: string) {
    return this.listsClient.channelList.update({
      where: {
        id: channelListId,
      },
      data: {
        items: {
          delete: {
            channelListId_id: {
              channelListId: channelListId,
              id: channelId,
            },
          },
        },
      },
    });
  }
}
