import { UrlContentResponse } from "./content";

export type CastEngagementType = "likes" | "recasts" | "replies" | "quotes";
export type CastContextType = "likes" | "recasts";
export type UserEngagementType = "followers" | "following";
export type UserContextType = "followers" | "following";

export type FarcasterUserBadges = {
  powerBadge: boolean;
};

export type FarcasterUserEngagement = {
  followers: number;
  following: number;
};

export type FarcasterUserMutualsPreview = {
  preview: BaseFarcasterUser[];
  total: number;
};

export type FarcasterUserContext = {
  following: boolean;
  followers: boolean;
  mutuals?: FarcasterUserMutualsPreview;
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
  rootParentUrl?: string;
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
  leadFid?: string;
  hostFids?: string[];
  followerCount?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type BaseFarcasterUserV1 = {
  fid: string;
  username?: string;
  pfp?: string;
  displayName?: string;
  bio?: string;
  url?: string;
  verifiedAddresses: { protocol: number; address: string }[];
  engagement: FarcasterUserEngagement;
  badges: FarcasterUserBadges;
};

export type FarcasterUserV1 = BaseFarcasterUserV1 & {
  context?: FarcasterUserContext;
};

export type BaseFarcasterCastV1 = {
  hash: string;
  timestamp: number;
  user: BaseFarcasterUserV1;
  text: string;
  mentions: {
    user: BaseFarcasterUserV1;
    position: string;
  }[];
  embedHashes: string[];
  embedUrls: string[];
  parent?: BaseFarcasterCastV1;
  parentFid?: string;
  parentHash?: string;
  parentUrl?: string;
  rootParent?: BaseFarcasterCastV1;
  rootParentFid?: string;
  rootParentHash?: string;
  rootParentUrl?: string;
  embeds: {
    urls: UrlContentResponse[];
    casts: BaseFarcasterCastV1[];
  };
  signer: string;
  appFid: string;
  engagement: FarcasterCastEngagement;
};

export type FarcasterCastV1 = {
  hash: string;
  timestamp: number;
  user: FarcasterUserV1;
  text: string;
  mentions: {
    user: FarcasterUserV1;
    position: string;
  }[];
  embedHashes: string[];
  embedUrls: string[];
  parent?: FarcasterCastV1;
  parentFid?: string;
  parentHash?: string;
  parentUrl?: string;
  rootParent?: FarcasterCastV1;
  rootParentFid?: string;
  rootParentHash?: string;
  rootParentUrl?: string;
  embeds: {
    urls: UrlContentResponse[];
    casts: FarcasterCastV1[];
  };
  signer: string;
  appFid: string;
  engagement: FarcasterCastEngagement;
  context?: FarcasterCastContext;
};
