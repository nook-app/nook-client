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
    const updateResult = await collection.updateOne(
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
    return updateResult.upsertedCount > 0;
  };

  upsertEvent = async <T>(event: UserEvent<T>) => {
    const collection = this.getCollection<UserEvent<T>>(MongoCollection.Events);
    const updateResult = await collection.updateOne(
      {
        eventId: event.eventId,
      },
      {
        $set: event,
      },
      {
        upsert: true,
      },
    );
    return updateResult.upsertedCount > 0;
  };

  upsertActions = async (actions: EventAction<EventActionData>[]) => {
    if (actions.length === 0) return;
    const collection = this.getCollection<EventAction<EventActionData>>(
      MongoCollection.Actions,
    );
    const deleteResult = await collection.deleteMany({
      eventId: {
        $in: actions.map((action) => action.eventId),
      },
    });
    const insertResult = await collection.insertMany(actions);
    return insertResult.insertedCount > deleteResult.deletedCount;
  };
}
