import {
  Db,
  MongoClient as Client,
  Collection,
  ObjectId,
  Document,
} from "mongodb";
import { Content, EntityEvent, Channel, Nook } from "../types";

const DB_NAME = "nook";

export enum MongoCollection {
  Content = "content",
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

  getContents = async (contentIds: string[]) => {
    const collection = this.getCollection<Content>(MongoCollection.Content);
    return await collection
      .find({
        contentId: {
          $in: contentIds,
        },
      })
      .toArray();
  };

  getChannels = async (channelIds: string[]) => {
    const collection = this.getCollection<Channel>(MongoCollection.Channels);
    return await collection
      .find({
        contentId: {
          $in: channelIds,
        },
      })
      .toArray();
  };

  getNook = async (nookId: string) => {
    const collection = this.getCollection<Nook>(MongoCollection.Nooks);
    return await collection.findOne({
      nookId,
    });
  };

  findContent = async (contentId: string) => {
    const collection = this.getCollection<Content>(MongoCollection.Content);
    return await collection.findOne({
      contentId,
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

  upsertContent = async (content: Content) => {
    const collection = this.getCollection<Content>(MongoCollection.Content);
    const _id = this.generateObjectIdFromDate(content.timestamp);
    try {
      await collection.insertOne({ ...content, _id });
      return _id;
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "MongoServerError" &&
        "code" in error &&
        error.code === 11000
      ) {
        const existingContent = await collection.findOneAndUpdate(
          {
            contentId: content.contentId,
          },
          {
            $set: {
              ...content,
              updatedAt: new Date(),
            },
          },
        );
        if (!existingContent) {
          throw new Error("Failed to find existing content");
        }
        return existingContent._id;
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

  deleteContent = async (contentId: string) => {
    this.getCollection(MongoCollection.Content).deleteOne({
      contentId,
    });
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

  searchChannels = async (query: string) => {
    const collection = this.getCollection<Channel>(MongoCollection.Channels);
    return await collection
      .find({
        $text: {
          $search: query,
        },
      })
      .toArray();
  };
}
