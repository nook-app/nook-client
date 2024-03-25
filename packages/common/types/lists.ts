import { Channel, FarcasterUser } from "./farcaster";

export type ListMetadata = {
  creatorFid: string;
  name: string;
  description: string;
  imageUrl: string;
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

export type CreateUserListRequest = ListMetadata & {
  fids: string[];
};

export type CreateChannelListRequest = ListMetadata & {
  channelIds: string[];
};
