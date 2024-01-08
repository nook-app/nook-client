import { Db, MongoClient as Client, Collection } from "mongodb";
import {
  Content,
  ContentEngagementType,
  EventAction,
  EventActionData,
  EventService,
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

  getCollection(collection: MongoCollection): Collection {
    return this.getDb().collection(collection);
  }

  findContent = async (contentId: string) => {
    const collection = this.getCollection(MongoCollection.Content);
    return await collection.findOne({
      contentId,
    });
  };

  upsertContent = async (content: Content) => {
    const collection = this.getCollection(MongoCollection.Content);
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
    const collection = this.getCollection(MongoCollection.Events);
    await collection.deleteOne({
      eventId: event.eventId,
    });
    await collection.insertOne(event);
  };

  upsertActions = async (actions: EventAction<EventActionData>[]) => {
    if (actions.length === 0) return;
    const collection = this.getCollection(MongoCollection.Actions);
    await collection.deleteMany({
      eventId: actions[0].eventId,
    });
    await collection.insertMany(actions);
  };

  incrementEngagement = async (
    contentId: string,
    engagementType: ContentEngagementType,
    service: EventService,
  ) => {
    const collection = this.getCollection(MongoCollection.Content);
    await collection.updateOne(
      {
        contentId,
      },
      {
        $inc: {
          [`engagement.${engagementType}.${service}`]: 1,
        },
      },
    );
  };

  decrementEngagement = async (
    contentId: string,
    engagementType: ContentEngagementType,
    service: EventService,
  ) => {
    const collection = this.getCollection(MongoCollection.Content);
    await collection.updateOne(
      {
        contentId,
      },
      {
        $inc: {
          [`engagement.${engagementType}.${service}`]: -1,
        },
      },
    );
  };
}
