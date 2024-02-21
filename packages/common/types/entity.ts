import { ObjectId } from "mongodb";
import { Protocol, UsernameType } from "./actionTypes";

export type FarcasterAccount = {
  fid: string;
  custodyAddress: string;
  username?: string;
  pfp?: string;
  displayName?: string;
  bio?: string;
  url?: string;
  followers?: number;
  following?: number;
};

export type BlockchainAccount = {
  protocol: Protocol;
  address: string;
  isContract: boolean;
};

export type Entity = {
  /** DB id */
  _id: ObjectId;

  /** Farcaster account */
  farcaster: FarcasterAccount;

  /** Blockchain accounts */
  blockchain: BlockchainAccount[];

  /** Usernames */
  usernames: {
    type: UsernameType;
    username: string;
  }[];

  /** Date record was created */
  createdAt: Date;

  /** Date record was updated at */
  updatedAt: Date;
};
