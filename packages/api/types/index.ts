import { Channel, Content, ContentData, Nook } from "@nook/common/types";
import { User } from "@nook/common/prisma/nook";
import { Entity } from "@nook/common/prisma/entity";

export type EntityWithContext = {
  entity: Entity;
};

export type ContentWithContext<T = ContentData> = {
  content: Content<T>;
};

export type BaseResponse = {
  referencedEntities: EntityWithContext[];
  referencedContents: ContentWithContext[];
  referencedChannels: Channel[];
};

export type GetContentFeedResponse = BaseResponse & {
  data: Content[];
  nextCursor?: string;
};

export type GetContentResponse = BaseResponse & {
  data: Content;
};

export type GetEntityFeedResponse = BaseResponse & {
  data: EntityWithContext[];
  nextCursor?: string;
};

export type GetEntityResponse = BaseResponse & {
  data: EntityWithContext;
};

export type SearchChannelsResponse = {
  data: Channel[];
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
