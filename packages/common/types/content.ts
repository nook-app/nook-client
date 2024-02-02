import { ObjectId } from "mongodb";
import { PostData } from "./contentTypes/post";
import { Metadata } from "metascraper";

export type ContentData = PostData | UrlMetadata;

export enum ContentType {
  POST = "POST",
  REPLY = "REPLY",
  URL = "URL",
}

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

export type UnstructuredFrameMetascraperButtonKeys = {
  frameButton1?: string;
  frameButton1Action?: string;
  frameButton2?: string;
  frameButton2Action?: string;
  frameButton3?: string;
  frameButton3Action?: string;
  frameButton4?: string;
  frameButton4Action?: string;
};

export type FrameMetascraperData = {
  frameVersion?: string;
  frameImage?: string;
  framePostUrl?: string;
  frameRefreshPeriod?: string;
  frameIdemKey?: string;
  frameTextInput?: string;
} & UnstructuredFrameMetascraperButtonKeys;

export type FrameButtonAction = "post" | "post_redirect";

export type FrameButton = {
  label: string;
  index: number;
  action?: FrameButtonAction;
};

export type FrameData = {
  version?: "vNext";
  image?: string;
  postUrl?: string;
  buttons?: FrameButton[];
  refreshPeriod?: number;
  idempotencyKey?: string;
  textInput?: string;
};

type FrameMetaKey = {
  frame?: FrameData;
};

export type UrlMetadata = {
  metadata?: Metadata & FrameMetaKey;
  contentType?: string;
  contentLength?: number;
};

export type Content<T> = ContentBase & {
  type: ContentType;
  data: T;
};
