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

export type ContentReference = {
  fid: bigint;
  hash: string;
  uri: string;
  type: ContentReferenceType;
  timestamp: Date;
};
