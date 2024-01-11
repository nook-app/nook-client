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
