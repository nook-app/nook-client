import { FarcasterAPIClient } from "@nook/common/clients";
import {
  Channel,
  FarcasterUser,
  List,
  ListItemType,
  ListType,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";

export class ListService {
  private farcasterApi;

  constructor(fastify: FastifyInstance) {
    this.farcasterApi = new FarcasterAPIClient();
  }

  async enrichLists(lists: List[]): Promise<List[]> {
    const userLists = lists.filter(({ type }) => type === ListType.USERS);
    const channelLists = lists.filter(
      ({ type }) => type === ListType.PARENT_URLS,
    );

    const fids = userLists.flatMap(this.getFidsForUserList);
    const parentUrls = channelLists.flatMap(this.getParentUrlsForChannelList);

    const [users, channels] = await Promise.all([
      this.farcasterApi.getUsers({ fids }),
      this.farcasterApi.getChannels({ parentUrls }),
    ]);

    const userMap = users.data.reduce(
      (acc, user) => {
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUser>,
    );

    const channelMap = channels.data.reduce(
      (acc, channel) => {
        acc[channel.url] = channel;
        return acc;
      },
      {} as Record<string, Channel>,
    );

    return lists.map((list) => {
      const users = this.getFidsForUserList(list)
        .map((fid) => userMap[fid])
        .filter(Boolean);
      const channels = this.getParentUrlsForChannelList(list)
        .map((url) => channelMap[url])
        .filter(Boolean);
      return {
        ...list,
        users: users.length > 0 ? users : undefined,
        channels: channels.length > 0 ? channels : undefined,
      };
    });
  }

  getFidsForUserList(list: List): string[] {
    return list.items
      .filter(({ type }) => type === ListItemType.FID)
      .map(({ id }) => id);
  }

  getParentUrlsForChannelList(list: List): string[] {
    return list.items
      .filter(({ type }) => type === ListItemType.PARENT_URL)
      .map(({ id }) => id);
  }
}
