import { User, Nook } from "@nook/common/prisma/nook";
import { Entity } from "@nook/common/prisma/entity";

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
  entity: Entity;
  nooks: Nook[];
};

export type FarcasterCastResponse = {
  hash: string;
  timestamp: number;
  entity: Entity;
  text: string;
  mentions: {
    entity: Entity;
    position: bigint;
  }[];
  castEmbeds: FarcasterCastResponse[];
  urlEmbeds: string[];
  parent?: FarcasterCastResponse;
  rootParent?: FarcasterCastResponse;
};

export type FarcasterFeedRequest = {
  feedId: string;
};
