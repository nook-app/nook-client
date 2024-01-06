export enum Protocol {
  FARCASTER = "FARCASTER",
}

export enum Application {
  TBD = "TBD",
}

export type PostData = {
  /** ID of the content */
  contentId: string;

  /** Protocol event was a part of */
  protocol: Protocol;

  /** Application event was for */
  application: Application;

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
  rootParent?: PostData;
};

export type ReplyData = PostData & {
  /** ID of the parent content */
  parentId: string;

  /** ID of user who posted the parent content */
  parentUserId: string;

  /** Parent post - Optional because of Farcaster data retention */
  parent?: PostData;
};
