import { FastifyInstance } from "fastify";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import {
  Content,
  ContentData,
  Entity,
  EventAction,
  EventActionData,
  EventActionType,
} from "@flink/common/types";
import {
  GetFeedRequest,
  FeedItem,
  FeedItemEngagement,
  FeedItemContentWithEngagement,
} from "../../types";
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

    const actions = await collection
      .find(queryFilter)
      .sort({ _id: -1 })
      .limit(25)
      .toArray();

    const contentIds = actions.flatMap((a) => a.contentIds);
    const contentMap = await this.getContentMap(contentIds);

    const entityIds = actions
      .flatMap((a) => a.entityIds)
      .concat(Object.values(contentMap).flatMap((c) => c.entityIds));

    const [entityMap, engagementMap] = await Promise.all([
      this.getEntityMap(entityIds),
      this.getEngagementMap(contentIds),
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
          acc[id] = {
            content: contentMap[id],
            engagement: engagementMap[id] || {
              likes: 0,
              reposts: 0,
              replies: 0,
            },
          };
          return acc;
        },
        {} as Record<string, FeedItemContentWithEngagement>,
      );
    };

    const data = actions.map((a) => {
      const contentMap = getRelevantContentMap(a.contentIds);
      const entityMap = getRelevantEntityMap(
        a.entityIds.concat(
          Object.values(contentMap)
            .flatMap((c) => c.content?.entityIds)
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

  async getEngagementMap(contentIds: string[]) {
    const collection = this.client.getCollection<EventAction<EventActionData>>(
      MongoCollection.Actions,
    );

    const engagement = await collection
      .aggregate([
        {
          $match: {
            type: {
              $in: ["LIKE", "REPOST", "REPLY"],
            },
            "topics.type": "TARGET_CONTENT",
            "topics.value": { $in: contentIds },
          },
        },
        {
          $unwind: "$topics",
        },
        {
          $match: {
            "topics.type": "TARGET_CONTENT",
            "topics.value": { $in: contentIds },
          },
        },
        {
          $group: {
            _id: {
              contentId: "$topics.value",
              type: "$type",
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    return engagement.reduce(
      (acc, e) => {
        if (!acc[e._id.contentId]) {
          acc[e._id.contentId] = {
            likes: 0,
            reposts: 0,
            replies: 0,
          };
        }
        switch (e._id.type) {
          case EventActionType.LIKE:
            acc[e._id.contentId].likes = e.count;
            break;
          case EventActionType.REPOST:
            acc[e._id.contentId].reposts = e.count;
            break;
          case EventActionType.REPLY:
            acc[e._id.contentId].replies = e.count;
            break;
        }
        return acc;
      },
      {} as Record<string, FeedItemEngagement>,
    );
  }
}
