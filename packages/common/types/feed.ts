import { ChannelFilter, UserFilter } from "./nook";

export type FarcasterFeed = {
  api: string;
  filter: FarcasterFeedFilter;
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
  context?: FeedContext;
  cursor?: string;
};

export enum Display {
  CASTS = "CASTS",
  REPLIES = "REPLIES",
  MEDIA = "MEDIA",
  GRID = "GRID",
  MASONRY = "MASONRY",
  FRAMES = "FRAMES",
  EMBEDS = "EMBEDS",
  LIST = "LIST",
  NOTIFICATION = "NOTIFICATION",
}

export type TransactionFeedRequest = {
  filter: TransactionFeedFilter;
  cursor?: string;
};

export type TransactionFeedFilter = {
  users?: UserFilter;
  chains?: number[];
  contextActions?: string[];
};

export type NftFeedRequest = {
  filter: NftFeedFilter;
  cursor?: string;
};

export type NftFeedFilter = {
  chains?: string[];
};
