import { ObjectId } from "mongodb";
import { FarcasterCastAddData } from "./sources";

export type RawEventData = FarcasterCastAddData;

/**
 * Supported event services
 */
export enum EventService {
  FARCASTER = "farcaster",
}

export enum EventType {
  CAST_ADD = "cast_add",
}

export type EventSource = {
  /** Service the event was made on */
  service: EventService;

  /** Type of event */
  type: EventType;

  /** ID in the source system */
  id: string;

  /** User ID in the source system */
  userId: string;
};

/**
 * Raw event payload sent from any source service
 */
export type RawEvent = {
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
  /** ID */
  _id: ObjectId;

  /** Identity of user who triggered the event */
  userId: string;

  /** List of references to event actions parsed from this event */
  actions: ObjectId[];

  /** Timestamp for when the event was created */
  createdAt: Date;
};
