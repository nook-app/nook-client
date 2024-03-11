export type Nook = {
  id: string;
  type: string;
  creatorFid: string;
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
  FeedFarcasterFollowing = "FeedFarcasterFollowing",
  FarcasterProfile = "FarcasterProfile",
  FeedFarcasterContent = "FeedFarcasterContent",
}

export type NookShelfArgs = {
  [NookShelfType.FeedFarcasterFollowing]: FeedFarcasterFollowingArgs;
  [NookShelfType.FarcasterProfile]: FarcasterProfileArgs;
  [NookShelfType.FeedFarcasterContent]: FeedFarcasterContentArgs;
};

export type FeedFarcasterFollowingArgs = {
  fid: string;
};

export type FarcasterProfileArgs = {
  fid: string;
};

export type FeedFarcasterContentArgs = {
  types: string[];
  followerFid?: string;
  fid?: string;
};
