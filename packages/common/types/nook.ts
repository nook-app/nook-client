import { FarcasterCastResponse } from "./api";
import { FarcasterUser } from "./farcaster";

export type Nook = {
  id: string;
  creatorFid: string;
  name: string;
  description?: string;
  imageUrl?: string;
  visibility: "PUBLIC" | "PRIVATE" | "HIDDEN";
  metadata: NookMetadata;
  shelves: NookShelfInstance[];
};

export type NookMetadata = {
  isHome?: boolean;
};

export type NookShelf = {
  id: string;
  creatorFid: string;
  name: string;
  description?: string;
  imageUrl?: string;
  protocol: ShelfProtocol;
  type: ShelfType;
  api: string;
  form: ShelfForm;
  renderers: ShelfRenderer[];
};

export type NookShelfInstance = {
  id: string;
  nookId: string;
  shelfId: string;
  creatorFid: string;
  name: string;
  description?: string;
  imageUrl?: string;
  type: ShelfType;
  renderer: ShelfRenderer;
  // biome-ignore lint/suspicious/noExplicitAny: data is a shelf-specific field
  data: Record<string, any>;
};

export enum ShelfProtocol {
  FARCASTER = "FARCASTER",
}

export enum ShelfType {
  FARCASTER_USER = "FARCASTER_USER",
  FARCASTER_USERS = "FARCASTER_USERS",
  FARCASTER_POSTS = "FARCASTER_POSTS",
  FARCASTER_MEDIA = "FARCASTER_MEDIA",
  FARCASTER_FRAMES = "FARCASTER_FRAMES",
  FARCASTER_EMBEDS = "FARCASTER_EMBEDS",
}

export enum ShelfRenderer {
  USER_PROFILE = "USER_PROFILE",
  USER_LIST = "USER_LIST",
  POST_DEFAULT = "POST_DEFAULT",
  POST_MEDIA = "POST_MEDIA",
  POST_MEDIA_GRID = "POST_MEDIA_GRID",
  POST_FRAMES = "POST_FRAMES",
  POST_EMBEDS = "POST_EMBEDS",
}

export type CreateShelfInstance<T = ShelfArgs> = {
  shelfId: string;
  creatorFid: string;
  name: string;
  description?: string;
  imageUrl?: string;
  type: string;
  renderer: string;
  data: T;
};

export type ShelfDataRequest<T = ShelfArgs> = {
  data: T;
  context: {
    viewerFid?: string;
  };
  cursor?: string;
};

export type ShelfDataResponse<T = ShelfDataResponseItem> = {
  data: T[];
  nextCursor?: string;
};

export type ShelfDataResponseItem =
  | string
  | FarcasterCastResponse
  | FarcasterUser;

export type ShelfArgs =
  | FarcasterUserArgs
  | FarcasterUserListArgs
  | FarcasterPostArgs
  | FarcasterMediaArgs
  | FarcasterFrameArgs
  | FarcasterEmbedArgs;

export type FarcasterUserArgs = {
  fid: string;
};

export type FarcasterUserListArgs = {
  users: UserFilter;
};

export type FarcasterPostArgs = {
  channels?: ChannelFilter;
  users?: UserFilter;
  query?: string;
  muteWords?: string[];
  replies?: "include" | "only";
  timeWindow?: "1h" | "6h" | "12h" | "24h";
};

export type FarcasterMediaArgs = {
  channels?: ChannelFilter;
  users?: UserFilter;
  replies?: "include" | "only";
};

export type FarcasterFrameArgs = {
  urls?: string[];
  channels?: ChannelFilter;
  users?: UserFilter;
  replies?: "include" | "only";
};

export type FarcasterEmbedArgs = {
  urls?: string[];
  channels?: ChannelFilter;
  users?: UserFilter;
  replies?: "include" | "only";
};

export enum UserFilterType {
  FOLLOWING = "FOLLOWING",
  FIDS = "FIDS",
}

export type UserFilter =
  | {
      type: UserFilterType.FOLLOWING;
      data: {
        fid: string;
      };
    }
  | {
      type: UserFilterType.FIDS;
      data: {
        fids: string[];
      };
    };

export enum ChannelFilterType {
  CHANNEL_IDS = "CHANNEL_IDS",
  CHANNEL_URLS = "CHANNEL_URLS",
}

export type ChannelFilter =
  | {
      type: ChannelFilterType.CHANNEL_IDS;
      data: {
        channelIds: string[];
      };
    }
  | {
      type: ChannelFilterType.CHANNEL_URLS;
      data: {
        urls: string[];
      };
    };

export type ShelfForm = {
  steps: ShelfFormStep[];
};

export type ShelfFormStep = {
  fields: ShelfFormField[];
};

export type ShelfFormField<T = ShelfFormComponent> = {
  name: string;
  description: string;
  field: string;
  component: T;
  required?: boolean;
};

export type ShelfFormComponent =
  | ShelfFormComponentSelectUsers
  | ShelfFormComponentSelectChannels
  | ShelfFormComponentInput
  | ShelfFormComponentMultiInput
  | ShelfFormComponentSwitch
  | ShelfFormComponentSelect;

export type ShelfFormComponentSelectUsers = {
  type: ShelfFormComponentType.SELECT_USERS;
  allowed: UserFilterType[];
  limit?: number;
};

export type ShelfFormComponentSelectChannels = {
  type: ShelfFormComponentType.SELECT_CHANNELS;
  allowed: ChannelFilterType[];
  limit?: number;
};

export type ShelfFormComponentInput = {
  type: ShelfFormComponentType.INPUT;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  defaultValue?: string;
};

export type ShelfFormComponentMultiInput = {
  type: ShelfFormComponentType.MULTI_INPUT;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  limit?: number;
};

export type ShelfFormComponentSwitch = {
  type: ShelfFormComponentType.SWITCH;
  defaultValue?: boolean;
};

export type ShelfFormComponentSelect = {
  type: ShelfFormComponentType.SELECT_OPTION;
  options: {
    value: string;
    label: string;
  }[];
};

export enum ShelfFormComponentType {
  SELECT_OPTION = "SELECT_OPTION",
  SELECT_USERS = "SELECT_USERS",
  SELECT_CHANNELS = "SELECT_CHANNELS",
  INPUT = "INPUT",
  MULTI_INPUT = "MULTI_INPUT",
  SWITCH = "SWITCH",
}
