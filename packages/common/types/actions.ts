import { EventSource } from "./events";
import { FarcasterPostData, FarcasterReplyData } from "./sources/farcaster";

export enum TopicType {
  CONTENT = "content",
  USER = "user",
  CHANNEL = "channel",
  EMBED = "embed",
  PARENT = "parent",
  PARENT_USER = "parent_user",
  ROOT_PARENT = "root_parent",
  ROOT_PARENT_USER = "root_parent_user",
  MENTION = "mention",
}

export type Topic = {
  type: TopicType;
  id: string;
};

/**
 * Supported actions for events
 */
export enum EventActionType {
  POST = "POST",
  REPLY = "REPLY",
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
  topics: Topic[];

  /** Set of contentIds involved in this action */
  contentIds: string[];

  /** Set of userIds involved in this action */
  userIds: string[];

  /** Timestamp for when the event action was created */
  createdAt: Date;
};

export type EventActionPost = EventActionBase & {
  type: EventActionType.POST;
  data: FarcasterPostData;
};

export type EventActionReply = EventActionBase & {
  type: EventActionType.REPLY;
  data: FarcasterReplyData;
};

export type EventAction = EventActionPost | EventActionReply;
