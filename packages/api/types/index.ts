import { Content, ContentData, Entity } from "@flink/common/types";
import { User } from "@flink/common/prisma/nook";
import { Nook } from "../data";

export type ContentFeedItem<T = ContentData> = Content<T> & {
  _id: string;
  entityMap: Record<string, Entity>;
  contentMap: Record<string, Content<ContentData>>;
};

export type ContentFeed = {
  data: ContentFeedItem[];
  nextCursor?: string;
};

export type GetPanelParams = {
  nookId: string;
  shelfId: string;
  panelId: string;
};

export type GetPanelQuery = {
  cursor?: string;
};

export type GetPanelResponse = {
  type: string;
  data: ContentFeed;
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

export type AuthResponse = TokenResponse & {
  user: User;
  entity: Entity;
};

export type GetContentRepliesBody = {
  contentId: string;
  cursor?: string;
};

export type GetContentRepliesResponse = {
  data: ContentFeedItem[];
  nextCursor?: string;
};

export type SignerPublicData = {
  publicKey: string;
  token: string;
  deeplinkUrl: string;
  state: string;
};

export type GetUserResponse = {
  user: User;
  nooks: Nook[];
};
