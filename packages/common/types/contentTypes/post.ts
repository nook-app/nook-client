export type PostData = {
  /** ID of the post */
  contentId: string;

  /** Entity who posted */
  entityId: string;

  /** Timestamp for when the post was made */
  timestamp: Date;

  /* Text content of the post */
  text: string;

  /** ID and position of mentions */
  mentions: {
    entityId: string;
    position: number;
  }[];

  /** Embedded content */
  embeds: string[];

  /** Channel the post was made in */
  channelId?: string;

  /** ID of root post */
  rootParentId: string;

  /** ID of entity who posted the root post */
  rootParentEntityId: string;

  /** Root post - Optional because doesn't exist if this post is the root */
  rootParent?: PostData;

  /** ID of the parent content */
  parentId?: string;

  /** ID of entity who posted the parent content */
  parentEntityId?: string;

  /** Parent post - Optional because of Farcaster data retention */
  parent?: PostData;
};
