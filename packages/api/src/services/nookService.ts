import { FastifyInstance } from "fastify";
import { MongoClient, MongoCollection } from "@nook/common/mongo";
import {
  Channel,
  Content,
  ContentData,
  ContentFeedArgs,
  ContentType,
  Entity,
  Nook,
  PostData,
} from "@nook/common/types";
import { ContentFeed, ContentFeedItem } from "../../types";
import { ObjectId } from "mongodb";
import { createChannelNook, createEntityNook } from "../utils/nooks";
import { getOrCreateChannel, getOrCreateContent } from "@nook/common/scraper";
import { RedisClient } from "@nook/common/cache";

const PAGE_SIZE = 10;

export class NookService {
  private client: MongoClient;
  private cache: RedisClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.mongo.client;
    this.cache = fastify.cache.client;
  }

  async getContentFeed(
    { filter, sort, sortDirection = -1 }: ContentFeedArgs,
    cursor?: string,
  ): Promise<ContentFeed> {
    const collection = this.client.getCollection<Content<ContentData>>(
      MongoCollection.Content,
    );

    let queryFilter = { ...filter };
    type SortDirection = 1 | -1;
    const sortField = sort || "timestamp";

    if (cursor) {
      const cursorObj = JSON.parse(Buffer.from(cursor, "base64").toString());
      queryFilter = {
        ...queryFilter,
        $or: [
          {
            [sortField]: {
              [sortDirection === 1 ? "$gt" : "$lt"]: cursorObj.value,
            },
          },
          {
            [sortField]: cursorObj.value,
            timestamp: {
              [sortDirection === 1 ? "$gt" : "$lt"]: new Date(
                cursorObj.timestamp,
              ),
            },
          },
        ],
      };
    }

    let sortOptions: Record<string, SortDirection> = { timestamp: -1 };
    if (sort) {
      sortOptions = { [sort]: sortDirection as SortDirection, ...sortOptions };
    }

    const content = await collection
      .find(queryFilter)
      .sort(sortOptions)
      .limit(PAGE_SIZE)
      .toArray();

    const contents = await this.getReferencedContents(content);
    const entities = await this.getReferencedEntities(contents);
    const channels = await this.getReferencedChannels(contents);

    const data = content.map((a) => {
      const relevantContents = [];
      const relevantChannels = [];

      for (const contentId of a.referencedContentIds) {
        const content = contents.find((c) => c.contentId === contentId);
        if (content) {
          relevantContents.push(content);
        }
        const channel = channels.find((c) => c.contentId === contentId);
        if (channel) {
          relevantChannels.push(channel);
        }
      }

      for (const contentId of relevantContents.flatMap(
        (c) => c?.referencedContentIds,
      )) {
        if (!contentId) continue;
        const content = contents.find((c) => c.contentId === contentId);
        if (content) {
          relevantContents.push(content);
        }
        const channel = channels.find((c) => c.contentId === contentId);
        if (channel) {
          relevantChannels.push(channel);
        }
      }

      const relevantEntities = [];

      for (const entityId of a.referencedEntityIds) {
        const entity = entities.find((e) => e._id.equals(entityId));
        if (entity) {
          relevantEntities.push(entity);
        }
      }

      for (const entityId of relevantContents.flatMap(
        (c) => c?.referencedEntityIds,
      )) {
        if (!entityId) continue;
        const entity = entities.find((e) => e._id.equals(entityId));
        if (entity) {
          relevantEntities.push(entity);
        }
      }

      return {
        ...a,
        _id: a._id.toString(),
        entities: relevantEntities,
        contents: relevantContents,
        channels: relevantChannels,
      };
    });

    function getNestedValue<T>(obj: T, path: string) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return path.split(".").reduce((acc: any, part) => acc?.[part], obj);
    }

    return {
      data,
      nextCursor:
        content.length === PAGE_SIZE
          ? Buffer.from(
              JSON.stringify({
                timestamp: content[content.length - 1].timestamp,
                value: getNestedValue(content[content.length - 1], sortField),
              }),
            ).toString("base64")
          : undefined,
    };
  }

  async fetchContents(contentIds: string[]) {
    const cachedContents = (await this.cache.getContents(contentIds)).filter(
      Boolean,
    ) as Content<ContentData>[];
    const cachedContentIds = cachedContents.map((c) => c.contentId);
    const uncachedContentIds = contentIds.filter(
      (id) => !cachedContentIds.includes(id),
    );
    const existingContents = await this.client
      .getCollection<Content<ContentData>>(MongoCollection.Content)
      .find({ contentId: { $in: uncachedContentIds } })
      .toArray();
    const existingContentIds = existingContents.map((c) => c.contentId);
    const missingContentIds = uncachedContentIds.filter(
      (id) => !existingContentIds.includes(id),
    );
    const missingContents = (
      await Promise.all(
        missingContentIds.map(async (id) => {
          try {
            return await getOrCreateContent(this.client, id);
          } catch (e) {}
        }),
      )
    ).filter(Boolean) as Content<ContentData>[];
    await this.cache.setContents([...existingContents, ...missingContents]);
    return [...cachedContents, ...existingContents, ...missingContents];
  }

  async getReferencedContents(content: Content<ContentData>[]) {
    const referencedContentIds = content.flatMap((a) => a.referencedContentIds);
    const referencedContents = await this.fetchContents(referencedContentIds);

    const secondLevelReferencedContentIds = referencedContents
      .flatMap((c) => c.referencedContentIds)
      .filter((id) => !referencedContentIds.includes(id));
    const secondLevelContents = await this.fetchContents(
      secondLevelReferencedContentIds,
    );
    return [...referencedContents, ...secondLevelContents];
  }

  async fetchEntities(entityIds: string[]) {
    const cachedEntities = (await this.cache.getEntities(entityIds)).filter(
      Boolean,
    ) as Entity[];
    const cachedEntityIds = cachedEntities.map((e) => e._id.toString());
    const uncachedEntityIds = entityIds.filter(
      (id) => !cachedEntityIds.includes(id),
    );
    const existingEntities = await this.client
      .getCollection<Entity>(MongoCollection.Entity)
      .find({ _id: { $in: uncachedEntityIds.map((id) => new ObjectId(id)) } })
      .toArray();
    await this.cache.setEntities(existingEntities);
    return [...cachedEntities, ...existingEntities];
  }

  async getReferencedEntities(content: Content<ContentData>[]) {
    const referencedEntityIds = content.flatMap((a) => a.referencedEntityIds);
    const referencedEntities = await this.fetchEntities(referencedEntityIds);
    return referencedEntities;
  }

  async fetchChannels(channelIds: string[]) {
    const cachedChannels = (await this.cache.getChannels(channelIds)).filter(
      Boolean,
    ) as Channel[];
    const cachedChannelIds = cachedChannels.map((c) => c.contentId);
    const uncachedChannelIds = channelIds.filter(
      (id) => !cachedChannelIds.includes(id),
    );
    const existingChannels = await this.client
      .getCollection<Channel>(MongoCollection.Channels)
      .find({ contentId: { $in: uncachedChannelIds } })
      .toArray();
    await this.cache.setChannels(existingChannels);
    return [...cachedChannels, ...existingChannels];
  }

  async getReferencedChannels(content: Content<ContentData>[]) {
    const referencedChannelIds = content
      .map((c) => {
        if (c.type === ContentType.POST || c.type === ContentType.REPLY) {
          const post = c.data as PostData;
          return post.channelId;
        }
      })
      .filter(Boolean) as string[];
    const referencedChannels = await this.fetchChannels(referencedChannelIds);
    return referencedChannels;
  }

  async getContent(contentId: string): Promise<ContentFeedItem | undefined> {
    const content = await this.client.findContent(contentId);
    if (!content) return;

    const contents = await this.getReferencedContents([content]);
    const entities = await this.getReferencedEntities(contents);
    const channels = await this.getReferencedChannels(contents);

    return {
      ...content,
      _id: content._id.toString(),
      entities,
      contents,
      channels,
    };
  }

  async getEntities(entityIds: string[]): Promise<Entity[]> {
    const entities = await this.client
      .getCollection<Entity>(MongoCollection.Entity)
      .find({ _id: { $in: entityIds.map((id) => new ObjectId(id)) } })
      .toArray();
    return entities;
  }

  async getNook(nookId: string): Promise<Nook> {
    let nook = await this.client
      .getCollection<Nook>(MongoCollection.Nooks)
      .findOne({ nookId });

    if (nookId.startsWith("entity:")) {
      const entity = await this.client.findEntity(
        nookId.replace("entity:", ""),
      );
      if (!entity) {
        throw new Error("Entity not found");
      }
      if (!nook) {
        nook = await createEntityNook(this.client, entity);
      }
      return nook;
    }

    if (nookId.startsWith("channel:")) {
      const channel = await getOrCreateChannel(
        this.client,
        this.cache,
        nookId.replace("channel:", ""),
      );
      if (!channel) {
        throw new Error("Channel not found");
      }
      if (!nook) {
        nook = await createChannelNook(this.client, channel);
      }
      return nook;
    }

    throw new Error("Nook not found");
  }

  async searchChannels(query: string): Promise<Channel[]> {
    const channels = await this.client
      .getCollection<Channel>(MongoCollection.Channels)
      .find({ name: { $regex: new RegExp(query, "i") } })
      .toArray();
    return channels;
  }
}
