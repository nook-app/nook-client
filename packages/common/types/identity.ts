import { ObjectId } from "mongodb";

export enum IdentitySocialPlatform {
  FARCASTER = "FARCASTER",
}

export type IdentitySocialAccount = {
  platform: IdentitySocialPlatform;
  id: string;
  following: number;
  followers: number;
};

export type Identity = {
  /** DB id */
  _id: ObjectId;

  /** Farcaster ids */
  socialAccounts: IdentitySocialAccount[];

  /** Date record was created */
  createdAt: Date;
};
