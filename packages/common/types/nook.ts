export type Nook = {
  id: string;
  creatorFid: string;
  name: string;
  description?: string;
  imageUrl?: string;
  visibility: "PUBLIC" | "PRIVATE" | "HIDDEN";
  metadata: NookMetadata;
};

export type NookMetadata = {
  categories: NookCategory[];
  shelves: NookShelf[];
};

export type NookCategory = {
  id: string;
  name: string;
  shelves: string[];
};

export type NookShelfBase = {
  id: string;
  name: string;
  description?: string;
};

export enum NookShelfType {
  FARCASTER_FEED = "FARCASTER_FEED",
  FARCASTER_EVENTS = "FARCASTER_EVENTS",
  FARCASTER_PROFILE = "FARCASTER_PROFILE",
  TRANSACTION_FEED = "TRANSACTION_FEED",
}

export enum DisplayMode {
  MEDIA = "MEDIA",
  FRAME = "FRAME",
  REPLIES = "REPLIES",
  GRID = "GRID",
  DEFAULT = "DEFAULT",
}

export type NookShelf =
  | (NookShelfBase & {
      service: "FARCASTER";
      type: NookShelfType.FARCASTER_FEED;
      data: {
        api: "/v0/feeds/farcaster";
        args: {
          feedId: string;
        };
        displayMode: DisplayMode;
      };
    })
  | (NookShelfBase & {
      service: "FARCASTER";
      type: NookShelfType.FARCASTER_EVENTS;
      data: {
        api: "/v0/feeds/farcaster-events";
        args: {
          feedId: string;
        };
      };
    })
  | (NookShelfBase & {
      service: "FARCASTER";
      type: NookShelfType.FARCASTER_PROFILE;
      data: {
        fid?: string;
      };
    })
  | (NookShelfBase & {
      service: "ONCEUPON";
      type: NookShelfType.TRANSACTION_FEED;
      data: {
        api: "/v0/feeds/transactions";
        args: {
          feedId: string;
        };
      };
    });

export enum UserFilterType {
  FOLLOWING = "FOLLOWING",
  FIDS = "FIDS",
}

export type UserFilter =
  | {
      type: UserFilterType.FOLLOWING;
      args: {
        fid?: string;
        degree: number;
      };
    }
  | {
      type: UserFilterType.FIDS;
      args: {
        fids: string[];
      };
    };

export type ContentFilter = {
  types?: string[];
  frames?: boolean;
  urls?: string[];
};

export type ChannelFilter = {
  channelIds: string[];
};

export type FarcasterFeedFilter = {
  userFilter?: UserFilter;
  contentFilter?: ContentFilter;
  channelFilter?: ChannelFilter;
  textFilter?: {
    query: string;
  };
  replies?: boolean;
};

export type TransactionFeedFilter = {
  userFilter?: UserFilter;
};

export type FeedFilter = FarcasterFeedFilter | TransactionFeedFilter;

export type RequestContext = {
  viewerFid?: string;
};

export type FarcasterFeedFilterWithContext = {
  filter: FarcasterFeedFilter;
  context?: RequestContext;
};

export type UserFilterWithContext = {
  filter: UserFilter;
  context?: RequestContext;
};

export type TransactionFeedFilterWithContext = {
  filter: TransactionFeedFilter;
  context?: RequestContext;
};

export type BaseCreateShelfRequest = {
  name: string;
  description: string;
};

export type CreateShelfRequest =
  | (BaseCreateShelfRequest & {
      type: NookShelfType.FARCASTER_FEED;
      data: {
        api: "/v0/feeds/farcaster";
        args: {
          filter: FarcasterFeedFilter;
        };
        displayMode: DisplayMode;
      };
    })
  | (BaseCreateShelfRequest & {
      type: NookShelfType.FARCASTER_EVENTS;
      data: {
        api: "/v0/feeds/farcaster-events";
        args: {
          filter: FarcasterFeedFilter;
        };
      };
    })
  | (BaseCreateShelfRequest & {
      type: NookShelfType.FARCASTER_PROFILE;
      data: {
        fid?: string;
      };
    })
  | (BaseCreateShelfRequest & {
      type: NookShelfType.TRANSACTION_FEED;
      data: {
        api: "/v0/feeds/transactions";
        args: {
          filter: TransactionFeedFilter;
        };
      };
    });
