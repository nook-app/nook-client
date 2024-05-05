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

export enum PanelDisplay {
  CASTS = "CASTS",
  MEDIA = "MEDIA",
  GRID = "GRID",
  MASONRY = "MASONRY",
  FRAMES = "FRAMES",
  EMBEDS = "EMBEDS",
}

export type CreateFeedRequest = {
  name: string;
  api?: string;
  icon?: string;
  filter: FarcasterFeedFilter;
  type?: string;
  display?: PanelDisplay;
};

export type TransactionFeedRequest = {
  filter: TransactionFeedFilter;
  cursor?: string;
};

export type TransactionFeedFilter = {
  users?: UserFilter;
  chains?: number[];
};

export type NftFeedRequest = {
  filter: NftFeedFilter;
  cursor?: string;
};

export type NftFeedFilter = {
  chains?: string[];
};
