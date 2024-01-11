import { ObjectId } from "mongodb";

export type Identity = {
  /** DB id */
  _id: ObjectId;

  /** Farcaster ids */
  farcaster: string[];

  /** Date record was created */
  createdAt: Date;
};
