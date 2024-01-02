import { EventSource } from "./events";

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
  /** ID for the event */
  eventId: string;

  /** Source for the event */
  source: EventSource;

  /** ID of the event in the source system */
  sourceEventId: string;

  /** Timestamp for when the event occurred */
  timestamp: number;

  /** Identity of user who triggered the event */
  userId: string;

  /** Source identity of user who triggered the event */
  sourceUserId: string;

  /** Set of topics this event action is relevant for */
  topics: string[];
};

/**
 * Action: Post (i.e. Farcaster cast)
 */
export type EventActionPostData = {
  /** Identity of user who posted */
  userId: string;

  /** Source identity of user who posted */
  sourceUserId: string;

  /** Content of the post */
  content: string;

  /** List of references to content embedded in the post */
  embeds: string[]; // this will need to be contentIds and references to think Content collection

  /** Thread this post is a part of, undefined if this post is the thread root */
  thread?: EventActionPostData;
};

/**
 * Action: Reply to a post (i.e. Farcaster cast reply)
 */
export type EventActionReplyData = EventActionPostData & {
  /** Parent post this is a reply to */
  parent: EventActionPostData; // this will need to be a reference to the think Content collection
};

export type EventActionPost = EventActionBase & {
  type: EventActionType.POST;
  data: EventActionPostData;
};

export type EventActionReply = EventActionBase & {
  type: EventActionType.REPLY;
  data: EventActionReplyData;
};

export type EventAction = EventActionPost | EventActionReply;
