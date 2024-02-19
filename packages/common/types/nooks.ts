import { ObjectId } from "mongodb";

export enum NookSource {
  Entity = "ENTITY",
  Content = "CONTENT",
  Custom = "CUSTOM",
}

export type Nook = {
  _id: ObjectId;
  nookId: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  theme: string;
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
