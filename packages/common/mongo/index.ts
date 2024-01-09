import { Db, MongoClient as Client, Collection } from "mongodb";
import {
  Content,
  ContentData,
  EventAction,
  EventActionData,
  EventActionType,
  UserEvent,
} from "../types";

const DB_NAME = "flink";

export enum MongoCollection {
  Events = "events",
  Actions = "actions",
  Content = "content",
}

export class MongoClient {
  private client: Client;
  private db: Db;

  constructor() {
    this.client = new Client(process.env.EVENT_DATABASE_URL);
    this.db = this.client.db(DB_NAME);
  }

  async connect() {
    await this.client.connect();
  }

  async close() {
    await this.client.close();
  }

  getDb() {
    return this.db;
  }

  getCollection<T>(collection: MongoCollection): Collection<T> {
    return this.getDb().collection<T>(collection);
  }

  findContent = async (contentId: string) => {
    const collection = this.getCollection<Content<ContentData>>(
      MongoCollection.Content,
    );
    return await collection.findOne({
      contentId,
    });
  };

  upsertContent = async (content: Content<ContentData>) => {
    const collection = this.getCollection<Content<ContentData>>(
      MongoCollection.Content,
    );
    await collection.updateOne(
      {
        contentId: content.contentId,
      },
      {
        $set: content,
      },
      {
        upsert: true,
      },
    );
  };

  upsertEvent = async <T>(event: UserEvent<T>) => {
    const collection = this.getCollection<UserEvent<T>>(MongoCollection.Events);
    await collection.deleteOne({
      eventId: event.eventId,
    });
    await collection.insertOne(event);
  };

  upsertActions = async (actions: EventAction<EventActionData>[]) => {
    if (actions.length === 0) return;
    const collection = this.getCollection<EventAction<EventActionData>>(
      MongoCollection.Actions,
    );
    await collection.deleteMany({
      eventId: actions[0].eventId,
    });
    await collection.insertMany(actions);
  };

  refreshEngagement = async (contentId: string) => {
    const actions = this.getCollection(MongoCollection.Actions);
    const content = this.getCollection(MongoCollection.Content);
    if (contentId.startsWith("farcaster:")) {
      const [replies, rootReplies, likes, reposts, embeds] = await Promise.all([
        actions.countDocuments({
          type: EventActionType.REPLY,
          "data.parentId": contentId,
          deletedAt: null,
        }),
        actions.countDocuments({
          type: EventActionType.REPLY,
          "data.rootParentId": contentId,
          deletedAt: null,
        }),
        actions.countDocuments({
          type: EventActionType.LIKE,
          "data.contentId": contentId,
          deletedAt: null,
        }),
        actions.countDocuments({
          type: EventActionType.REPOST,
          "data.contentId": contentId,
          deletedAt: null,
        }),
        actions.countDocuments({
          type: EventActionType.POST,
          "data.embeds": contentId,
          deletedAt: null,
        }),
      ]);
      await content.updateOne(
        {
          contentId,
        },
        {
          $set: {
            "engagement.replies": replies,
            "engagement.rootReplies": rootReplies,
            "engagement.embeds": embeds,
            "engagement.likes": likes,
            "engagement.reposts": reposts,
          },
        },
      );
    } else {
      const [replies, rootReplies, likes, reposts, embeds, posts] =
        await Promise.all([
          actions.countDocuments({
            type: EventActionType.REPLY,
            "data.parent.embeds": contentId,
            deletedAt: null,
          }),
          actions.countDocuments({
            type: EventActionType.REPLY,
            "data.rootParent.embeds": contentId,
            deletedAt: null,
          }),
          actions.countDocuments({
            type: EventActionType.LIKE,
            "data.embeds": contentId,
            deletedAt: null,
          }),
          actions.countDocuments({
            type: EventActionType.REPOST,
            "data.embeds": contentId,
            deletedAt: null,
          }),
          actions.countDocuments({
            type: EventActionType.POST,
            "data.embeds": contentId,
            deletedAt: null,
          }),
          actions.countDocuments({
            type: EventActionType.POST,
            "data.channelId": contentId,
            deletedAt: null,
          }),
        ]);
      await content.updateOne(
        {
          contentId,
        },
        {
          $set: {
            "engagement.posts": posts,
            "engagement.replies": replies,
            "engagement.rootReplies": rootReplies,
            "engagement.embeds": embeds,
            "engagement.likes": likes,
            "engagement.reposts": reposts,
          },
        },
      );
    }
  };
}
