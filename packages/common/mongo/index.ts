import { Db, MongoClient as Client, Collection } from "mongodb";
import { Content, EventAction, UserEvent } from "../types";

const DB_NAME = "flink";

export enum MongoCollection {
  Events = "events",
  Actions = "actions",
  Content = "content",
}

type MongoCollectionType = {
  [MongoCollection.Content]: Content;
  [MongoCollection.Events]: UserEvent;
  [MongoCollection.Actions]: EventAction;
};

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

  getCollection<T extends MongoCollection>(
    collection: T,
  ): Collection<MongoCollectionType[T]> {
    return this.getDb().collection<MongoCollectionType[T]>(collection);
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

  upsertEvent = async (event: UserEvent) => {
    const collection = this.getCollection(MongoCollection.Events);
    await collection.deleteOne({
      source: event.source,
    });
    await collection.insertOne(event);
  };

  upsertActions = async (actions: EventAction[]) => {
    if (actions.length === 0) return;
    const collection = this.getCollection(MongoCollection.Actions);
    await collection.deleteMany({
      eventId: actions[0].eventId,
    });
    await collection.insertMany(actions);
  };
}
