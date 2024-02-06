import { Content, ContentData, Entity } from "@flink/common/types";

export type ContentFeedItem<T = ContentData> = Content<T> & {
  _id: string;
  entityMap: Record<string, Entity>;
  contentMap: Record<string, Content<ContentData>>;
};

export type GetContentFeedRequest = {
  filter: object;
  cursor?: string;
};

export type GetContentFeedResponse = {
  data: ContentFeedItem[];
};

export type AuthFarcasterRequest = {
  message: string;
  signature: `0x${string}`;
  nonce: string;
};

export type AuthResponse = {
  entity: Entity;
  token: string;
};

export type ErrorResponse = {
  status: number;
  message: string;
};
