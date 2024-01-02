import { FarcasterCastData } from "./sources/farcaster";
import { ObjectId } from "mongodb";

export type RawEventData = FarcasterCastData;

/**
 * Supported event sources
 */
export enum EventSource {
  FARCASTER_CAST_ADD = "farcaster_cast_add",
}

/**
 * Raw event payload sent from any source service
 */
export type RawEvent = {
  /** ID for the event */
  eventId: string;

  /** Source for the event */
  source: EventSource;

  /** ID of the event in the source system */
  sourceEventId: string;

  /** Timestamp for when the event occurred */
  timestamp: number;

  /** Raw data sent from the source */
  data: RawEventData;
};

/**
 * Event object after being processed by the event service
 */
export type Event = RawEvent & {
  /** Identity of user who triggered the event */
  userId: string;

  /** Source identity of user who triggered the event */
  sourceUserId: string;

  /** List of references to event actions parsed from this event */
  actions: ObjectId[];

  /** Set of topics the actions for this event are relevant for */
  topics: string[];
};
