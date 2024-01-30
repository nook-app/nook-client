import { ObjectId } from "mongodb";
import { PostData } from "./contentTypes/post";

export type ContentData = PostData | undefined;

export enum ContentType {
  POST = "POST",
  REPLY = "REPLY",
  URL = "URL",
}

export type ContentRequest = {
  /** ID for the content in URI format */
  contentId: string;

  /** Entity who first submitted the content */
  submitterId: string;

  /** Timestamp content was created at */
  timestamp: string;
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
