import { UrlContentResponse } from "./content";
import {
  Channel,
  FarcasterCastContext,
  FarcasterCastEngagement,
  FarcasterUser,
} from "./farcaster";

export type FarcasterCastResponse = {
  hash: string;
  timestamp: number;
  user: FarcasterUser;
  text: string;
  mentions: {
    user: FarcasterUser;
    position: string;
  }[];
  embedCasts: FarcasterCastResponse[];
  embeds: UrlContentResponse[];
  parentHash?: string;
  parent?: FarcasterCastResponse;
  parentUrl?: string;
  channel?: Channel;
  engagement: FarcasterCastEngagement;
  context?: FarcasterCastContext;
};

export type GetFarcasterUserRequest = {
  fid: string;
};

export type GetFarcasterUsersRequest = {
  fids: string[];
};

export type GetFarcasterCastRequest = {
  hash: string;
};

export type GetFarcasterCastRepliesRequest = {
  hash: string;
};

export type GetFarcasterCastsRequest = {
  hashes: string[];
};

export type GetFarcasterCastsByChannelRequest = {
  id: string;
  limit?: number;
  minCursor?: number;
  maxCursor?: number;
  replies?: boolean;
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
  replies?: boolean;
};

export type GetFarcasterCastsResponse = {
  data: FarcasterCastResponse[];
  nextCursor?: string;
};

export type GetFarcasterUsersResponse = {
  data: FarcasterUser[];
  nextCursor?: string;
};

export type GetContentRequest = {
  uri: string;
};

export type GetContentsRequest = {
  uris: string[];
};

export type GetContentsResponse = {
  data: UrlContentResponse[];
};
