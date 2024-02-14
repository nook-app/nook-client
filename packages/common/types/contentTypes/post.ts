import { ObjectId } from "mongodb";

export type TipData = {
  /** Identity of user tipping */
  entityId: ObjectId;

  /** Identity of user receiving the tip */
  targetEntityId: ObjectId;

  /** CAIP-19 identifier of the asset */
  assetId: string;

  /** Amount being tipped */
  amount: number;

  /** Content ID being tipped for */
  contentId: string;
};

export type PostData = {
  /** ID of the post */
  contentId: string;

  /** Entity who posted */
  entityId: ObjectId;

  /** Timestamp for when the post was made */
  timestamp: Date;

  /* Text content of the post */
  text: string;

  /** ID and position of mentions */
  mentions: {
    entityId: ObjectId;
    position: number;
  }[];

  /** Embedded content */
  embeds: string[];

  /** Channel the post was made in */
  channelId?: string;

  /** ID of root post */
  rootParentId: string;

  /** ID of entity who posted the root post */
  rootParentEntityId: ObjectId;

  /** Root post - Optional because doesn't exist if this post is the root */
  rootParent?: PostData;

  /** ID of the parent content */
  parentId?: string;

  /** ID of entity who posted the parent content */
  parentEntityId?: ObjectId;

  /** Parent post - Optional because of Farcaster data retention */
  parent?: PostData;

  /** Tips included in this post */
  tips?: TipData[];
};
