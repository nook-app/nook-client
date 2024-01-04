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
  /** ID of the content */
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

  /** ID of root post */
  rootParentId: string;

  /** ID of user who posted the root post */
  rootParentUserId: string;

  /** Root post - Optional because doesn't exist if this post is the root */
  rootParent?: FarcasterPostData;
};

export type FarcasterReplyData = FarcasterPostData & {
  /** ID of the parent content */
  parentId: string;

  /** ID of user who posted the parent content */
  parentUserId: string;

  /** Parent post - Optional because of Farcaster data retention */
  parent?: FarcasterPostData;
};
