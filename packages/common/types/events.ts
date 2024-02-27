import {
  FarcasterCast,
  FarcasterCastReaction,
  FarcasterLink,
  FarcasterUrlReaction,
  FarcasterUserData,
  FarcasterUsernameProof,
  FarcasterVerification,
} from "../prisma/farcaster";

export type EntityEventData =
  | FarcasterCast
  | FarcasterCastReaction
  | FarcasterUrlReaction
  | FarcasterVerification
  | FarcasterUserData
  | FarcasterUsernameProof
  | FarcasterLink;

/**
 * Supported event services
 */
export enum EventService {
  FARCASTER = "FARCASTER",
}

export enum FarcasterEventType {
  CAST_ADD = "CAST_ADD",
  CAST_REMOVE = "CAST_REMOVE",
  CAST_REACTION_ADD = "CAST_REACTION_ADD",
  CAST_REACTION_REMOVE = "CAST_REACTION_REMOVE",
  URL_REACTION_ADD = "URL_REACTION_ADD",
  URL_REACTION_REMOVE = "URL_REACTION_REMOVE",
  LINK_ADD = "LINK_ADD",
  LINK_REMOVE = "LINK_REMOVE",
  VERIFICATION_ADD = "VERIFICATION_ADD",
  VERIFICATION_REMOVE = "VERIFICATION_REMOVE",
  USER_DATA_ADD = "USER_DATA_ADD",
  USERNAME_PROOF = "USERNAME_PROOF",
}

export type EventTypeMap = {
  [EventService.FARCASTER]: FarcasterEventType;
};

export type EventSource = {
  /** Service the event was made on */
  service: EventService;

  /** Type of event */
  type: EventTypeMap[EventService];

  /** ID in the source system */
  id: string;
};

/**
 * Event object after being processed by the event service
 */
export type EntityEvent<T = EntityEventData> = {
  /** Event ID */
  eventId: string;

  /** Source data */
  source: EventSource;

  /** Raw data sent from the source */
  data: T;
};
