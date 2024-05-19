export type FarcasterUserArgs = {
  fid: string;
};

export type FarcasterUserListArgs = {
  users: UserFilter;
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

export type CastActionV1Request = {
  name: string;
  icon: string;
  postUrl: string;
  actionType: string;
};

export type CastActionV2Request = {
  url: string;
};
