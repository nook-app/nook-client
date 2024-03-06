import {
  FarcasterCastResponse,
  NookResponse,
  FarcasterUser,
} from "@nook/common/types";

export type SignInWithFarcasterRequest = {
  message: string;
  signature: `0x${string}`;
  nonce: string;
};

export type TokenResponse = {
  refreshToken: string;
  token: string;
  expiresAt: number;
};

export type SignerPublicData = {
  publicKey: string;
  token: string;
  deeplinkUrl: string;
  state: string;
};

export type GetUserResponse = {
  fid: string;
  signerEnabled: boolean;
  farcaster: FarcasterUser;
  nooks: NookResponse[];
};

export type FarcasterFeedRequest = {
  feedId: string;
  cursor?: number;
};

export type FarcasterFeedResponse = {
  data: FarcasterCastResponse[];
  nextCursor?: number;
};
