import { Metadata } from "metascraper";
import { Frame } from "./frames";

export type UrlContentResponse = {
  uri: string;
  protocol?: string;
  host?: string;
  path?: string;
  query?: string;
  fragment?: string;
  contentType?: string;
  length?: number;
  metadata?: Metadata;
  frame?: Frame;
  hasFrame?: boolean;
};

export type FarcasterContentReference = {
  fid: string;
  hash: string;
  parentFid?: string;
  parentHash?: string;
  parentUrl?: string;
  timestamp: Date;
  text?: string;
  rootParentFid?: string;
  rootParentHash?: string;
  rootParentUrl?: string;
  uri: string;
};

export type FarcasterContentReferenceRequest = {
  references: FarcasterContentReference[];
  skipFetch?: boolean;
};
