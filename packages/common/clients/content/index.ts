import { Metadata } from "metascraper";
import { getUrlContent } from "../../content";
import { Prisma, PrismaClient } from "../../prisma/content";
import { RedisClient } from "../../redis";
import {
  FarcasterCastResponse,
  FrameData,
  UrlContentResponse,
} from "../../types";

enum ContentReferenceType {
  Embed = "EMBED",
  Reply = "REPLY",
  Quote = "QUOTE",
}

type ContentReference = {
  fid: bigint;
  hash: string;
  uri: string;
  type: ContentReferenceType;
  timestamp: Date;
};

export class ContentClient {
  private client: PrismaClient;
  private redis: RedisClient;

  CONTENT_CACHE_PREFIX = "content";

  constructor() {
    this.client = new PrismaClient();
    this.redis = new RedisClient();
  }

  async connect() {
    await this.client.$connect();
    await this.redis.connect();
  }

  async close() {
    await this.client.$disconnect();
    await this.redis.close();
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

  async getContents(uris: string[]): Promise<UrlContentResponse[]> {
    return Promise.all(uris.map((uri) => this.getContent(uri)));
  }

  async getContent(uri: string): Promise<UrlContentResponse> {
    const cached = await this.redis.getJson(
      `${this.CONTENT_CACHE_PREFIX}:${uri}`,
    );
    if (cached) return cached;

    let content = await this.client.urlContent.findUnique({
      where: {
        uri,
      },
    });

    if (!content) {
      content = await getUrlContent(uri);
      await this.client.urlContent.upsert({
        where: {
          uri,
        },
        create: {
          ...content,
          metadata: (content.metadata ||
            Prisma.DbNull) as Prisma.InputJsonValue,
          frame: (content.frame || Prisma.DbNull) as Prisma.InputJsonValue,
        },
        update: {
          ...content,
          metadata: (content.metadata ||
            Prisma.DbNull) as Prisma.InputJsonValue,
          frame: (content.frame || Prisma.DbNull) as Prisma.InputJsonValue,
        },
      });
    }

    await this.redis.setJson(`${this.CONTENT_CACHE_PREFIX}:${uri}`, content);
    return {
      ...content,
      metadata: content.metadata as Metadata,
      frame: content.frame as FrameData,
    } as UrlContentResponse;
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
          uri: url.uri,
          type: ContentReferenceType.Quote,
          timestamp,
        });
      }
    }

    return references;
  }
}
