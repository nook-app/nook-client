import { Channel, FarcasterUser } from "./farcaster";

export type ListMetadata = {
  creatorFid: string;
  name: string;
  description: string;
  imageUrl: string;
  type: "USER" | "CHANNEL";
  visibility: "PUBLIC" | "PRIVATE" | "HIDDEN";
};

export type UserList = ListMetadata & {
  id: string;
  users: FarcasterUser[];
};

export type ChannelList = ListMetadata & {
  id: string;
  channels: Channel[];
};

export type CreateListRequest = ListMetadata & {
  id: string;
  itemIds: string[];
};
