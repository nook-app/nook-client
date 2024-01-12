import { ObjectId } from "mongodb";
import {
  FarcasterCastData,
  FarcasterCastReactionData,
  FarcasterLinkData,
  FarcasterUrlReactionData,
} from "./sources/farcaster";

export type EntityEventData =
  | FarcasterCastData
  | FarcasterCastReactionData
  | FarcasterLinkData
  | FarcasterUrlReactionData;

/**
 * Supported event services
 */
export enum EventService {
  FARCASTER = "farcaster",
}

export enum EventType {
  CAST_ADD = "castAdd",
  CAST_REMOVE = "castRemove",
  CAST_REACTION_ADD = "castReactionAdd",
  CAST_REACTION_REMOVE = "castReactionRemove",
  URL_REACTION_ADD = "urlReactionAdd",
  URL_REACTION_REMOVE = "urlReactionRemove",
  LINK_ADD = "linkAdd",
  LINK_REMOVE = "linkRemove",
}

export type EventSource = {
  /** Service the event was made on */
  service: EventService;

  /** Type of event */
  type: EventType;

  /** ID in the source system */
  id: string;

  /** ID of entity in the source system */
  entityId: string;
};

/**
 * Raw event payload sent from any source service
 */
export type RawEvent<T> = {
  /** Event ID */
  eventId: string;

  /** Source data */
  source: EventSource;

  /** Timestamp for when the event occurred */
  timestamp: Date;

  /** Raw data sent from the source */
  data: T;
};

/**
 * Event object after being processed by the event service
 */
export type EntityEvent<T> = RawEvent<T> & {
  /** Entity who triggered the event */
  entityId: ObjectId;

  /** List of references to event actions parsed from this event */
  actions: ObjectId[];

  /** Timestamp for when the event was created */
  createdAt: Date;
};
