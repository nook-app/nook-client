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

export type BaseFarcasterUserWithEngagement = BaseFarcasterUser & {
  engagement: FarcasterUserEngagement;
};

export type EntityResponse = {
  id: string;
  farcaster: BaseFarcasterUserWithEngagement;
};

export type FarcasterCastEngagement = {
  likes: number;
  recasts: number;
  replies: number;
  quotes: number;
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
};

export type FarcasterCastResponse = {
  hash: string;
  timestamp: number;
  entity: EntityResponse;
  text: string;
  mentions: {
    entity: EntityResponse;
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
  limit: number;
  cursor?: string;
};

export type GetFarcasterCastsByFidsRequest = {
  fids: string[];
  limit: number;
  cursor?: number;
  replies?: boolean;
};

export type GetFarcasterCastsByFollowingRequest = {
  fid: string;
  limit: number;
  cursor?: string;
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
  data: EntityResponse[];
};

export type GetFollowerFidsResponse = {
  data: string[];
};
