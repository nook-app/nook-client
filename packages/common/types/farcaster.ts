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
  engagement: FarcasterUserEngagement;
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
  engagement: FarcasterCastEngagement;
};

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
  data: BaseFarcasterCast[];
};

export type GetFarcasterUserRequest = {
  fid: string;
};

export type GetFarcasterUsersRequest = {
  fids: string[];
};

export type GetFarcasterUsersResponse = {
  data: BaseFarcasterUser[];
};

export type GetFollowerFidsResponse = {
  data: string[];
};
