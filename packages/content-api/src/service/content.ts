import { ContentCacheClient } from "@nook/common/clients";
import { Metadata } from "metascraper";
import { Prisma, PrismaClient } from "@nook/common/prisma/content";
import {
  ContentReferenceResponse,
  ContentReferenceType,
  FarcasterCastResponse,
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
    const contents = await this.cache.getContents(uris);
    const contentMap = contents.reduce(
      (acc, content, index) => {
        if (!content) return acc;
        acc[uris[index]] = content;
        return acc;
      },
      {} as Record<string, UrlContentResponse>,
    );

    const missing = uris.filter((uri) => !contentMap[uri]);
    if (missing.length > 0) {
      const fetchedContent =
        await this.client.farcasterContentReference.findMany({
          where: {
            uri: {
              in: missing,
            },
          },
        });

      for (const content of fetchedContent) {
        contentMap[content.uri] = {
          ...content,
          metadata: content.metadata as Metadata,
          frame: content.frame as Frame,
        } as UrlContentResponse;
      }

      await this.cache.setContents(Object.values(contentMap));
    }

    const stillMissing = uris.filter((uri) => !contentMap[uri]?.contentType);
    if (stillMissing.length > 0) {
      const missingContent = await this.refreshContents(stillMissing);
      for (const content of missingContent) {
        contentMap[content.uri] = content;
      }
    }

    return uris
      .map((uri) => contentMap[uri])
      .filter(Boolean) as UrlContentResponse[];
  }

  async refreshContents(uris: string[]): Promise<UrlContentResponse[]> {
    const result = await Promise.all(uris.map((uri) => getUrlContent(uri)));
    const resultMap = result.reduce(
      (acc, content) => {
        if (!content) return acc;
        acc[content.uri] = {
          ...content,
          metadata: content?.metadata as Metadata,
          frame: content?.frame as Frame,
        } as UrlContentResponse;
        return acc;
      },
      {} as Record<string, UrlContentResponse>,
    );

    const toUpsert = Object.values(resultMap).filter(
      (content) => content.metadata,
    );

    for (const c of toUpsert) {
      await this.client.farcasterContentReference.updateMany({
        where: {
          uri: c.uri,
        },
        data: {
          ...c,
          metadata: (c.metadata || Prisma.DbNull) as Prisma.InputJsonValue,
          frame: (c.frame || Prisma.DbNull) as Prisma.InputJsonValue,
        },
      });
    }

    await this.cache.setContents(Object.values(resultMap));

    return uris
      .map((uri) => resultMap[uri])
      .filter(Boolean) as UrlContentResponse[];
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
          fid: BigInt(reference.fid),
          hash: reference.hash,
          type: reference.type,
          uri: reference.uri,
        })),
      },
    });
  }

  async upsertReferencedContent(reference: ContentReferenceResponse) {
    const referencedContent = (await this.getContents([reference.uri]))[0];
    await this.client.farcasterContentReference.upsert({
      where: {
        uri_fid_hash_type: {
          fid: BigInt(reference.fid),
          hash: reference.hash,
          type: reference.type,
          uri: reference.uri,
        },
      },
      create: {
        ...reference,
        fid: BigInt(reference.fid),
        parentFid: reference.parentFid
          ? BigInt(reference.parentFid)
          : undefined,
        rootParentFid: reference.rootParentFid
          ? BigInt(reference.rootParentFid)
          : undefined,
        protocol: referencedContent?.protocol,
        host: referencedContent?.host,
        path: referencedContent?.path,
        query: referencedContent?.query,
        fragment: referencedContent?.fragment,
        contentType: referencedContent?.contentType,
        length: referencedContent?.length,
        hasFrame: referencedContent?.hasFrame,
        metadata: (referencedContent?.metadata ||
          Prisma.DbNull) as Prisma.InputJsonValue,
        frame: (referencedContent?.frame ||
          Prisma.DbNull) as Prisma.InputJsonValue,
      },
      update: {
        ...reference,
        fid: BigInt(reference.fid),
        parentFid: reference.parentFid
          ? BigInt(reference.parentFid)
          : undefined,
        rootParentFid: reference.rootParentFid
          ? BigInt(reference.rootParentFid)
          : undefined,
        protocol: referencedContent?.protocol,
        host: referencedContent?.host,
        path: referencedContent?.path,
        query: referencedContent?.query,
        fragment: referencedContent?.fragment,
        contentType: referencedContent?.contentType,
        length: referencedContent?.length,
        hasFrame: referencedContent?.hasFrame,
        metadata: (referencedContent?.metadata ||
          Prisma.DbNull) as Prisma.InputJsonValue,
        frame: (referencedContent?.frame ||
          Prisma.DbNull) as Prisma.InputJsonValue,
      },
    });
  }

  parseReferencedContent(cast: FarcasterCastResponse) {
    const timestamp = new Date(cast.timestamp);
    const references: ContentReferenceResponse[] = [];
    for (const url of cast.embeds) {
      references.push({
        fid: cast.user.fid,
        hash: cast.hash,
        parentFid: cast.parent?.user.fid,
        parentHash: cast.parent?.hash,
        parentUrl: cast.parentUrl,
        uri: url.uri,
        type: ContentReferenceType.Embed,
        timestamp,
        text: cast.text,
        rootParentFid: cast.rootParentFid,
        rootParentHash: cast.rootParentHash,
        rootParentUrl: cast.rootParentUrl,
      });
    }

    return references;
  }
}
