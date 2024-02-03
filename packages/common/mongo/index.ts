import {
  Db,
  MongoClient as Client,
  Collection,
  ObjectId,
  Document,
} from "mongodb";
import {
  Content,
  ContentData,
  EventAction,
  EventActionData,
  EntityEvent,
} from "../types";

const DB_NAME = "flink";

export enum MongoCollection {
  Events = "events",
  Actions = "actions",
  Content = "content",
  Entity = "entity",
}

export class MongoClient {
  private client: Client;
  private db: Db;

  constructor() {
    this.client = new Client(process.env.EVENT_DATABASE_URL || "");
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

  getCollection<T extends Document>(
    collection: MongoCollection,
  ): Collection<T> {
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

  findAction = async (actionId: string) => {
    const collection = this.getCollection<EventAction<EventActionData>>(
      MongoCollection.Actions,
    );
    return await collection.findOne({
      _id: new ObjectId(actionId),
    });
  };

  upsertContent = async (content: Content<ContentData>) => {
    const collection = this.getCollection<Content<ContentData>>(
      MongoCollection.Content,
    );
    const existingContent = await collection.findOne({
      contentId: content.contentId,
    });
    if (existingContent) {
      return await collection.updateOne(
        {
          contentId: content.contentId,
        },
        {
          $set: content,
        },
      );
    }

    return await collection.insertOne({
      ...content,
      _id: ObjectId.createFromTime(content.timestamp.getTime() / 1000),
    });
  };

  upsertEvent = async <T>(event: EntityEvent<T>) => {
    const collection = this.getCollection<EntityEvent<T>>(
      MongoCollection.Events,
    );
    const existingEvent = await collection.findOne({
      eventId: event.eventId,
    });
    if (existingEvent) {
      return await collection.updateOne(
        {
          eventId: event.eventId,
        },
        {
          $set: event,
        },
      );
    }

    return await collection.insertOne({
      ...event,
      _id: ObjectId.createFromTime(event.timestamp.getTime() / 1000),
    });
  };

  upsertAction = async (action: EventAction<EventActionData>) => {
    const collection = this.getCollection<EventAction<EventActionData>>(
      MongoCollection.Actions,
    );
    const existingAction = await collection.findOne({
      eventId: action.eventId,
      type: action.type,
    });
    if (existingAction) {
      return await collection.updateOne(
        {
          eventId: action.eventId,
          type: action.type,
        },
        {
          $set: action,
        },
      );
    }

    return await collection.insertOne({
      ...action,
      _id: ObjectId.createFromTime(action.timestamp.getTime() / 1000),
    });
  };

  markActionsDeleted = async (id: string) => {
    this.getCollection(MongoCollection.Actions).updateOne(
      {
        "source.id": id,
      },
      {
        $set: {
          deletedAt: new Date(),
        },
      },
    );
  };

  markActionsUndeleted = async (id: string) => {
    this.getCollection(MongoCollection.Actions).updateOne(
      {
        "source.id": id,
      },
      {
        $set: {
          deletedAt: null,
        },
      },
    );
  };

  markContentDeleted = async (contentId: string) => {
    this.getCollection(MongoCollection.Content).updateOne(
      {
        contentId,
      },
      {
        $set: {
          deletedAt: new Date(),
        },
      },
    );
  };

  markContentUndeleted = async (contentId: string) => {
    this.getCollection(MongoCollection.Content).updateOne(
      {
        contentId,
      },
      {
        $set: {
          deletedAt: null,
        },
      },
    );
  };
}
