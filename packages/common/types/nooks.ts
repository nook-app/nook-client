import { ObjectId } from "mongodb";

export enum NookType {
  Entity = "entity",
  Entities = "entities",
  Channel = "channel",
  Channels = "channels",
  Content = "content",
  Custom = "custom",
}

export type Nook = {
  _id: ObjectId;
  type: NookType;
  nookId: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  shelves: NookShelf[];
  creatorId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type NookShelf = {
  name: string;
  slug: string;
  description: string;
  panels: NookPanel[];
};

export enum NookPanelType {
  ContentFeed = "CONTENT_FEED",
}

export type NookPanel = {
  name: string;
  slug: string;
  type: NookPanelType;
  args: ContentFeedArgs;
};

export type ContentFeedArgs = {
  // biome-ignore lint/suspicious/noExplicitAny: filter is a dynamic object
  filter: Record<string, any>;
  sort?: string;
  sortDirection?: number;
};
