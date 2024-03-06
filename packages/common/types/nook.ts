import { FarcasterUser } from "./farcaster";

export type NookResponse = {
  id: string;
  creator?: FarcasterUser;
  name: string;
  description?: string;
  metadata: NookMetadata;
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
};

export type NookMetadata = {
  shelves: NookShelf[];
};

export type NookShelf = {
  id: string;
  name: string;
  description?: string;
  panels: NookPanel[];
};

export enum NookPanelType {
  FarcasterFeed = "FARCASTER_FEED",
}

export type FarcasterFeedArgs = {
  feedId: string;
};

export type NookPanelArgs = {
  [NookPanelType.FarcasterFeed]: FarcasterFeedArgs;
};

export type NookPanelData = {
  type: NookPanelType;
  args: NookPanelArgs[NookPanelType];
};

export type NookPanel = {
  id: string;
  name: string;
  description?: string;
  data: NookPanelData;
};
