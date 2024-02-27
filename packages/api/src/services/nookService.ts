import { FastifyInstance } from "fastify";
import { MongoClient, MongoCollection } from "@nook/common/mongo";
import { RedisClient } from "@nook/common/cache";
import {
  Channel,
  ChannelFilterType,
  Content,
  ContentType,
  Entity,
  NookPanelData,
  NookPanelType,
  PostData,
  Topic,
  TopicType,
  UserFilterType,
} from "@nook/common/types";
import { getOrCreateContent } from "@nook/common/scraper";
import {
  ContentWithContext,
  EntityWithContext,
  GetContentFeedResponse,
  GetContentResponse,
} from "../../types";
import { Document, Filter } from "mongodb";

const PAGE_SIZE = 25;

function getNestedValue<T>(obj: T, path: string) {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return path.split(".").reduce((acc: any, part) => acc?.[part], obj);
}

export class NookService {
  private client: MongoClient;
  private cache: RedisClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.mongo.client;
    this.cache = fastify.cache.client;
  }

  async getContent(
    viewerId: string,
    contentId: string,
  ): Promise<GetContentResponse | undefined> {
    const content = await this.fetchContent(viewerId, contentId);
    if (!content) return;

    const contents = await this.fetchContents(
      viewerId,
      content.content.referencedContentIds,
    );

    const [entities, channels] = await Promise.all([
      this.getReferencedEntities(viewerId, contents),
      this.getReferencedChannels(viewerId, contents),
    ]);

    return {
      data: content.content,
      referencedEntities: entities,
      referencedContents: contents,
      referencedChannels: channels,
    };
  }

  async getReferencedEntities(
    viewerId: string,
    contents: ContentWithContext[],
  ) {
    const entityIds = Array.from(
      new Set(
        contents.flatMap((content) => content.content.referencedEntityIds),
      ),
    );
    return await this.fetchEntities(viewerId, entityIds);
  }

  async getReferencedChannels(
    viewerId: string,
    contents: ContentWithContext[],
  ) {
    const channelIds = contents
      .map(({ content }) => {
        if (
          content.type === ContentType.POST ||
          content.type === ContentType.REPLY
        ) {
          const post = content.data as PostData;
          return post.channelId;
        }
      })
      .filter(Boolean) as string[];
    return await this.fetchChannels(channelIds);
  }

  async getContentFilterAndSort({ type, args }: NookPanelData) {
    switch (type) {
      case NookPanelType.UserPosts: {
        const filter = { type: { $in: args.contentTypes } } as Filter<Content>;
        if (args.userFilter.type === UserFilterType.Entities) {
          filter.$or = [];
          for (const entityId of args.userFilter.args.entityIds) {
            filter.$or.push({
              topics: {
                type: TopicType.SOURCE_ENTITY,
                value: entityId,
              },
            });
          }
        }
        return {
          filter,
          sort: args.sort === "top" ? "enagement.likes" : "timestamp",
        };
      }
      case NookPanelType.ChannelPosts: {
        const filter = { type: { $in: args.contentTypes } } as Filter<Content>;
        if (args.channelFilter.type === ChannelFilterType.Channels) {
          filter.$or = [];
          for (const channelId of args.channelFilter.args.channelIds) {
            filter.$or.push({
              topics: {
                type: TopicType.CHANNEL,
                value: channelId,
              },
            });
          }
        }
        return {
          filter,
          sort: args.sort === "top" ? "enagement.likes" : "timestamp",
        };
      }
      case NookPanelType.PostReplies: {
        return {
          filter: {
            "data.parentId": args.targetContentId,
          },
          sort: args.sort === "top" ? "enagement.likes" : "timestamp",
        };
      }
    }
    throw new Error("Invalid NookPanelType");
  }

  async getContentFeed(
    viewerId: string,
    data: NookPanelData,
  ): Promise<GetContentFeedResponse> {
    let feed: Content[];
    let s;
    if (
      data.type === NookPanelType.UserPosts &&
      data.args.userFilter.type === UserFilterType.Following
    ) {
      const feedIds = await this.cache.getFeed(viewerId);
      if (feedIds.length < 25) {
        const { filter, sort } = await this.getContentFilterAndSort(data);
        feed = await this.getFeedRaw<Content>(
          MongoCollection.Content,
          filter,
          sort,
          data.cursor,
        );
        await this.cache.setFeed(
          viewerId,
          feed.map((c) => c.contentId),
        );
      } else {
        feed = (await this.fetchContents(viewerId, feedIds)).map(
          (c) => c.content,
        );
      }
      s = "timestamp";
    } else {
      const { filter, sort } = await this.getContentFilterAndSort(data);
      feed = await this.getFeedRaw<Content>(
        MongoCollection.Content,
        filter,
        sort,
        data.cursor,
      );
      s = sort;
    }

    const contents = await this.fetchContents(
      viewerId,
      feed.flatMap((content) => content.referencedContentIds),
    );

    const [entities, channels] = await Promise.all([
      this.getReferencedEntities(viewerId, contents),
      this.getReferencedChannels(viewerId, contents),
    ]);

    let nextCursor;
    if (feed.length === PAGE_SIZE) {
      const timestamp = feed[feed.length - 1].timestamp;
      const value = getNestedValue(feed[feed.length - 1], s);
      nextCursor = Buffer.from(JSON.stringify({ timestamp, value })).toString(
        "base64",
      );
    }

    return {
      data: feed,
      nextCursor,
      referencedEntities: entities,
      referencedContents: contents,
      referencedChannels: channels,
    };
  }

  async getFeedRaw<T extends Document>(
    colName: MongoCollection,
    filter: object,
    sort: string,
    cursor?: string,
  ) {
    const collection = this.client.getCollection<T>(colName);

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
              $lt: cursorObj.value,
            },
          },
          {
            [sortField]: cursorObj.value,
            timestamp: {
              $lt: new Date(cursorObj.timestamp),
            },
          },
        ],
      };
    }

    let sortOptions: Record<string, SortDirection> = { timestamp: -1 };
    if (sort) {
      sortOptions = { [sort]: -1, ...sortOptions };
    }

    return await collection
      .find(queryFilter as Filter<T>)
      .sort(sortOptions)
      .limit(PAGE_SIZE)
      .toArray();
  }

  /** FETCH FUNCTIONS */

  async fetchEntity(viewerId: string, entityId: string) {
    return (await this.fetchEntities(viewerId, [entityId]))[0];
  }

  async fetchEntities(
    viewerId: string,
    entityIds: string[],
  ): Promise<EntityWithContext[]> {
    const [entities] = await Promise.all([this.fetchEntitiesData(entityIds)]);

    return entities.map((entity) => ({
      entity,
    }));
  }

  async fetchEntitiesData(entityIds: string[]) {
    const cachedResponse = await this.cache.getEntities(entityIds);
    const cachedEntities = cachedResponse.filter(Boolean) as Entity[];
    const cachedEntityIds = cachedEntities.map((entity) =>
      entity._id.toString(),
    );
    const uncachedEntityIds = entityIds.filter(
      (id) => !cachedEntityIds.includes(id),
    );
    const existingEntities = await this.client.getEntities(uncachedEntityIds);
    await this.cache.setEntities(existingEntities);
    return [...cachedEntities, ...existingEntities];
  }

  async fetchContent(
    viewerId: string,
    contentId: string,
  ): Promise<ContentWithContext> {
    return (await this.fetchContents(viewerId, [contentId]))[0];
  }

  async fetchContents(
    viewerId: string,
    contentIds: string[],
  ): Promise<ContentWithContext[]> {
    const [contents] = await Promise.all([this.fetchContentsData(contentIds)]);

    return contents.map((content) => ({
      content,
    }));
  }

  async fetchContentsData(contentIds: string[]) {
    const cachedResponse = await this.cache.getContents(contentIds);
    const cachedContents = cachedResponse.filter(Boolean) as Content[];
    const cachedContentIds = cachedContents.map((content) => content.contentId);
    const uncachedContentIds = contentIds.filter(
      (id) => !cachedContentIds.includes(id),
    );
    const existingContents = await this.client.getContents(uncachedContentIds);
    const existingContentIds = existingContents.map(
      (content) => content.contentId,
    );
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
    ).filter(Boolean) as Content[];
    await this.cache.setContents([...existingContents, ...missingContents]);
    return [...cachedContents, ...existingContents, ...missingContents];
  }

  async fetchChannels(channelIds: string[]) {
    const cachedResponse = await this.cache.getChannels(channelIds);
    const cachedChannels = cachedResponse.filter(Boolean) as Channel[];
    const cachedChannelIds = cachedChannels.map((channel) => channel.contentId);
    const uncachedChannelIds = channelIds.filter(
      (id) => !cachedChannelIds.includes(id),
    );
    const existingChannels = await this.client.getChannels(uncachedChannelIds);
    await this.cache.setChannels(existingChannels);
    return [...cachedChannels, ...existingChannels];
  }

  async getNook(nookId: string) {
    return await this.client.getNook(nookId);
  }

  async searchChannels(query: string): Promise<Channel[]> {
    return await this.client.searchChannels(query);
  }
}
