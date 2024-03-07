import { FarcasterUser } from "./farcaster";

export type Nook = {
  id: string;
  creator: FarcasterUser;
  name: string;
  description: string;
  imageUrl: string;
  shelves: NookShelf[];
  createdAt: number;
  updatedAt: number;
};

export type NookShelf = {
  id: string;
  name: string;
  description: string;
  type: NookShelfType;
  args: NookShelfArgs[NookShelfType];
};

export enum NookShelfType {
  FarcasterFeed = "FarcasterFeed",
}

export type NookShelfArgs = {
  [NookShelfType.FarcasterFeed]: {
    lol: boolean;
  };
};
