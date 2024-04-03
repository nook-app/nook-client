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
  shelfOrder: string[];
};

export enum NookShelfTag {
  Frames = "Frames",
  Users = "Users",
  Feeds = "Feeds",
}

export type NookShelf = {
  id: string;
  creatorFid: string;
  name: string;
  description?: string;
  imageUrl?: string;
  protocol: ShelfProtocol;
  type: ShelfType;
  api: string;
  form: Form;
  renderers: ShelfRenderer[];
  tags?: NookShelfTag[];
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
  PIN_FRAME = "PIN_FRAME",
}

export enum ShelfRenderer {
  USER_PROFILE = "USER_PROFILE",
  USER_LIST = "USER_LIST",
  POST_DEFAULT = "POST_DEFAULT",
  POST_MEDIA = "POST_MEDIA",
  POST_MEDIA_GRID = "POST_MEDIA_GRID",
  POST_FRAMES = "POST_FRAMES",
  POST_EMBEDS = "POST_EMBEDS",
  PIN_FRAME = "PIN_FRAME",
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
  | FarcasterEmbedArgs
  | PinFrameArgs;

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
  queries?: string[];
  muteWords?: string[];
  includeReplies?: boolean;
  onlyReplies?: boolean;
  timeWindow?: "1h" | "6h" | "12h" | "24h";
};

export type FarcasterMediaArgs = {
  channels?: ChannelFilter;
  users?: UserFilter;
  includeReplies?: boolean;
  onlyReplies?: boolean;
};

export type FarcasterFrameArgs = {
  urls?: string[];
  channels?: ChannelFilter;
  users?: UserFilter;
  includeReplies?: boolean;
  onlyReplies?: boolean;
};

export type FarcasterEmbedArgs = {
  urls?: string[];
  channels?: ChannelFilter;
  users?: UserFilter;
  includeReplies?: boolean;
  onlyReplies?: boolean;
};

export type PinFrameArgs = {
  url: string;
};

export enum UserFilterType {
  FOLLOWING = "FOLLOWING",
  FIDS = "FIDS",
  POWER_BADGE = "POWER_BADGE",
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
    }
  | {
      type: UserFilterType.POWER_BADGE;
      data: {
        badge: boolean;
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

export type Form = {
  steps: FormStep[];
};

export type FormStep = {
  fields: FormField[];
};

export type FormField<T = FormComponent> = {
  name: string;
  description: string;
  field: string;
  component: T;
  required?: boolean;
};

export type FormComponent =
  | FormComponentSelectUsers
  | FormComponentSelectChannels
  | FormComponentInput
  | FormComponentMultiInput
  | FormComponentSwitch
  | FormComponentSelect
  | FormComponentIconPicker
  | FormComponentMultiUrl
  | FormComponentUrl;

export type FormComponentSelectUsers = {
  type: FormComponentType.SELECT_USERS;
  allowed: UserFilterType[];
  limit?: number;
};

export type FormComponentSelectChannels = {
  type: FormComponentType.SELECT_CHANNELS;
  allowed: ChannelFilterType[];
  limit?: number;
};

export type FormComponentInput = {
  type: FormComponentType.INPUT;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  defaultValue?: string;
};

export type FormComponentMultiInput = {
  type: FormComponentType.MULTI_INPUT;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  limit?: number;
};

export type FormComponentSwitch = {
  type: FormComponentType.SWITCH;
  defaultValue?: boolean;
};

export type FormComponentSelect = {
  type: FormComponentType.SELECT_OPTION;
  options: {
    value: string;
    label: string;
  }[];
};

export type FormComponentIconPicker = {
  type: FormComponentType.ICON_PICKER;
};

export type FormComponentMultiUrl = {
  type: FormComponentType.MULTI_URL;
  placeholder?: string;
  defaultValue?: string;
  hasFrame?: boolean;
};

export type FormComponentUrl = {
  type: FormComponentType.URL;
  placeholder?: string;
  defaultValue?: string;
  hasFrame?: boolean;
};

export enum FormComponentType {
  SELECT_OPTION = "SELECT_OPTION",
  SELECT_USERS = "SELECT_USERS",
  SELECT_CHANNELS = "SELECT_CHANNELS",
  INPUT = "INPUT",
  MULTI_INPUT = "MULTI_INPUT",
  SWITCH = "SWITCH",
  ICON_PICKER = "ICON_PICKER",
  URL = "URL",
  MULTI_URL = "MULTI_URL",
}

export type NookTemplate = {
  id: string;
  creatorFid: string;
  name: string;
  description?: string;
  imageUrl?: string;
  form: Form;
};

export type CreateNook<T = NookArgs> = {
  creatorFid: string;
  name: string;
  templateId?: string;
  description?: string;
  imageUrl?: string;
  visibility: "PUBLIC" | "PRIVATE" | "HIDDEN";
  data: T;
};

export type NookOnboardingArgs = {
  shelves: CreateShelfInstance[];
};

export type NookFarcasterChannelArgs = {
  channel: ChannelFilter;
};

export type NookTeamArgs = {
  users: UserFilter;
  channels: ChannelFilter;
};

export type NookRecreateOnboardingArgs = {
  channels: ChannelFilter;
};

export type NookArgs =
  | NookRecreateOnboardingArgs
  | NookFarcasterChannelArgs
  | NookTeamArgs
  | NookOnboardingArgs;
