import { PostData } from "./contentTypes/post";

export type ContentData = PostData;

export enum ContentType {
  POST = "POST",
  REPLY = "REPLY",
  URL = "URL",
}

export enum ContentRelationType {
  PARENT = "PARENT",
  ROOT_PARENT = "ROOT_PARENT",
  EMBED = "EMBED",
  CHANNEL = "CHANNEL",
}

export type ContentRelation = {
  type: ContentRelationType;
  contentId: string;
};

export enum ContentEngagementType {
  POSTS = "posts",
  REPLIES = "replies",
  ROOT_REPLIES = "rootReplies",
  LIKES = "likes",
  REPOSTS = "reposts",
  EMBEDS = "embeds",
}

export type ContentEngagement = {
  [key in ContentEngagementType]?: number;
};

export type ContentRequest = {
  /** ID for the content in URI format */
  contentId: string;

  /** Identity of user who first submitted the content */
  submitterId: string;
};

export type ContentBase = {
  /** ID for the content in URI format */
  contentId: string;

  /** Identity of user who first submitted the content */
  submitterId: string;

  /** Identity of user who created the content */
  creatorId?: string;

  /** Timestamp content was created at */
  timestamp: Date;

  /** Related content */
  relations: ContentRelation[];

  /** Engagement metrics */
  engagement?: ContentEngagement;

  /** Set of userIds involved in this content */
  userIds: string[];

  /** Date record was created at */
  createdAt: Date;

  /** Date record was deleted at */
  deletedAt?: Date;
};

export type Content<T> = ContentBase & {
  type: ContentType;
  data: T;
};
