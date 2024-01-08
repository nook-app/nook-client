import { ObjectId } from "mongodb";
import { EventSource } from "./events";
import { ReactionData, FollowData } from "./actionTypes";
import { PostData, ReplyData } from "./contentTypes";

export type EventActionData = PostData | ReplyData | ReactionData | FollowData;

/**
 * Supported actions for events
 */
export enum EventActionType {
  POST = "POST",
  REPLY = "REPLY",
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
export type EventActionBase = {
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
};

export type EventAction<T> = EventActionBase & {
  type: EventActionType;
  data: T;
};
