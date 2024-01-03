export type FarcasterCastRawData = {
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

export type FarcasterPostData = {
  /** Content ID of the post */
  contentId: string;

  /** Fid of user who posted */
  fid: string;

  /** Hash of post */
  hash: string;

  /** Identity of user who posted */
  userId: string;

  mentions: {
    userId: string;
    position: number;
  }[];

  /** Embedded content */
  embeds: string[];

  /** Channel the post was made in */
  channel?: string;

  /** Root post */
  rootParent?: FarcasterPostData;
};

export type FarcasterReplyData = FarcasterPostData & {
  /** Parent post */
  parent: FarcasterPostData;
};
