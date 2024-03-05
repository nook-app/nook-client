import { User } from "@nook/common/prisma/nook";
import {
  FarcasterUserWithContext,
  FarcasterCastResponse,
  NookResponse,
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

export type GetUserResponse = User & {
  user: FarcasterUserWithContext;
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
