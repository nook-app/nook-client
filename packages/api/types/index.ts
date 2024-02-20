import { Content, ContentData, Entity, Nook } from "@nook/common/types";
import { User } from "@nook/common/prisma/nook";

export type ContentFeedItem<T = ContentData> = Content<T> & {
  _id: string;
  entities: Entity[];
  contents: Content<ContentData>[];
};

export type ContentFeed = {
  data: ContentFeedItem[];
  nextCursor?: string;
};

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

export type GetEntitiesRequest = {
  entityIds: string[];
};

export type GetEntitiesResponse = {
  data: Entity[];
};

export type GetNookRequest = {
  nookId: string;
};
