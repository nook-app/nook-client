import { FarcasterCastRawData } from "./sources/farcaster";
import { ObjectId } from "mongodb";

export type RawEventData = FarcasterCastRawData;

/**
 * Supported event sources
 */
export enum EventSourceService {
  FARCASTER_CAST_ADD = "FARCASTER_CAST_ADD",
}

export type EventSource = {
  /** Service the event was made on */
  service: EventSourceService;

  /** ID in the source system */
  id: string;

  /** User ID in the source system */
  userId: string;
};

/**
 * Raw event payload sent from any source service
 */
export type RawEvent = {
  /** ID for the event */
  eventId: string;

  /** Source data */
  source: EventSource;

  /** Timestamp for when the event occurred */
  timestamp: number;

  /** Raw data sent from the source */
  data: RawEventData;
};

/**
 * Event object after being processed by the event service
 */
export type UserEvent = RawEvent & {
  /** Identity of user who triggered the event */
  userId: string;

  /** Source identity of user who triggered the event */
  sourceUserId: string;

  /** List of references to event actions parsed from this event */
  actions: ObjectId[];

  /** Timestamp for when the event was created */
  createdAt: Date;
};
