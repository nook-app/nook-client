export type FidHash = {
  fid: string;
  hash: string;
};

export type FarcasterUser = {
  fid: string;
  username?: string;
  pfp?: string;
  displayName?: string;
  bio?: string;
  url?: string;
};

export type Signature = {
  hash: string;
  hashScheme: number;
  signature: string;
  signatureScheme: number;
  signer: string;
};

export type FarcasterCastData = {
  timestamp: number;
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

export type FarcasterCastReactionData = {
  timestamp: number;
  fid: string;
  reactionType: number;
  targetFid: string;
  targetHash: string;
  signature: Signature;
};

export type FarcasterUrlReactionData = {
  timestamp: number;
  fid: string;
  reactionType: number;
  url: string;
  signature: Signature;
};

export type FarcasterLinkData = {
  timestamp: number;
  fid: string;
  linkType: string;
  targetFid: string;
  signature: Signature;
};

export type FarcasterUserDataAddData = {
  type: number;
  value: string;
  fid: string;
  signature: Signature;
};

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

export type FarcasterUsernameProofData = {
  fid: string;
  username: string;
  owner: string;
  claimSignature: string;
  type: number;
};
