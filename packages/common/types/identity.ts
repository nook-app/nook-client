import { ObjectId } from "mongodb";

export type SocialAccountMetadata = {
  username?: string;
  pfp?: string;
  displayName?: string;
  bio?: string;
  url?: string;
};

export type SocialAccount = {
  id: string;
  metadata?: SocialAccountMetadata;
  following: number;
  followers: number;
};

export type Entity = {
  /** DB id */
  _id: ObjectId;

  /** Farcaster ids */
  farcasterAccounts: SocialAccount[];

  /** Date record was created */
  createdAt: Date;
};
