import { ObjectId } from "mongodb";
import { PostData } from "../contentTypes";

export type ContentActionData = {
  /** Entity acting */
  entityId: ObjectId;

  /** Content being acted on */
  contentId: string;
};

export type EntityActionData = {
  /** Entity acting */
  entityId: ObjectId;

  /** Entity who was acted on */
  targetEntityId: ObjectId;

  /** Source entity acting */
  sourceEntityId: string;

  /** Source entity who was acted on */
  sourceTargetEntityId: string;
};

export type PostActionData = ContentActionData & {
  /** Post */
  content: PostData;
};

export enum Protocol {
  ETHEREUM = "ETHEREUM",
  SOLANA = "SOLANA",
}

export enum EntityInfoType {
  /** PFP - Profile Picture for the user */
  PFP = "PFP",
  /** DISPLAY - Display Name for the user */
  DISPLAY = "DISPLAY",
  /** BIO - Bio for the user */
  BIO = "BIO",
  /** URL - URL of the user */
  URL = "URL",
  /** USERNAME - Preferred Name for the user */
  USERNAME = "USERNAME",
}

export type UpdateEntityInfoActionData = {
  /** Identity of user acting */
  entityId: ObjectId;

  /** Source entity acting */
  sourceEntityId: string;

  /** The type of data added or updated by the user */
  entityDataType: EntityInfoType;

  /** User data */
  entityData: string;
};

export type LinkBlockchainAddressActionData = {
  /** Identity of user acting */
  entityId: ObjectId;

  /** Source entity acting */
  sourceEntityId: string;

  /** Address verified */
  address: string;

  /** If the address is a contract */
  isContract: boolean;

  /** The protocol being linked */
  protocol: Protocol;

  /** The chainId (if contract) */
  chainId: number;

  /** The chain being linked */
  claimSignature: string;

  /** Block hash of claimSignature */
  blockHash: string;
};
