import { FarcasterPostData, FarcasterReplyData } from "./sources/farcaster";

export enum ContentType {
  FARCASTER_POST = "FARCASTER_POST",
  FARCASTER_REPLY = "FARCASTER_REPLY",
  URL = "URL",
}

export type ContentBase = {
  /** ID for the content in URI format */
  contentId: string;

  /** Identity of user who first submitted the content */
  submitterId: string;

  /** Identity of user who created the content */
  creatorId?: string;

  /** Date content was created */
  createdAt: Date;
};

export type FarcasterPostContent = ContentBase & {
  type: ContentType.FARCASTER_POST;
  data: FarcasterPostData;
};

export type FarcasterReplyContent = ContentBase & {
  type: ContentType.FARCASTER_REPLY;
  data: FarcasterReplyData;
};

export type URLContent = ContentBase & {
  type: ContentType.URL;
  data: object;
};

export type Content = FarcasterPostContent | FarcasterReplyContent | URLContent;
