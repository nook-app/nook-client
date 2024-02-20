import { FastifyInstance } from "fastify";
import { MongoClient, MongoCollection } from "@nook/common/mongo";
import {
  Content,
  ContentData,
  ContentFeedArgs,
  Entity,
  Nook,
} from "@nook/common/types";
import { ContentFeed, ContentFeedItem, GetNookResponse } from "../../types";
import { ObjectId } from "mongodb";
import { createChannelNook, createEntityNook } from "../utils/nooks";
import { getOrCreateContent } from "@nook/common/scraper";

const PAGE_SIZE = 25;

export class NookService {
  private client: MongoClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.mongo.client;
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
    const sortField = sort || "_id";

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
            _id: {
              [sortDirection === 1 ? "$gt" : "$lt"]: new ObjectId(
                cursorObj._id,
              ),
            },
          },
        ],
      };
    }

    let sortOptions: Record<string, SortDirection> = { _id: -1 };
    if (sort) {
      sortOptions = { [sort]: sortDirection as SortDirection, ...sortOptions };
    }

    const content = await collection
      .find(queryFilter)
      .sort(sortOptions)
      .limit(PAGE_SIZE)
      .toArray();

    const { contents, entities } =
      await this.getReferencedContentsAndEntities(content);

    const data = content.map((a) => {
      const relevantContents = [];

      for (const contentId of a.referencedContentIds) {
        const content = contents.find((c) => c.contentId === contentId);
        if (content) {
          relevantContents.push(content);
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
                _id: content[content.length - 1]._id,
                value: getNestedValue(content[content.length - 1], sortField),
              }),
            ).toString("base64")
          : undefined,
    };
  }

  async getReferencedContentsAndEntities(content: Content<ContentData>[]) {
    const referencedContentIds = content.flatMap((a) => a.referencedContentIds);
    const contents = await this.client
      .getCollection<Content<ContentData>>(MongoCollection.Content)
      .find({ contentId: { $in: referencedContentIds } })
      .toArray();

    const secondLevelReferencedContentIds = contents
      .flatMap((c) => c.referencedContentIds)
      .filter((id) => !referencedContentIds.includes(id));
    const secondLevelContents = await this.client
      .getCollection<Content<ContentData>>(MongoCollection.Content)
      .find({ contentId: { $in: secondLevelReferencedContentIds } })
      .toArray();

    const referencedEntityIds = content
      .flatMap((a) => a.referencedEntityIds)
      .concat(contents.flatMap((c) => c.referencedEntityIds));
    const entities = await this.client
      .getCollection<Entity>(MongoCollection.Entity)
      .find({ _id: { $in: referencedEntityIds } })
      .toArray();

    return {
      contents: [...contents, ...secondLevelContents],
      entities,
    };
  }

  async getContent(contentId: string): Promise<ContentFeedItem | undefined> {
    const content = await this.client.findContent(contentId);
    if (!content) return;

    const { contents, entities } = await this.getReferencedContentsAndEntities([
      content,
    ]);

    return {
      ...content,
      _id: content._id.toString(),
      entities,
      contents,
    };
  }

  async getEntities(entityIds: string[]): Promise<Entity[]> {
    const entities = await this.client
      .getCollection<Entity>(MongoCollection.Entity)
      .find({ _id: { $in: entityIds.map((id) => new ObjectId(id)) } })
      .toArray();
    return entities;
  }

  async getNook(nookId: string): Promise<GetNookResponse> {
    let nook = await this.client
      .getCollection<Nook>(MongoCollection.Nooks)
      .findOne({ nookId });

    if (nookId.startsWith("entity:")) {
      const entity = await this.client.findEntity(
        new ObjectId(nookId.replace("entity:", "")),
      );
      if (!entity) {
        throw new Error("Entity not found");
      }
      if (!nook) {
        nook = await createEntityNook(this.client, entity);
      }
      return {
        ...nook,
        entities: [entity],
        contents: [],
      };
    }

    if (nookId.startsWith("channel:")) {
      const content = await getOrCreateContent(
        this.client,
        nookId.replace("channel:", ""),
        true,
      );
      if (!content) {
        throw new Error("Content not found");
      }
      if (!nook) {
        nook = await createChannelNook(this.client, content);
      }
      return {
        ...nook,
        entities: [],
        contents: [content],
      };
    }

    throw new Error("Nook not found");
  }
}
