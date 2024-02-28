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

export type FarcasterCastResponse = {
  hash: string;
  timestamp: number;
  entity: EntityResponse;
  text: string;
  mentions: {
    entity: EntityResponse;
    position: bigint;
  }[];
  castEmbeds: FarcasterCastResponse[];
  urlEmbeds: string[];
  parent?: FarcasterCastResponse;
  rootParent?: FarcasterCastResponse;
  channel?: Channel;
  engagement: FarcasterCastEngagement;
};
