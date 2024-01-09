import { ObjectId } from "mongodb";
import { EventSource } from "./events";
import { PostData } from "./contentTypes";
import { ContentActionData, UserActionData } from "./actionTypes";

export type EventActionData = PostData | ContentActionData | UserActionData;

/**
 * Supported actions for events
 */
export enum EventActionType {
  POST = "POST",
  UNPOST = "UNPOST",
  REPLY = "REPLY",
  UNREPLY = "UNREPLY",
  LIKE = "LIKE",
  REPOST = "REPOST",
  UNLIKE = "UNLIKE",
  UNREPOST = "UNREPOST",
  FOLLOW = "FOLLOW",
  UNFOLLOW = "UNFOLLOW",
}

/**
 * Event action parsed from the event data
 */
export type EventAction<T> = {
  /** ID */
  _id: ObjectId;

  /** Event ID */
  eventId: string;

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

  /** Timestamp for when the event action was deleted */
  deletedAt?: Date;

  /** Type of action */
  type: EventActionType;

  /** Data for the action */
  data: T;
};
