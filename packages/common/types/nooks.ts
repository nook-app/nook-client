import { ObjectId } from "mongodb";
import { ContentType } from "./content";

export enum NookType {
  Default = "DEFAULT",
}

export type Nook = {
  _id: ObjectId | string;
  type: NookType;
  nookId: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  shelves: NookShelf[];
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NookShelf = {
  name: string;
  slug: string;
  description: string;
  panels: NookPanel[];
};

export type NookPanel = {
  name: string;
  slug: string;
  data: NookPanelData;
};

export type NookPanelData =
  | {
      type: NookPanelType.UserPosts;
      args: {
        userFilter: UserFilter;
        contentTypes: ContentType[];
        sort?: "new" | "top";
      };
      cursor?: string;
    }
  | {
      type: NookPanelType.ChannelPosts;
      args: {
        channelFilter: ChannelFilter;
        contentTypes: ContentType[];
        sort?: "new" | "top";
      };
      cursor?: string;
    }
  | {
      type: NookPanelType.UserFollowers;
      args: {
        userFilter: UserFilter;
      };
      cursor?: string;
    }
  | {
      type: NookPanelType.UserFollowing;
      args: {
        userFilter: UserFilter;
      };
      cursor?: string;
    }
  | {
      type: NookPanelType.PostReplies;
      args: {
        targetContentId: string;
        sort?: "new" | "top";
      };
      cursor?: string;
    }
  | {
      type: NookPanelType.PostLikes;
      args: {
        targetContentId: string;
      };
      cursor?: string;
    }
  | {
      type: NookPanelType.PostReposts;
      args: {
        targetContentId: string;
      };
      cursor?: string;
    }
  | {
      type: NookPanelType.PostQuotes;
      args: {
        targetContentId: string;
        sort?: "new" | "top";
      };
      cursor?: string;
    };

export enum NookPanelType {
  UserPosts = "USER_POSTS",
  ChannelPosts = "CHANNEL_POSTS",
  UserFollowers = "USER_FOLLOWERS",
  UserFollowing = "USER_FOLLOWING",
  PostReplies = "POST_REPLIES",
  PostLikes = "POST_LIKES",
  PostReposts = "POST_REPOSTS",
  PostQuotes = "POST_QUOTES",
}

export enum UserFilterType {
  Entities = "ENTITIES",
  Following = "FOLLOWING",
}

export type UserFilter =
  | {
      type: UserFilterType.Entities;
      args: {
        entityIds: string[];
      };
    }
  | {
      type: UserFilterType.Following;
      args: {
        entityId: string;
      };
    };

export enum ChannelFilterType {
  Channels = "CHANNELS",
}

export type ChannelFilter = {
  type: ChannelFilterType.Channels;
  args: {
    channelIds: string[];
  };
};
