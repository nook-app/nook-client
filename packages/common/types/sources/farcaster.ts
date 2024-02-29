import { UrlContent } from "../../prisma/content";
import { Channel } from "../../prisma/nook";
import { EntityResponse } from "../entity";

export type FidHash = {
  fid: bigint;
  hash: string;
};

export type FarcasterUser = {
  fid: bigint;
  username?: string;
  pfp?: string;
  displayName?: string;
  bio?: string;
  url?: string;
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
  entity: EntityResponse;
  text: string;
  mentions: {
    entity: EntityResponse;
    position: bigint;
  }[];
  embedHashes: string[];
  embedUrls: string[];
  parentHash?: string;
  rootParentHash?: string;
  channel?: Channel;
};

export type FarcasterCastResponse = BaseFarcasterCast & {
  castEmbeds: FarcasterCastResponse[];
  parent?: FarcasterCastResponse;
  rootParent?: FarcasterCastResponse;
  urlEmbeds: UrlContent[];
};

export type FarcasterCastResponseWithContext = BaseFarcasterCast & {
  castEmbeds: FarcasterCastResponseWithContext[];
  parent?: FarcasterCastResponseWithContext;
  rootParent?: FarcasterCastResponseWithContext;
  engagement: FarcasterCastEngagement;
  urlEmbeds: UrlContent[];
};
