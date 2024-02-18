import { FastifyInstance } from "fastify";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import { Content, ContentData, Entity } from "@flink/common/types";
import { ContentFeed, ContentFeedItem } from "../../types";
import { ObjectId } from "mongodb";
import { ContentFeedArgs } from "../../data";

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

    const { contentMap, entityMap } =
      await this.getContentAndEntityMap(content);

    const getRelevantEntityMap = (ids: ObjectId[]) => {
      return ids.reduce(
        (acc, id) => {
          acc[id.toString()] = entityMap[id.toString()];
          return acc;
        },
        {} as Record<string, Entity>,
      );
    };

    const getRelevantContentMap = (ids: string[]) => {
      return ids.reduce(
        (acc, id) => {
          acc[id] = contentMap[id];
          return acc;
        },
        {} as Record<string, Content<ContentData>>,
      );
    };

    const data = content.map((a) => {
      const contentMap = getRelevantContentMap(a.referencedContentIds);
      const entityMap = getRelevantEntityMap(
        a.referencedEntityIds.concat(
          Object.values(contentMap)
            .flatMap((c) => c?.referencedEntityIds)
            .filter(Boolean) as ObjectId[],
        ),
      );
      return {
        ...a,
        _id: a._id.toString(),
        entityMap,
        contentMap,
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

  async getContentAndEntityMap(content: Content<ContentData>[]) {
    const referencedContentIds = content.flatMap((a) => a.referencedContentIds);
    const contents = await this.client
      .getCollection<Content<ContentData>>(MongoCollection.Content)
      .find({ contentId: { $in: referencedContentIds } })
      .toArray();
    const contentMap = contents.reduce(
      (acc, c) => {
        acc[c.contentId.toString()] = c;
        return acc;
      },
      {} as Record<string, Content<ContentData>>,
    );

    const referencedEntityIds = content
      .flatMap((a) => a.referencedEntityIds)
      .concat(Object.values(contentMap).flatMap((c) => c.referencedEntityIds));
    const entities = await this.client
      .getCollection<Entity>(MongoCollection.Entity)
      .find({ _id: { $in: referencedEntityIds } })
      .toArray();
    const entityMap = entities.reduce(
      (acc, e) => {
        acc[e._id.toString()] = e;
        return acc;
      },
      {} as Record<string, Entity>,
    );

    return {
      contentMap,
      entityMap,
    };
  }

  async getContent(contentId: string): Promise<ContentFeedItem | undefined> {
    const content = await this.client.findContent(contentId);
    if (!content) return;

    const { contentMap, entityMap } = await this.getContentAndEntityMap([
      content,
    ]);

    return {
      ...content,
      _id: content._id.toString(),
      entityMap,
      contentMap,
    };
  }
}
