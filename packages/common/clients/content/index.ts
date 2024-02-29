import { getUrlContent } from "../../content";
import { Prisma, PrismaClient } from "../../prisma/content";
import { RedisClient } from "../../redis";
import { FarcasterCastResponse } from "../../types";

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
    await Promise.all(
      references.map((reference) =>
        this.client.farcasterContentReference.delete({
          where: {
            uri_fid_hash_type: reference,
          },
        }),
      ),
    );
  }

  async upsertReferencedContent(reference: ContentReference) {
    const existingContent = await this.client.urlContent.findUnique({
      where: {
        uri: reference.uri,
      },
    });
    if (!existingContent) {
      const content = await getUrlContent(reference.uri);
      await this.client.urlContent.upsert({
        where: {
          uri: reference.uri,
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

    await this.client.farcasterContentReference.upsert({
      where: {
        uri_fid_hash_type: reference,
      },
      create: reference,
      update: reference,
    });
  }

  parseReferencedContent(cast: FarcasterCastResponse) {
    const timestamp = new Date(cast.timestamp);
    const references: ContentReference[] = [];
    for (const url of cast.urlEmbeds) {
      references.push({
        fid: BigInt(cast.entity.farcaster.fid),
        hash: cast.hash,
        uri: url,
        type: ContentReferenceType.Embed,
        timestamp,
      });
    }

    for (const castEmbed of cast.castEmbeds) {
      for (const url of castEmbed.urlEmbeds) {
        references.push({
          fid: BigInt(cast.entity.farcaster.fid),
          hash: cast.hash,
          uri: url,
          type: ContentReferenceType.Reply,
          timestamp,
        });
      }
    }

    if (cast.parent) {
      for (const url of cast.parent.urlEmbeds) {
        references.push({
          fid: BigInt(cast.entity.farcaster.fid),
          hash: cast.hash,
          uri: url,
          type: ContentReferenceType.Quote,
          timestamp,
        });
      }
    }

    return references;
  }
}
