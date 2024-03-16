export type Nook = {
  id: string;
  creatorFid: string;
  name: string;
  description: string;
  imageUrl: string;
  visibility: "PUBLIC" | "PRIVATE" | "HIDDEN";
  metadata: NookMetadata;
};

export type NookMetadata = {
  categories: NookCategory[];
};

export type NookCategory = {
  id: string;
  name: string;
  shelves: NookShelf[];
};

export type NookShelfBase = {
  id: string;
  name: string;
  description: string;
};

export type NookShelf =
  | (NookShelfBase & {
      service: "FARCASTER";
      type: "FARCASTER_FEED";
      data: {
        api: "/v0/feeds/farcaster";
        args: {
          feedId: string;
        };
        displayMode: "MEDIA" | "FRAME" | "REPLIES" | "GRID" | "DEFAULT";
      };
    })
  | (NookShelfBase & {
      service: "FARCASTER";
      type: "FARCASTER_EVENTS";
      data: {
        api: "/v0/feeds/farcaster-events";
        args: {
          feedId: string;
        };
      };
    })
  | (NookShelfBase & {
      service: "FARCASTER";
      type: "FARCASTER_PROFILE";
      data: {
        fid?: string;
      };
    })
  | (NookShelfBase & {
      service: "ONCEUPON";
      type: "TRANSACTION_FEED";
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
