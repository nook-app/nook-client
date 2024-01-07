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

export type ContentRequest = {
  /** ID for the content in URI format */
  contentId: string;

  /** Identity of user who first submitted the content */
  submitterId: string;
};

export type ContentEngagement = {
  /** Number of likes for this content */
  likes?: {
    [key in EventService]?: number;
  };

  /** Number of reposts for this content */
  reposts?: {
    [key in EventService]?: number;
  };

  /** Number of replies for this content */
  replies?: {
    [key in EventService]?: number;
  };

  /** Number of root replies for this content */
  rootReplies?: {
    [key in EventService]?: number;
  };

  /** Numbe of embeds for this content */
  embeds?: {
    [key in EventService]?: number;
  };
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
