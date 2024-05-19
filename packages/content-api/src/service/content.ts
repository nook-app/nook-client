import { ContentCacheClient } from "@nook/common/clients";
import { Metadata } from "metascraper";
import { Prisma, PrismaClient } from "@nook/common/prisma/content";
import {
  FarcasterContentReference,
  UrlContentResponse,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { getUrlContent } from "../utils";
import { Frame } from "frames.js";
import { publishContent } from "@nook/common/queues";

export const MAX_PAGE_SIZE = 25;

export class ContentService {
  private client: PrismaClient;
  private cache: ContentCacheClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.content.client;
    this.cache = new ContentCacheClient(fastify.redis.client);
  }

  async getContents(uris: string[]): Promise<UrlContentResponse[]> {
    const contentMap = await this.getOrFetchContent(uris);

    return uris
      .map((uri) => contentMap[uri])
      .filter(Boolean) as UrlContentResponse[];
  }

  async getReferences(
    references: FarcasterContentReference[],
    skipFetch?: boolean,
  ) {
    const cachedReferences = await this.cache.getReferences(references);
    const cacheMap = cachedReferences.reduce(
      (acc, content, index) => {
        if (!content) return acc;
        const reference = references[index];
        acc[`${reference.hash}:${reference.uri}`] = content;
        return acc;
      },
      {} as Record<string, UrlContentResponse>,
    );

    const missing = references.filter(
      (reference) =>
        !cacheMap[`${reference.hash}:${reference.uri}`]?.contentType,
    );

    if (missing.length > 0) {
      const fetched = await this.client.farcasterContentReference.findMany({
        where: {
          OR: missing.map((reference) => ({
            fid: BigInt(reference.fid),
            hash: reference.hash,
            type: "EMBED",
            uri: reference.uri,
          })),
        },
      });

      for (const content of fetched) {
        if (!content.contentType) continue;
        cacheMap[`${content.hash}:${content.uri}`] = {
          uri: content.uri,
          protocol: content.protocol,
          host: content.host,
          path: content.path,
          query: content.query,
          fragment: content.fragment,
          contentType: content.contentType,
          length: content.length,
          metadata: content.metadata as Metadata,
          frame: content.frame as Frame,
          hasFrame: content.hasFrame,
        } as UrlContentResponse;
      }

      await this.cache.setReferences(references, Object.values(cacheMap));
    }

    const stillMissing = missing.filter(
      (reference) =>
        !cacheMap[`${reference.hash}:${reference.uri}`]?.contentType,
    );

    if (stillMissing.length > 0) {
      const contentMap = await this.getOrFetchContent(
        stillMissing.map((reference) => reference.uri),
        skipFetch,
      );

      const data = stillMissing.map((reference) => ({
        ...reference,
        ...contentMap[reference.uri],
        fid: BigInt(reference.fid),
        parentFid: reference.parentFid
          ? BigInt(reference.parentFid)
          : undefined,
        rootParentFid: reference.rootParentFid
          ? BigInt(reference.rootParentFid)
          : undefined,
        metadata: (contentMap[reference.uri]?.metadata ||
          Prisma.DbNull) as Prisma.InputJsonValue,
        frame: (contentMap[reference.uri]?.frame ||
          Prisma.DbNull) as Prisma.InputJsonValue,
        type: "EMBED",
      }));

      await Promise.all(
        data.map((content) =>
          this.client.farcasterContentReference.upsert({
            where: {
              uri_fid_hash_type: {
                fid: content.fid,
                hash: content.hash,
                type: content.type,
                uri: content.uri,
              },
            },
            create: content,
            update: content,
          }),
        ),
      );

      for (const value of data) {
        cacheMap[`${value.hash}:${value.uri}`] = contentMap[value.uri];
      }

      await this.cache.setReferences(references, Object.values(cacheMap));

      const toQueue = stillMissing.filter(
        (reference) => !contentMap[reference.uri],
      );

      if (skipFetch) {
        await Promise.all(
          toQueue.map((reference) => publishContent(reference)),
        );
      }
    }

    return references.map(
      (reference) => cacheMap[`${reference.hash}:${reference.uri}`],
    );
  }

  async getOrFetchContent(uris: string[], skipFetch?: boolean) {
    const uniqueUris = Array.from(new Set(uris));
    const cached = await this.cache.getContents(uniqueUris);
    const contentMap = cached.reduce(
      (acc, content, index) => {
        if (!content?.contentType) return acc;
        acc[uniqueUris[index]] = content;
        return acc;
      },
      {} as Record<string, UrlContentResponse>,
    );

    const fetchedUris = uniqueUris.filter((uri) => !contentMap[uri]);
    if (fetchedUris.length > 0) {
      const contents = await this.client.farcasterContentReference.findMany({
        where: {
          uri: {
            in: fetchedUris,
          },
        },
      });

      const formatted = contents.map(
        (content) =>
          ({
            ...content,
            metadata: content.metadata as Metadata,
            frame: content.frame as Frame,
          }) as UrlContentResponse,
      );

      for (const content of formatted) {
        if (!content.contentType) continue;
        contentMap[content.uri] = content;
      }

      await this.cache.setContents(
        formatted
          .filter((content) => content.contentType)
          .filter(Boolean) as UrlContentResponse[],
      );
    }

    const missingUris = fetchedUris.filter((uri) => !contentMap[uri]);
    if (missingUris.length > 0 && !skipFetch) {
      const contents = await Promise.all(
        missingUris.map((uri) => getUrlContent(uri)),
      );
      for (const content of contents) {
        if (!content) continue;
        contentMap[content.uri] = content;
      }

      await this.cache.setContents(
        contents.filter(Boolean) as UrlContentResponse[],
      );
    }

    return contentMap;
  }

  async deleteReferences(references: FarcasterContentReference[]) {
    await this.client.farcasterContentReference.deleteMany({
      where: {
        OR: references.map((reference) => ({
          fid: BigInt(reference.fid),
          hash: reference.hash,
          type: "EMBED",
          uri: reference.uri,
        })),
      },
    });
  }
}
