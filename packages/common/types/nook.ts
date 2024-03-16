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
    })
  | (NookShelfBase & {
      type: NookShelfType.TransactionFeed;
      args: TransactionFeedArgs;
    });

export enum NookShelfType {
  FarcasterFeed = "FarcasterFeed",
  FarcasterProfile = "FarcasterProfile",
  TransactionFeed = "TransactionFeed",
}

export type NookShelfArgs = {
  [NookShelfType.FarcasterFeed]: FarcasterFeedArgs;
  [NookShelfType.FarcasterProfile]: FarcasterProfileArgs;
  [NookShelfType.TransactionFeed]: TransactionFeedArgs;
};

export enum UserFilterType {
  Following = "following",
  Fids = "fids",
}

export type UserFilterFollowingArgs = {
  fid?: string;
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

export type FarcasterFeedArgs = {
  userFilter?: UserFilter;
  contentFilter?: ContentFilter;
  channelFilter?: ChannelFilter;
  textFilter?: {
    query: string;
  };
  replies?: boolean;
  displayMode?: FarcasterFeedDisplayMode;
};

export type FarcasterProfileArgs = {
  fid: string;
};

export type FarcasterFeedDisplayMode =
  | "media"
  | "frame"
  | "replies"
  | "grid"
  | "default";

export type TransactionFeedArgs = {
  userFilter?: UserFilter;
};

export type RequestContext = {
  viewerFid?: string;
};

export type BaseNookShelfRequest = {
  context?: RequestContext;
};

export type FarcasterFeedRequest = BaseNookShelfRequest & {
  args: FarcasterFeedArgs;
};

export type FarcasterProfileRequest = BaseNookShelfRequest & {
  args: FarcasterProfileArgs;
};

export type TransactionFeedRequest = BaseNookShelfRequest & {
  args: TransactionFeedArgs;
};

export type NookShelfRequest =
  | FarcasterFeedRequest
  | FarcasterProfileRequest
  | TransactionFeedRequest;
