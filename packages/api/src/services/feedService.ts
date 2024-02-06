import { FastifyInstance } from "fastify";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import {
  Content,
  ContentData,
  Entity,
  EventAction,
  EventActionData,
} from "@flink/common/types";
import { GetFeedRequest, FeedItem } from "../../types";
import { ObjectId } from "mongodb";

export class FeedService {
  private client: MongoClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.mongo.client;
  }

  async getFeeds({ filter, cursor }: GetFeedRequest): Promise<FeedItem[]> {
    const collection = this.client.getCollection<EventAction<EventActionData>>(
      MongoCollection.Actions,
    );

    const queryFilter = cursor
      ? {
          ...filter,
          _id: { $lt: new ObjectId(cursor) },
        }
      : filter;

    console.time("query1");
    const actions = await collection
      .find(queryFilter)
      .sort({ _id: -1 })
      .limit(25)
      .toArray();
    console.timeEnd("query1");

    const contentIds = actions.flatMap((a) => a.contentIds);
    console.time("query2");
    const contentMap = await this.getContentMap(contentIds);
    console.timeEnd("query2");

    const entityIds = actions
      .flatMap((a) => a.entityIds)
      .concat(Object.values(contentMap).flatMap((c) => c.entityIds));

    console.time("query3");
    const entityMap = await this.getEntityMap(entityIds);
    console.timeEnd("query3");

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
      const contentMap = getRelevantContentMap(a.contentIds);
      const entityMap = getRelevantEntityMap(
        a.entityIds.concat(
          Object.values(contentMap)
            .flatMap((c) => c?.entityIds)
            .filter(Boolean) as ObjectId[],
        ),
      );
      return {
        _id: a._id.toString(),
        type: a.type,
        timestamp: a.timestamp.toString(),
        data: a.data,
        entity: entityMap[a.entityId.toString()],
        entityMap,
        contentMap,
      };
    });

    return data;
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
