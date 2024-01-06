import { ObjectId } from "mongodb";
import { PostData, ReplyData } from "./contentTypes/post";

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

export type ContentBase = {
  /** ID */
  _id: ObjectId;

  /** ID for the content in URI format */
  contentId: string;

  /** Identity of user who first submitted the content */
  submitterId: string;

  /** Identity of user who created the content */
  creatorId?: string;

  /** Timestamp content was created at */
  timestamp: number;

  /** Related content */
  relations: {
    type: RelationType;
    contentId: string;
  }[];

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
