export enum Display {
  CASTS = "CASTS",
  MEDIA = "MEDIA",
  GRID = "GRID",
  MASONRY = "MASONRY",
  FRAMES = "FRAMES",
  EMBEDS = "EMBEDS",
  REPLIES = "REPLIES",
}

export type FarcasterFeed = {
  api: string;
  filter: FarcasterFeedFilter;
  display: Display;
};

export type FarcasterFeedFilter = {
  channels?: ChannelFilter;
  users?: UserFilter;
  text?: string[];
  embeds?: string[];
  contentTypes?: string[];
  includeReplies?: boolean;
  onlyReplies?: boolean;
  onlyFrames?: boolean;
};

export type FeedContext = {
  viewerFid?: string;
  mutedWords?: string[];
  mutedUsers?: string[];
  mutedChannels?: string[];
};

export type FarcasterFeedRequest = {
  api?: string;
  filter: FarcasterFeedFilter;
  context: FeedContext;
  cursor?: string;
};

export type PanelRequest = {
  id: string;
  fid: string;
  type: string;
  key: string;
  context: FeedContext;
  cursor?: string;
};

export enum UserFilterType {
  FOLLOWING = "FOLLOWING",
  FIDS = "FIDS",
  POWER_BADGE = "POWER_BADGE",
  USER_LIST = "USER_LIST",
}

export type UserFilter =
  | {
      type: UserFilterType.FOLLOWING;
      data: {
        fid: string;
      };
    }
  | {
      type: UserFilterType.FIDS;
      data: {
        fids: string[];
      };
    }
  | {
      type: UserFilterType.POWER_BADGE;
      data: {
        badge: boolean;
        fid?: string;
      };
    }
  | {
      type: UserFilterType.USER_LIST;
      data: {
        listId: string;
      };
    };

export enum ChannelFilterType {
  FOLLOWING = "FOLLOWING",
  CHANNEL_IDS = "CHANNEL_IDS",
  CHANNEL_URLS = "CHANNEL_URLS",
  CHANNEL_LIST = "CHANNEL_LIST",
}

export type ChannelFilter =
  | {
      type: ChannelFilterType.FOLLOWING;
      data: {
        fid: string;
      };
    }
  | {
      type: ChannelFilterType.CHANNEL_IDS;
      data: {
        channelIds: string[];
      };
    }
  | {
      type: ChannelFilterType.CHANNEL_URLS;
      data: {
        urls: string[];
      };
    }
  | {
      type: ChannelFilterType.CHANNEL_LIST;
      data: {
        listId: string;
      };
    };

export type CreateFeedRequest = {
  name: string;
  api?: string;
  icon?: string;
  filter: FarcasterFeedFilter;
  type?: string;
  display?: Display;
};

export type Feed = CreateFeedRequest & {
  id: string;
};
