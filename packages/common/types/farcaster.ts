import { Channel } from "../prisma/nook";
import { UrlContentResponse } from "./content";

export type FidHash = {
  fid: bigint;
  hash: string;
};

export type FarcasterUserEngagement = {
  followers: number;
  following: number;
};

export type BaseFarcasterUser = {
  fid: string;
  username?: string;
  pfp?: string;
  displayName?: string;
  bio?: string;
  url?: string;
};

export type FarcasterUserWithContext = BaseFarcasterUser & {
  engagement: FarcasterUserEngagement;
  context?: {
    following: boolean;
  };
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
  parentHash?: string;
  rootParentHash?: string;
  parentUrl?: string;
};

export type BaseFarcasterCastWithContext = BaseFarcasterCast & {
  engagement: FarcasterCastEngagement;
  context?: FarcasterCastContext;
};

export type FarcasterCastResponse = {
  hash: string;
  timestamp: number;
  entity: GetEntityResponse;
  text: string;
  mentions: {
    entity: GetEntityResponse;
    position: string;
  }[];
  embedHashes: string[];
  embedCasts: FarcasterCastResponse[];
  embedUrls: string[];
  embeds: UrlContentResponse[];
  parentHash?: string;
  parent?: FarcasterCastResponse;
  rootParentHash?: string;
  rootParent?: FarcasterCastResponse;
  parentUrl?: string;
  engagement: FarcasterCastEngagement;
  context?: FarcasterCastContext;
  channel?: Channel;
};

export type FarcasterCastResponseWithContext = FarcasterCastResponse;

export type GetFarcasterCastRequest = {
  hash: string;
};

export type GetFarcasterCastRepliesRequest = GetFarcasterCastRequest;

export type GetFarcasterCastsRequest = {
  hashes: string[];
};

export type GetFarcasterCastsByParentUrlRequest = {
  parentUrl: string;
  limit?: number;
  minCursor?: number;
  maxCursor?: number;
};

export type GetFarcasterCastsByFidsRequest = {
  fids: string[];
  limit?: number;
  minCursor?: number;
  maxCursor?: number;
  replies?: boolean;
};

export type GetFarcasterCastsByFollowingRequest = {
  fid: string;
  limit?: number;
  minCursor?: number;
  maxCursor?: number;
};

export type GetFarcasterCastsResponse = {
  data: BaseFarcasterCastWithContext[];
};

export type GetFarcasterUserRequest = {
  fid: string;
};

export type GetFarcasterUsersRequest = {
  fids: string[];
};

export type GetFarcasterUsersResponse = {
  data: FarcasterUserWithContext[];
};

export type GetEntityResponse = {
  id: string;
  farcaster: FarcasterUserWithContext;
};
