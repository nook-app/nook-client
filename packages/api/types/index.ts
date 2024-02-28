import { User, Channel } from "@nook/common/prisma/nook";
import { EntityWithRelations, NookResponse } from "@nook/common/types";

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
  user: User;
  entity: EntityWithRelations;
  nooks: NookResponse[];
};

export type FarcasterCastResponse = {
  hash: string;
  timestamp: number;
  entity: EntityWithRelations;
  text: string;
  mentions: {
    entity: EntityWithRelations;
    position: bigint;
  }[];
  castEmbeds: FarcasterCastResponse[];
  urlEmbeds: string[];
  parent?: FarcasterCastResponse;
  rootParent?: FarcasterCastResponse;
  channel?: Channel;
};

export type FarcasterFeedRequest = {
  feedId: string;
};

export type FarcasterFeedResponse = {
  data: FarcasterCastResponse[];
};
