import { UserDataType as FarcasterUserDataType } from "@farcaster/hub-nodejs";

export type FidHash = {
  fid: string;
  hash: string;
};

export type Signature = {
  hash: string;
  hashScheme: number;
  signature: string;
  signatureScheme: number;
  signer: string;
};

export type FarcasterCastData = {
  timestamp: Date;
  fid: string;
  hash: string;
  text: string;
  parentFid?: string;
  parentHash?: string;
  parentUrl?: string;
  rootParentFid: string;
  rootParentHash: string;
  rootParentUrl?: string;
  mentions: {
    mention: string;
    mentionPosition: string;
  }[];
  embeds: string[];
  signature: Signature;
};

export enum FarcasterReactionType {
  NONE = "none",
  LIKE = "like",
  RECAST = "recast",
}

export type FarcasterCastReactionData = {
  timestamp: Date;
  fid: string;
  reactionType: FarcasterReactionType;
  targetFid: string;
  targetHash: string;
  signature: Signature;
};

export type FarcasterUrlReactionData = {
  timestamp: Date;
  fid: string;
  reactionType: FarcasterReactionType;
  url: string;
  signature: Signature;
};

export type FarcasterLinkData = {
  timestamp: Date;
  fid: string;
  linkType: string;
  targetFid: string;
  signature: Signature;
};

/** Type of UserData */
export enum UserDataType {
  NONE = "none",
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

const UserDataTypeValues = Object.values(UserDataType);

export function toUserDataType(
  farcasterUserDataType: FarcasterUserDataType,
): UserDataType {
  // todo: warn/error on invalid value
  return UserDataTypeValues[farcasterUserDataType.valueOf()];
}

export type FarcasterUserDataAddData = {
  type: FarcasterUserDataType;
  value: string;
  fid: string;
  signature: Signature;
};

export enum FarcasterVerificationType {
  EOA = "eoa",
  CONTRACT = "contract",
}

const FarcasterVerificationTypeValues = Object.values(
  FarcasterVerificationType,
);

export function toFarcasterVerificationType(
  farcasterVerificationType: number,
): FarcasterVerificationType {
  return FarcasterVerificationTypeValues[farcasterVerificationType];
}

export type FarcasterVerificationData = {
  fid: string;
  address: string;
  claimSignature: string;
  blockHash: string;
  verificationType: number;
  chainId: number;
  protocol: number;
  signature: Signature;
};
