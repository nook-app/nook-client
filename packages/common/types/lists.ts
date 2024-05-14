export type ListType = "USERS" | "PARENT_URLS" | "CASTS";
export type ListItemType = "FID" | "ETH_ADDRESS" | "PARENT_URL" | "CAST_HASH";
export type ListVisibility = "PUBLIC" | "PRIVATE";

export type List = {
  id: string;
  type: ListType;
  creatorId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  visibility: ListVisibility;
};

export type ListItem = {
  listId: string;
  type: ListItemType;
  id: string;
};

export type CreateListRequest = {
  type: ListType;
  name: string;
  description?: string;
  imageUrl?: string;
  visibility: ListVisibility;
};

export type UpdateListRequest = {
  name: string;
  description?: string;
  imageUrl?: string;
  visibility: ListVisibility;
};
