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
  /** ID of the post */
  contentId: string;

  /** Identity of user who posted */
  userId: string;

  /* Text content of the post */
  text: string;

  /** ID and position of mentions */
  mentions: {
    userId: string;
    position: number;
  }[];

  /** Embedded content */
  embeds: string[];

  /** Channel the post was made in */
  channelId?: string;

  /** Root post */
  rootParent?: FarcasterPostData;
};

export type FarcasterReplyData = FarcasterPostData & {
  /** Parent post */
  parent: FarcasterPostData;
};
