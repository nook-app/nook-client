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

export enum ContentReferenceType {
  Embed = "EMBED",
  Reply = "REPLY",
  Quote = "QUOTE",
}

export type ContentReferenceResponse = {
  fid: string;
  hash: string;
  parentFid?: string;
  parentHash?: string;
  parentUrl?: string;
  uri: string;
  type: ContentReferenceType;
  timestamp: Date;
  text?: string;
  rootParentFid?: string;
  rootParentHash?: string;
  rootParentUrl?: string;
};
