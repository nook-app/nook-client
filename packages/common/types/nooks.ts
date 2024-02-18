export type Nook = {
  name: string;
  slug: string;
  description: string;
  image: string;
  theme: string;
  shelves: NookShelf[];
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
