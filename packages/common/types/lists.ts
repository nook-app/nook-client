import { Channel, FarcasterUser } from "./farcaster";
import { Display } from "./feed";

export enum ListType {
  USERS = "USERS",
  PARENT_URLS = "PARENT_URLS",
  CASTS = "CASTS",
}

export enum ListItemType {
  FID = "FID",
  ETH_ADDRESS = "ETH_ADDRESS",
  PARENT_URL = "PARENT_URL",
  CAST_HASH = "CAST_HASH",
}

export enum ListVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

type ListMetadata = {
  name: string;
  description?: string;
  imageUrl?: string;
  visibility: ListVisibility;
  displayMode?: Display;
};

export type ListItem = {
  listId: string;
  type: ListItemType;
  id: string;
};

export type List = ListMetadata & {
  id: string;
  type: ListType;
  creatorId: string;
  followerCount: number;
  itemCount: number;
  items: ListItem[];
  users?: FarcasterUser[];
  channels?: Channel[];
};

export type CreateListRequest = ListMetadata & {
  type: ListType;
};

export type UpdateListRequest = ListMetadata;

export type GetListsRequest = {
  userId: string;
  type: ListType;
  cursor?: string;
};
