import { FastifyInstance } from "fastify";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import { Content, ContentData, Entity } from "@flink/common/types";
import { ContentFeed } from "../../types";
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

    const actions = await collection
      .find(queryFilter)
      .sort(sortOptions)
      .limit(PAGE_SIZE)
      .toArray();

    const contentIds = actions.flatMap((a) => a.referencedContentIds);
    const contentMap = await this.getContentMap(contentIds);

    const entityIds = actions
      .flatMap((a) => a.referencedEntityIds)
      .concat(Object.values(contentMap).flatMap((c) => c.referencedEntityIds));

    const entityMap = await this.getEntityMap(entityIds);

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

    const data = actions.map((a) => {
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
        actions.length === PAGE_SIZE
          ? Buffer.from(
              JSON.stringify({
                _id: actions[actions.length - 1]._id,
                value: getNestedValue(actions[actions.length - 1], sortField),
              }),
            ).toString("base64")
          : undefined,
    };
  }

  async getEntityMap(entityIds: ObjectId[]): Promise<Record<string, Entity>> {
    const entities = await this.client
      .getCollection<Entity>(MongoCollection.Entity)
      .find({ _id: { $in: entityIds } })
      .toArray();
    return entities.reduce(
      (acc, e) => {
        acc[e._id.toString()] = e;
        return acc;
      },
      {} as Record<string, Entity>,
    );
  }

  async getContentMap(
    contentIds: string[],
  ): Promise<Record<string, Content<ContentData>>> {
    const contents = await this.client
      .getCollection<Content<ContentData>>(MongoCollection.Content)
      .find({ contentId: { $in: contentIds } })
      .toArray();
    return contents.reduce(
      (acc, c) => {
        acc[c.contentId.toString()] = c;
        return acc;
      },
      {} as Record<string, Content<ContentData>>,
    );
  }
}
