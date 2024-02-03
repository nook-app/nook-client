import {
  Content,
  ContentData,
  Entity,
  EventActionData,
  EventActionType,
} from "@flink/common/types";

export type FeedItemEngagement = {
  likes: number;
  reposts: number;
  replies: number;
};

export type FeedItemContentWithEngagement = {
  content?: Content<ContentData>;
  engagement: FeedItemEngagement;
};

export type FeedItem<T = EventActionData> = {
  _id: string;
  type: EventActionType;
  timestamp: string;
  data: T;
  entity: Entity;
  entityMap: Record<string, Entity>;
  contentMap: Record<string, FeedItemContentWithEngagement>;
};

export type GetFeedRequest = {
  filter: object;
};

export type GetFeedResponse = {
  data: FeedItem[];
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
