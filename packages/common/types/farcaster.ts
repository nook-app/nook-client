export type CastEngagementType = "likes" | "recasts" | "replies" | "quotes";
export type CastContextType = "likes" | "recasts";
export type UserEngagementType = "followers" | "following";
export type UserContextType = "following";

export type FarcasterUserBadges = {
  powerBadge: boolean;
};

export type FarcasterUserEngagement = {
  followers: number;
  following: number;
};

export type FarcasterUserContext = {
  following: boolean;
};

export type BaseFarcasterUser = {
  fid: string;
  username?: string;
  pfp?: string;
  displayName?: string;
  bio?: string;
  url?: string;
  verifiedAddresses?: { protocol: number; address: string }[];
};

export type FarcasterUser = BaseFarcasterUser & {
  engagement: FarcasterUserEngagement;
  context?: FarcasterUserContext;
  badges?: FarcasterUserBadges;
};

export type FarcasterCastEngagement = {
  likes: number;
  recasts: number;
  replies: number;
  quotes: number;
};

export type FarcasterCastContext = {
  liked: boolean;
  recasted: boolean;
};

export type BaseFarcasterCast = {
  hash: string;
  timestamp: number;
  fid: string;
  text: string;
  mentions: {
    fid: string;
    position: string;
  }[];
  embedHashes: string[];
  embedUrls: string[];
  parentFid?: string;
  parentHash?: string;
  rootParentFid?: string;
  rootParentHash?: string;
  parentUrl?: string;
  ancestors?: string[];
  thread?: string[];
  signer: string;
  appFid?: string;
};

export type FarcasterCast = BaseFarcasterCast & {
  engagement: FarcasterCastEngagement;
  context?: FarcasterCastContext;
};

export type Channel = {
  url: string;
  name: string;
  description: string;
  imageUrl: string;
  channelId: string;
  creatorId?: string;
  hostFids?: string[];
  followerCount?: number;
  createdAt: Date;
  updatedAt: Date;
};
