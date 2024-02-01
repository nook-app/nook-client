import {
  Content,
  ContentData,
  Entity,
  EventActionData,
  EventActionType,
} from "@flink/common/types";

export interface FeedResponseItem {
  _id: string;
  type: EventActionType;
  timestamp: string;
  data: EventActionData;
  entity: Entity;
  entityMap: Record<string, Entity>;
  contentMap: Record<string, Content<ContentData>>;
}

export interface FeedResponse {
  data: FeedResponseItem[];
}
