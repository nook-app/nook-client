import { Frame } from "frames.js";
import { ContentReferenceResponse, UrlContentResponse } from "./content";
import {
  Channel,
  FarcasterCastContext,
  FarcasterCastEngagement,
  FarcasterUser,
} from "./farcaster";
import { RawNotificationResponse } from "./notifications";
import { TransactionDto } from "../onceupon";
import { Nook } from "./nook";

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
  channelMentions: {
    channel: Channel;
    position: string;
  }[];
  engagement: FarcasterCastEngagement;
  context?: FarcasterCastContext;
  ancestors?: FarcasterCastResponse[];
  // Temporarily used to identify the primary reference for content requests
  reference?: string;
  appFid?: string;
};

export type GetFarcasterChannelRequest = {
  id: string;
};

export type GetFarcasterChannelsRequest = {
  channelIds?: string[];
  parentUrls?: string[];
};

export type GetFarcasterChannelResponse = {
  data: Channel[];
  nextCursor?: string;
};

export type GetFarcasterUserRequest = {
  fid: string;
};

export type GetFarcasterUsersRequest = {
  fids?: string[];
  addresses?: string[];
};

export type GetFarcasterCastRequest = {
  hash: string;
};

export type GetFarcasterCastRepliesRequest = {
  hash: string;
};

export type GetFarcasterCastClientRequest = {
  hash: string;
};

export type GetFarcasterCastsRequest = {
  hashes: string[];
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
  castEmbedFid?: string;
  castEmbedHash?: string;
  embeds?: string[];
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
  trustedBytes?: string;
};

export type SubmitMessageError = {
  message: string;
};

export type SubmitFrameActionRequest = {
  castFid: string;
  castHash: string;
  postUrl: string;
  action?: string;
  inputText?: string;
  buttonIndex: number;
  state?: string;
};

export type FramePayload = {
  untrustedData: {
    fid: number;
    url: string;
    messageHash: string;
    timestamp: number;
    network: number;
    buttonIndex: number;
    inputText?: string;
    state?: string;
    castId: {
      fid: number;
      hash: string;
    };
  };
  trustedData: {
    messageBytes: string;
  };
};

export type SubmitFrameActionResponse = {
  location?: string;
  frame?: Frame;
};

export type GetNotificationsRequest = {
  fid: string;
  types?: string[];
};

export type GetNotificationsResponse = {
  data: RawNotificationResponse[];
  nextCursor?: string;
};

export type GetTransactionsResponse = {
  data: TransactionDto[];
  nextCursor?: string;
};

export type GetNooksResponse = {
  data: Nook[];
  nextCursor?: string;
};
