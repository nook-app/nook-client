import { ObjectId } from "mongodb";
import { EventSource } from "./events";
import { PostData, ReplyData } from "./contentTypes/post";

/**
 * Supported actions for events
 */
export enum EventActionType {
  POST = "POST",
  REPLY = "REPLY",
}

/**
 * Event action parsed from the event data
 */
export type EventActionBase = {
  /** ID */
  _id: ObjectId;

  /** Event ID */
  eventId: ObjectId;

  /** Source data */
  source: EventSource;

  /** Timestamp for when the event occurred */
  timestamp: Date;

  /** Identity of user who triggered the event */
  userId: string;

  /** Set of contentIds involved in this action */
  contentIds: string[];

  /** Set of userIds involved in this action */
  userIds: string[];

  /** Optional parent of the action */
  parent?: ObjectId;

  /** Optional children of the action */
  children?: ObjectId[];

  /** Timestamp for when the event action was created */
  createdAt: Date;
};

export type EventAction = EventActionBase & {
  type: EventActionType;
  data: PostData | ReplyData;
};
