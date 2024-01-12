import { ObjectId } from "mongodb";
import { PostData } from "./contentTypes/post";

export type ContentData = PostData;

export enum ContentType {
  POST = "POST",
  REPLY = "REPLY",
  URL = "URL",
}

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
};

export type ContentBase = {
  /** ID for the content in URI format */
  contentId: string;

  /** Entity who first submitted the content */
  submitterId: ObjectId;

  /** Entity who created the content */
  creatorId?: ObjectId;

  /** Timestamp content was created at */
  timestamp: Date;

  /** Engagement metrics */
  engagement?: ContentEngagement;

  /** Set of entityIds involved in this content */
  entityIds: ObjectId[];

  /** Date record was created at */
  createdAt: Date;

  /** Date record was deleted at */
  deletedAt?: Date;
};

export type Content<T> = ContentBase & {
  type: ContentType;
  data: T;
};
