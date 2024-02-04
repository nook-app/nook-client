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
  FARCASTER = "FARCASTER",
}

export enum EventType {
  CAST_ADD = "CAST_ADD",
  CAST_REMOVE = "CAST_REMOVE",
  CAST_REACTION_ADD = "CAST_REACTION_ADD",
  CAST_REACTION_REMOVE = "CAST_REACTION_REMOVE",
  URL_REACTION_ADD = "URL_REACTION_ADD",
  URL_REACTION_REMOVE = "URL_REACTION_REMOVE",
  LINK_ADD = "LINK_ADD",
  LINK_REMOVE = "LINK_REMOVE",
  VERIFICATION_ADD_ETH_ADDRESS = "VERIFICATION_ADD_ETH_ADDRESS",
  VERIFICATION_REMOVE = "VERIFICATION_REMOVE",
  USER_DATA_ADD = "USER_DATA_ADD",
  USERNAME_PROOF = "USERNAME_PROOF",
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
  timestamp: string;

  /** Raw data sent from the source */
  data: T;
};

/**
 * Event object after being processed by the event service
 */
export type EntityEvent<T> = {
  /** Event ID */
  eventId: string;

  /** Source data */
  source: EventSource;

  /** Timestamp for when the event occurred */
  timestamp: Date;

  /** Raw data sent from the source */
  data: T;

  /** Entity who triggered the event */
  entityId: ObjectId;

  /** Timestamp for when the event was created */
  createdAt: Date;
};
