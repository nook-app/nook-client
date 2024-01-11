import { ObjectId } from "mongodb";

export type PostData = {
  /** Identity of user who posted */
  userId: ObjectId;

  /** Timestamp for when the post was made */
  timestamp: Date;

  /* Text content of the post */
  text: string;

  /** ID and position of mentions */
  mentions: {
    userId: ObjectId;
    position: number;
  }[];

  /** Embedded content */
  embeds: string[];

  /** Channel the post was made in */
  channelId?: string;

  /** ID of root post */
  rootParentId: string;

  /** ID of user who posted the root post */
  rootParentUserId: ObjectId;

  /** Root post - Optional because doesn't exist if this post is the root */
  rootParent?: PostData;

  /** ID of the parent content */
  parentId?: string;

  /** ID of user who posted the parent content */
  parentUserId?: ObjectId;

  /** Parent post - Optional because of Farcaster data retention */
  parent?: PostData;
};
