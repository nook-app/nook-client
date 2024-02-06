import { ObjectId } from "mongodb";
import { EventSource } from "./events";
import {
  ContentActionData,
  PostActionData,
  EntityActionData,
  LinkBlockchainAddressActionData,
  UpdateEntityInfoActionData,
} from "./actionTypes";
import { Topic } from "./topics";

export type EventActionData =
  | PostActionData
  | ContentActionData
  | EntityActionData
  | UpdateEntityInfoActionData
  | LinkBlockchainAddressActionData;

/**
 * Supported actions for events
 */
export enum EventActionType {
  POST = "POST",
  UNPOST = "UNPOST",
  REPLY = "REPLY",
  UNREPLY = "UNREPLY",
  LIKE = "LIKE",
  REPOST = "REPOST",
  UNLIKE = "UNLIKE",
  UNREPOST = "UNREPOST",
  FOLLOW = "FOLLOW",
  UNFOLLOW = "UNFOLLOW",
  UPDATE_USER_INFO = "UPDATE_USER_INFO",
  LINK_BLOCKCHAIN_ADDRESS = "LINK_BLOCKCHAIN_ADDRESS",
  UNLINK_BLOCKCHAIN_ADDRESS = "UNLINK_BLOCKCHAIN_ADDRESS",
}

/**
 * Event action parsed from the event data
 */
export type EventAction<T> = {
  /** Event ID */
  eventId: string;

  /** Source data */
  source: EventSource;

  /** Timestamp for when the event occurred */
  timestamp: Date;

  /** Entity who triggered the event */
  entityId: ObjectId;

  /** Set of contentIds involved in this action */
  referencedContentIds: string[];

  /** Set of entityIds involved in this action */
  referencedEntityIds: ObjectId[];

  /** Optional parent of the action */
  parent?: ObjectId;

  /** Optional children of the action */
  children?: ObjectId[];

  /** Timestamp for when the event action was created */
  createdAt: Date;

  /** Timestamp for when the event action was deleted */
  deletedAt?: Date;

  /** Type of action */
  type: EventActionType;

  /** Data for the action */
  data: T;

  /** Topics for the action */
  topics: Topic[];
};
