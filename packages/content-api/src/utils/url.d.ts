import { Metadata } from "metascraper";
import { FrameData } from "@nook/common/types";
import { UrlContent } from "@nook/common/prisma/content";
export type UrlMetadata = {
    metadata?: Metadata;
    frame?: FrameData;
    contentType?: string;
    contentLength?: number;
};
/**
 * Scrape metadata from a URL and insert it into the database
 * @param client
 * @param request
 * @returns
 */
export declare const getUrlContent: (uri: string) => Promise<UrlContent>;
export declare const fetchUrlMetadata: (url: string) => Promise<UrlMetadata>;
