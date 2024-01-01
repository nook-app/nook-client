import { RawFarcasterData } from "./sources/farcaster";

export type RawEventData = RawFarcasterData;
export type EventActionData = object;

/**
 * Supported event sources
 */
export enum EventSource {
  FARCASTER = "farcaster",
}

/**
 * Supported actions for events
 */
export enum EventActionType {
  CAST_ADD = "cast_add",
}

/**
 * Raw event payload sent from any source service
 */
export type RawEvent = {
  /** ID for the event in the form `${source}-${sourceId}` */
  id: string;

  /** Timestamp for when the event occurred */
  timestamp: number;

  /** Source for the event */
  source: EventSource;

  /** ID of the event in the source system */
  sourceId: string;

  /** Raw data sent from the source */
  data: RawEventData;
};

/**
 * Event object after being processed by the event service
 */
export type Event = RawEvent & {
  /** Identity of user who triggered the event */
  userId: string;

  /** List of topics this event is relevant for */
  topics: string[];

  /** List of event actions parsed from this event */
  actions: EventAction[];
};

/**
 * Event action parsed from the event data
 */
export type EventAction = {
  /** Type of event action */
  type: EventActionType;

  /** List of topics this event action is relevant for */
  topics: string[];

  /** Formatted data object for the action */
  data: EventActionData;
};
