import { Frame } from "frames.js";
import { Metadata } from "metascraper";

export type UrlContentResponse = {
  uri: string;
  protocol?: string;
  host?: string;
  path?: string;
  query?: string;
  fragment?: string;
  type?: string;
  length?: number;
  metadata?: Metadata;
  frame?: Frame;
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
};
