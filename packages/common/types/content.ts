import { ObjectId } from "mongodb";
import { PostData, ReplyData } from "./contentTypes/post";
import { EventService } from "./events";

export enum RelationType {
  PARENT = "PARENT",
  ROOT_PARENT = "ROOT_PARENT",
  EMBED = "EMBED",
}

export enum ContentType {
  POST = "POST",
  REPLY = "REPLY",
  URL = "URL",
}

export enum ContentEngagementType {
  LIKES = "likes",
  REPOSTS = "reposts",
  REPLIES = "replies",
  ROOT_REPLIES = "rootReplies",
  EMBEDS = "embeds",
}

export type ContentEngagement = {
  [key in ContentEngagementType]?: {
    [key in EventService]?: number;
  };
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
  relations: {
    type: RelationType;
    contentId: string;
  }[];

  /** Engagement metrics */
  engagement?: ContentEngagement;

  /** Set of userIds involved in this content */
  userIds: string[];

  /** Date record was created at */
  createdAt: Date;
};

export type ContentData = {
  type: ContentType;
  data: PostData | ReplyData | object;
};

export type PostContent = ContentBase & {
  type: ContentType.POST;
  data: PostData;
};

export type ReplyContent = ContentBase & {
  type: ContentType.REPLY;
  data: ReplyData;
};

export type UrlContent = ContentBase & {
  type: ContentType.URL;
  data: object;
};

export type Content = PostContent | ReplyContent | UrlContent;
