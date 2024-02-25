import {
  Channel,
  Content,
  ContentData,
  Entity,
  EventAction,
  Nook,
} from "@nook/common/types";
import { User } from "@nook/common/prisma/nook";
import { EntityActionType } from "../src/utils/action";

export type EntityWithContext = {
  entity: Entity;
  context: Record<EntityActionType, boolean>;
};

export type ContentWithContext<T = ContentData> = {
  content: Content<T>;
  context: {
    reposted: boolean;
    liked: boolean;
  };
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

export type GetActionFeedResponse = BaseResponse & {
  data: EventAction[];
  nextCursor?: string;
};

export type GetActionResponse = BaseResponse & {
  data: EventAction;
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
