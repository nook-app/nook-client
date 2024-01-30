import { ObjectId } from "mongodb";

export type FarcasterAccount = {
  fid: string;
  custodyAddress: string;
  username?: string;
  pfp?: string;
  displayName?: string;
  bio?: string;
  url?: string;
};

export type EthereumAccount = {
  address: string;
  isContract: boolean;
  ensName?: string;
};

export type Entity = {
  /** DB id */
  _id: ObjectId;

  /** Farcaster account */
  farcaster: FarcasterAccount;

  /** Ethereum accounts */
  ethereum: EthereumAccount[];

  /** Date record was created */
  createdAt: Date;
};
