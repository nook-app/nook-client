import { EventSource } from "./events";
import { FarcasterPostData, FarcasterReplyData } from "./sources/farcaster";

/**
 * Supported actions for events
 */
export enum EventActionType {
  FARCASTER_POST = "FARCASTER_POST",
  FARCASTER_REPLY = "FARCASTER_REPLY",
}

/**
 * Supported post types
 */
export enum PostType {
  FARCASTER = "FARCASTER",
}

/**
 * Event action parsed from the event data
 */
export type EventActionBase = {
  /** ID for the event */
  eventId: string;

  /** Source data */
  source: EventSource;

  /** Timestamp for when the event occurred */
  timestamp: number;

  /** Identity of user who triggered the event */
  userId: string;

  /** Set of topics this event action is relevant for */
  topics: string[];

  /** Set of contentIds involved in this action */
  contentIds: string[];

  /** Set of userIds involved in this action */
  userIds: string[];

  /** Timestamp for when the event action was created */
  createdAt: Date;

  /** Type of action */
  type: EventActionType;

  /** Data for the action */
  data: FarcasterPostData | FarcasterReplyData;
};

export type EventActionPost = EventActionBase & {
  type: EventActionType.FARCASTER_POST;
  data: FarcasterPostData;
};

export type EventActionReply = EventActionBase & {
  type: EventActionType.FARCASTER_REPLY;
  data: FarcasterReplyData;
};

export type EventAction = EventActionPost | EventActionReply;
