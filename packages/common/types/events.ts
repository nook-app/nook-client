import {
  FarcasterCastData,
  FarcasterCastReactionData,
  FarcasterLinkData,
  FarcasterUrlReactionData,
  FarcasterUserDataAddData,
  FarcasterUsernameProofData,
  FarcasterVerificationData,
} from "./sources/farcaster";

export type EntityEventData =
  | FarcasterCastData
  | FarcasterCastReactionData
  | FarcasterLinkData
  | FarcasterUrlReactionData
  | FarcasterUserDataAddData
  | FarcasterVerificationData
  | FarcasterUsernameProofData;

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
export type EntityEvent<T> = {
  /** Event ID */
  eventId: string;

  /** ID of user triggering event in the source system */
  userId: string;

  /** Source data */
  source: EventSource;

  /** Timestamp for when the event occurred */
  timestamp: number;

  /** Raw data sent from the source */
  data: T;
};
