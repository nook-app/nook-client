import { FastifyInstance } from "fastify";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import {
  Content,
  ContentData,
  Entity,
  EventAction,
  EventActionData,
} from "@flink/common/types";
import {
  GetFeedRequest,
  GetFeedResponse,
  GetFeedResponseItem,
} from "../../types";
import { ObjectId } from "mongodb";

export class FeedService {
  private client: MongoClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.mongo.client;
  }

  async getFeeds({ filter }: GetFeedRequest): Promise<GetFeedResponseItem[]> {
    const collection = this.client.getCollection<EventAction<EventActionData>>(
      MongoCollection.Actions,
    );

    const actions = await collection
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(25)
      .toArray();

    const entityIds = actions.flatMap((a) => a.entityIds);
    const contentIds = actions.flatMap((a) => a.contentIds);

    const [entityMap, contentMap] = await Promise.all([
      this.getEntityMap(entityIds),
      this.getContentMap(contentIds),
    ]);

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
      return {
        _id: a._id.toString(),
        type: a.type,
        timestamp: a.timestamp.toString(),
        data: a.data,
        entity: entityMap[a.entityId.toString()],
        entityMap: getRelevantEntityMap(a.entityIds),
        contentMap: getRelevantContentMap(a.contentIds),
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
