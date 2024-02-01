import {
  Content,
  ContentData,
  Entity,
  EventAction,
  EventActionData,
  EventActionType,
} from "@flink/common/types";

export type GetFeedRequest = {
  filter: object;
};

export type GetFeedResponseItem<T = EventActionData> = {
  _id: string;
  type: EventActionType;
  timestamp: string;
  data: T;
  entity: Entity;
  entityMap: Record<string, Entity>;
  contentMap: Record<string, Content<ContentData>>;
};

export type GetFeedResponse = {
  data: GetFeedResponseItem[];
};
