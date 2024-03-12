export type Nook = {
  id: string;
  creatorFid: string;
  name: string;
  description: string;
  imageUrl: string;
  shelves: NookShelf[];
};

type NookShelfBase = {
  id: string;
  name: string;
  description: string;
};

export type NookShelf =
  | (NookShelfBase & {
      type: NookShelfType;
      args: NookShelfArgs[NookShelfType];
    })
  | (NookShelfBase & {
      type: NookShelfType.FarcasterFeed;
      args: FarcasterFeedArgs;
    })
  | (NookShelfBase & {
      type: NookShelfType.FarcasterProfile;
      args: FarcasterProfileArgs;
    });

export enum NookShelfType {
  FarcasterFeed = "FarcasterFeed",
  FarcasterProfile = "FarcasterProfile",
}

export type NookShelfArgs = {
  [NookShelfType.FarcasterFeed]: FarcasterFeedArgs;
  [NookShelfType.FarcasterProfile]: FarcasterProfileArgs;
};

export enum UserFilterType {
  Following = "following",
  Fids = "fids",
}

export type UserFilterFollowingArgs = {
  degree: number;
};

export type UserFilterFidsArgs = {
  fids: string[];
};

export type UserFilter =
  | {
      type: UserFilterType.Following;
      args: UserFilterFollowingArgs;
    }
  | {
      type: UserFilterType.Fids;
      args: UserFilterFidsArgs;
    };

export type ContentFilter = {
  types?: string[];
  frames?: boolean;
};

export type ChannelFilter = {
  channelIds: string[];
};

export type FarcasterFeedContext = {
  viewerFid?: string;
};

export type FarcasterFeedArgs = {
  userFilter?: UserFilter;
  contentFilter?: ContentFilter;
  channelFilter?: ChannelFilter;
  replies?: boolean;
  context?: FarcasterFeedContext;
};

export type FarcasterProfileArgs = {
  fid: string;
};
