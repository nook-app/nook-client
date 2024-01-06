export type FidHash = {
  fid: string;
  hash: string;
};

export type FarcasterCastAddData = {
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
  urls: { url: string }[];
  casts: {
    fid: string;
    hash: string;
  }[];
};
