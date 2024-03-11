import { ContentCacheClient } from "@nook/common/clients";
import { Metadata } from "metascraper";
import { Prisma, PrismaClient } from "@nook/common/prisma/content";
import {
  ContentReference,
  ContentReferenceType,
  FarcasterCastResponse,
  GetContentReferencesRequest,
  GetContentReferencesResponse,
  UrlContentResponse,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { getUrlContent } from "../utils";
import { Frame } from "frames.js";

export const MAX_PAGE_SIZE = 25;

export class ContentService {
  private client: PrismaClient;
  private cache: ContentCacheClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.content.client;
    this.cache = new ContentCacheClient(fastify.redis.client);
  }

  async getContents(uris: string[]): Promise<UrlContentResponse[]> {
    const contents = await Promise.all(uris.map((uri) => this.getContent(uri)));
    return contents.filter(Boolean) as UrlContentResponse[];
  }

  async getContent(uri: string): Promise<UrlContentResponse | undefined> {
    if (uri.includes(" ")) return;

    const cached = await this.cache.getContent(uri);
    if (cached) return cached;

    const content = await this.client.urlContent.findUnique({
      where: {
        uri,
      },
    });
    if (content) {
      const response = {
        ...content,
        metadata: content.metadata as Metadata,
        frame: content.frame as Frame,
      } as UrlContentResponse;
      await this.cache.setContent(uri, response);
      return response;
    }

    return await this.refreshContent(uri);
  }

  async refreshContents(uris: string[]): Promise<UrlContentResponse[]> {
    return (
      await Promise.all(uris.map((uri) => this.refreshContent(uri)))
    ).filter(Boolean) as UrlContentResponse[];
  }

  async refreshContent(uri: string): Promise<UrlContentResponse | undefined> {
    const content = await getUrlContent(uri);
    if (!content) return;
    await this.client.urlContent.upsert({
      where: {
        uri,
      },
      create: {
        ...content,
        metadata: (content.metadata || Prisma.DbNull) as Prisma.InputJsonValue,
        frame: (content.frame || Prisma.DbNull) as Prisma.InputJsonValue,
      },
      update: {
        ...content,
        metadata: (content.metadata || Prisma.DbNull) as Prisma.InputJsonValue,
        frame: (content.frame || Prisma.DbNull) as Prisma.InputJsonValue,
      },
    });

    const response = {
      ...content,
      metadata: content.metadata as Metadata,
      frame: content.frame as Frame,
    } as UrlContentResponse;
    await this.cache.setContent(uri, response);
    return response;
  }

  async addReferencedContent(cast: FarcasterCastResponse) {
    const references = this.parseReferencedContent(cast);
    await Promise.all(
      references.map((reference) => this.upsertReferencedContent(reference)),
    );
  }

  async removeReferencedContent(cast: FarcasterCastResponse) {
    const references = this.parseReferencedContent(cast);
    await this.client.farcasterContentReference.deleteMany({
      where: {
        OR: references.map((reference) => ({
          fid: reference.fid,
          hash: reference.hash,
          type: reference.type,
          uri: reference.uri,
        })),
      },
    });
  }

  async upsertReferencedContent(reference: ContentReference) {
    await this.getContent(reference.uri);

    await this.client.farcasterContentReference.upsert({
      where: {
        uri_fid_hash_type: {
          fid: reference.fid,
          hash: reference.hash,
          type: reference.type,
          uri: reference.uri,
        },
      },
      create: reference,
      update: reference,
    });
  }

  parseReferencedContent(cast: FarcasterCastResponse) {
    const timestamp = new Date(cast.timestamp);
    const references: ContentReference[] = [];
    for (const url of cast.embeds) {
      references.push({
        fid: BigInt(cast.user.fid),
        hash: cast.hash,
        parentFid: cast.parent?.user.fid
          ? BigInt(cast.parent.user.fid)
          : undefined,
        parentHash: cast.parent?.hash,
        parentUrl: cast.parentUrl,
        uri: url.uri,
        type: ContentReferenceType.Embed,
        timestamp,
      });
    }

    for (const castEmbed of cast.embedCasts) {
      for (const url of castEmbed.embeds) {
        references.push({
          fid: BigInt(cast.user.fid),
          hash: cast.hash,
          parentFid: cast.parent?.user.fid
            ? BigInt(cast.parent.user.fid)
            : undefined,
          parentHash: cast.parent?.hash,
          parentUrl: cast.parentUrl,
          uri: url.uri,
          type: ContentReferenceType.Quote,
          timestamp,
        });
      }
    }

    if (cast.parent) {
      for (const url of cast.parent.embeds) {
        references.push({
          fid: BigInt(cast.user.fid),
          hash: cast.hash,
          parentFid: cast.parent?.user.fid
            ? BigInt(cast.parent.user.fid)
            : undefined,
          parentHash: cast.parent?.hash,
          parentUrl: cast.parentUrl,
          uri: url.uri,
          type: ContentReferenceType.Quote,
          timestamp,
        });
      }
    }

    return references;
  }

  async getContentReferences(
    req: GetContentReferencesRequest,
    cursor?: string,
  ): Promise<GetContentReferencesResponse> {
    const contentFilter = [];
    for (const type of req.types) {
      switch (type) {
        case "image":
          contentFilter.push({
            type: {
              startsWith: "image",
            },
          });
          break;
        case "video":
          contentFilter.push({
            type: {
              startsWith: "video",
            },
          });
          break;
        case "frame":
          contentFilter.push({
            frame: {
              not: Prisma.DbNull,
            },
          });
      }
    }

    const references = await this.client.farcasterContentReference.findMany({
      where: {
        timestamp: this.decodeCursor(cursor),
        fid: req.fids ? { in: req.fids.map((fid) => BigInt(fid)) } : undefined,
        content:
          contentFilter.length > 0
            ? {
                OR: contentFilter,
              }
            : undefined,
        type: "EMBED",
      },
      orderBy: {
        timestamp: "desc",
      },
      take: MAX_PAGE_SIZE,
    });

    return {
      data: references.map((reference) => ({
        ...reference,
        type: reference.type as ContentReferenceType,
      })),
      nextCursor:
        references.length === MAX_PAGE_SIZE
          ? this.encodeCursor({
              timestamp: references[references.length - 1]?.timestamp.getTime(),
            })
          : undefined,
    };
  }

  decodeCursor(cursor?: string): { lt: Date } | undefined {
    if (!cursor) return;
    try {
      const decodedString = Buffer.from(cursor, "base64").toString("ascii");
      const decodedCursor = JSON.parse(decodedString);
      if (typeof decodedCursor === "object" && "timestamp" in decodedCursor) {
        return { lt: new Date(decodedCursor.timestamp) };
      }
      console.error(
        "Decoded cursor does not match expected format:",
        decodedCursor,
      );
    } catch (error) {
      console.error("Error decoding cursor:", error);
    }
  }

  encodeCursor(cursor?: { timestamp: number }): string | undefined {
    if (!cursor) return;
    const encodedString = JSON.stringify(cursor);
    return Buffer.from(encodedString).toString("base64");
  }
}
