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

export enum Chain {
  BITCOIN = "bitcoin",
  ETHEREUM = "ethereum",
  SOLANA = "solana",
}

export enum EntityInfoType {
  /** PFP - Profile Picture for the user */
  PFP = "pfp",
  /** DISPLAY - Display Name for the user */
  DISPLAY = "display",
  /** BIO - Bio for the user */
  BIO = "bio",
  /** URL - URL of the user */
  URL = "url",
  /** USERNAME - Preferred Name for the user */
  USERNAME = "username",
}

export type UpdateEntityInfoActionData = {
  /** Identity of user acting */
  entityId: ObjectId;

  /** The type of data added or updated by the user */
  entityDataType: EntityInfoType;

  /** User data */
  entityData: string;
};

export type LinkBlockchainAddressActionData = {
  /** Identity of user acting */
  entityId: ObjectId;

  /** Address verified */
  address: string;

  /** The type of verification if an Add action */
  isContract: boolean;

  /** The chain being linked */
  chain: Chain;
};
