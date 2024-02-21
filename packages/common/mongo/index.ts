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
  EventActionType,
  Entity,
  Channel,
} from "../types";
import { publishAction } from "../queues";

const DB_NAME = "nook";

export enum MongoCollection {
  Events = "events",
  Actions = "actions",
  Content = "content",
  Entity = "entity",
  Nooks = "nooks",
  Channels = "channels",
}

export class MongoClient {
  private client: Client;
  private db: Db;

  constructor() {
    this.client = new Client(process.env.NOOK_MONGO_URL || "");
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

  findEntity = async (entityId: ObjectId) => {
    const collection = this.getCollection<Entity>(MongoCollection.Entity);
    return await collection.findOne({
      _id: entityId,
    });
  };

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

  findEvent = async (eventId: string) => {
    const collection = this.getCollection<EntityEvent<unknown>>(
      MongoCollection.Events,
    );
    return await collection.findOne({
      eventId,
    });
  };

  findChannel = async (channelId: string) => {
    const collection = this.getCollection<Channel>(MongoCollection.Channels);
    return await collection.findOne({
      contentId: channelId,
    });
  };

  generateObjectIdFromDate = (date: Date) => {
    const datePart = ObjectId.createFromTime(
      date.getTime() / 1000,
    ).toHexString();
    const randomPart = new ObjectId().toHexString();
    const id = datePart.slice(0, 8) + randomPart.slice(8);
    return new ObjectId(id);
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
          $set: {
            ...content,
            _id: existingContent._id,
            updatedAt: new Date(),
          },
        },
      );
    }

    try {
      return await collection.insertOne({
        ...content,
        _id: this.generateObjectIdFromDate(content.timestamp),
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "MongoServerError" &&
        "code" in error &&
        error.code === 11000
      ) {
        return;
      }
      throw error;
    }
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
          $set: {
            ...event,
            _id: existingEvent._id,
            updatedAt: new Date(),
          },
        },
      );
    }

    try {
      return await collection.insertOne({
        ...event,
        _id: this.generateObjectIdFromDate(event.timestamp),
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "MongoServerError" &&
        "code" in error &&
        error.code === 11000
      ) {
        return;
      }
      throw error;
    }
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
      await collection.updateOne(
        {
          eventId: action.eventId,
          type: action.type,
        },
        {
          $set: {
            ...action,
            _id: existingAction._id,
            updatedAt: new Date(),
          },
        },
      );
      await publishAction(existingAction._id.toHexString(), false);
      return existingAction._id;
    }

    try {
      const _id = this.generateObjectIdFromDate(action.timestamp);
      await collection.insertOne({ ...action, _id });
      await publishAction(_id.toHexString(), true);
      return _id;
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "MongoServerError" &&
        "code" in error &&
        error.code === 11000
      ) {
        return;
      }
      throw error;
    }
  };

  upsertChannel = async (channel: Channel) => {
    const collection = this.getCollection<Channel>(MongoCollection.Channels);
    const existingChannel = await collection.findOne({
      contentId: channel.contentId,
    });
    if (existingChannel) {
      return await collection.updateOne(
        {
          contentId: channel.contentId,
        },
        {
          $set: {
            ...channel,
            _id: existingChannel._id,
            updatedAt: new Date(),
          },
        },
      );
    }

    return await collection.insertOne({
      ...channel,
      _id: this.generateObjectIdFromDate(channel.createdAt),
    });
  };

  markActionsDeleted = async (id: string, type: EventActionType) => {
    this.getCollection(MongoCollection.Actions).updateOne(
      {
        "source.id": id,
        type: type,
      },
      {
        $set: {
          deletedAt: new Date(),
          updatedAt: new Date(),
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
          updatedAt: new Date(),
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
          updatedAt: new Date(),
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
          updatedAt: new Date(),
        },
      },
    );
  };

  incrementEngagement = async (
    contentId: string,
    type: string,
    decrement = false,
  ) => {
    this.getCollection(MongoCollection.Content).updateOne(
      {
        contentId,
      },
      {
        $inc: {
          [`engagement.${type}`]: decrement ? -1 : 1,
        },
        $set: {
          updatedAt: new Date(),
        },
      },
    );
  };

  incrementTip = async (
    contentId: string,
    targetContentId: string,
    amount: number,
    decrement = false,
  ) => {
    this.getCollection(MongoCollection.Content).updateOne(
      {
        contentId: targetContentId,
      },
      {
        $inc: {
          [`tips.${contentId}.amount`]: decrement ? -amount : amount,
          [`tips.${contentId}.count`]: decrement ? -1 : 1,
        },
      },
    );
  };
}
