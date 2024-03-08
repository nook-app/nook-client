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

export type GetFarcasterChannelRequest = {
  id: string;
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
  cursor?: string;
  replies?: boolean;
};

export type GetFarcasterCastsByFidsRequest = {
  fids: string[];
  cursor?: string;
  replies?: boolean;
  minTimestamp?: number;
  limit?: number;
};

export type GetFarcasterCastsByFollowingRequest = {
  fid: string;
  cursor?: string;
  replies?: boolean;
  minTimestamp?: number;
  limit?: number;
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

export type GetFarcasterUserFollowersRequest = {
  fid: string;
};

export type GetSignerResponse = {
  publicKey: string;
  token: string;
  deeplinkUrl: string;
  state: string;
};

export type ValidateSignerResponse = {
  state: string;
};

export type SubmitCastAddRequest = {
  text: string;
  parentUrl?: string;
  parentFid?: string;
  parentHash?: string;
};

export type SubmitCastRemoveRequest = {
  hash: string;
};

export type SubmitReactionAddRequest = {
  reactionType: number;
  targetFid: string;
  targetHash: string;
};

export type SubmitReactionRemoveRequest = {
  reactionType: number;
  targetFid: string;
  targetHash: string;
};

export type SubmitLinkAddRequest = {
  linkType: string;
  targetFid: string;
};

export type SubmitLinkRemoveRequest = {
  linkType: string;
  targetFid: string;
};

export type SubmitMessageResponse = {
  hash: string;
};

export type SubmitMessageError = {
  message: string;
};
