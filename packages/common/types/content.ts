import { PostData } from "./contentTypes/post";
import { Metadata } from "metascraper";
import { Topic } from "./topics";
import { NFT } from "./providers/simplehash/nft";
import { NFTCollection } from "./providers/simplehash/contract";

export type ContentData = PostData | UrlMetadata | NFT | NFTCollection;

export enum ContentType {
  POST = "POST",
  REPLY = "REPLY",
  URL = "URL",
  NFT = "NFT",
  NFT_CONTRACT = "NFT_CONTRACT",
}

export type ContentBase = {
  /** ID for the content in URI format */
  contentId: string;

  /** Entity who created the content */
  creatorId?: string;

  /** Timestamp content was created at */
  timestamp: Date;

  /** Date record was created at */
  createdAt: Date;

  /** Date record was updated at */
  updatedAt: Date;

  /** Engagement for the content */
  engagement: {
    likes: number;
    reposts: number;
    replies: number;
    embeds: number;
  };

  /** Topics for the content */
  topics: Topic[];

  /** References content IDs */
  referencedContentIds: string[];

  /** References entity IDs */
  referencedEntityIds: string[];
};

export type UnstructuredFrameMetascraperButtonKeys = {
  frameButton1?: string;
  frameButton1Action?: string;
  frameButton1Target?: string;
  frameButton2?: string;
  frameButton2Action?: string;
  frameButton2Target?: string;
  frameButton3?: string;
  frameButton3Action?: string;
  frameButton3Target?: string;
  frameButton4?: string;
  frameButton4Action?: string;
  frameButton4Target?: string;
};

export type FrameMetascraperData = {
  frameVersion?: string;
  frameImage?: string;
  framePostUrl?: string;
  frameRefreshPeriod?: string;
  frameIdemKey?: string;
  frameTextInput?: string;
  frameImageAspectRatio?: string;
  frameState?: string;
} & UnstructuredFrameMetascraperButtonKeys;

export type FrameButtonAction = "post" | "post_redirect" | "mint" | "tx";

export type FrameButton = {
  label: string;
  index: number;
  action?: FrameButtonAction;
  target?: string;
};

export type FrameData = {
  version?: "vNext";
  image?: string;
  postUrl?: string;
  buttons?: FrameButton[];
  refreshPeriod?: number;
  idempotencyKey?: string;
  textInput?: string;
  aspectRatio: "1.91:1" | "1:1";
  state?: string;
};

type FrameMetaKey = {
  frame?: FrameData;
};

export type UrlMetadata = {
  metadata?: Metadata & FrameMetaKey;
  contentType?: string;
  contentLength?: number;
};

export type Content<T = ContentData> = ContentBase & {
  type: ContentType;
  data: T;
};
