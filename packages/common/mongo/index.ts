import { Db, MongoClient as Client, Collection, ObjectId } from "mongodb";
import {
  Content,
  ContentData,
  ContentEngagementType,
  EventAction,
  EventActionData,
  UserEvent,
} from "../types";
import { Identity, IdentitySocialPlatform } from "../types/identity";

const DB_NAME = "flink";

export enum MongoCollection {
  Events = "events",
  Actions = "actions",
  Content = "content",
  Identity = "identity",
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

  findOrInsertIdentities = async (fids: string[]) => {
    const collection = this.getCollection<Identity>(MongoCollection.Identity);
    const existingIdentities = await collection
      .find({
        socialAccounts: {
          $elemMatch: {
            platform: "FARCASTER",
            id: {
              $in: fids,
            },
          },
        },
      })
      .toArray();

    const identities = existingIdentities.reduce(
      (acc, identity) => {
        for (const account of identity.socialAccounts) {
          if (account.platform !== "FARCASTER") {
            continue;
          }
          acc[account.id] = identity;
        }
        return acc;
      },
      {} as Record<string, Identity>,
    );

    const existingFids = new Set(Object.keys(identities));
    const missingFids = fids.filter((fid) => !existingFids.has(fid));

    if (missingFids.length > 0) {
      const newIdentities = missingFids.map((fid) => ({
        _id: new ObjectId(),
        socialAccounts: [
          {
            platform: IdentitySocialPlatform.FARCASTER,
            id: fid,
            following: 0,
            followers: 0,
          },
        ],
        createdAt: new Date(),
      }));
      await collection.insertMany(newIdentities);
      for (const identity of newIdentities) {
        identities[identity.socialAccounts[0].id] = identity;
      }
    }

    return identities;
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

  insertContent = async (content: Content<ContentData>) => {
    const collection = this.getCollection<Content<ContentData>>(
      MongoCollection.Content,
    );
    await collection.insertOne(content);
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

  upsertAction = async (action: EventAction<EventActionData>) => {
    const collection = this.getCollection<EventAction<EventActionData>>(
      MongoCollection.Actions,
    );
    const updateResult = await collection.updateOne(
      {
        eventId: action.eventId,
        type: action.type,
      },
      {
        $set: action,
      },
      {
        upsert: true,
      },
    );
    return updateResult.upsertedCount > 0;
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

  incrementEngagement = async (
    contentId: string,
    engagementType: ContentEngagementType,
    decrement = false,
  ) => {
    const collection = this.getCollection(MongoCollection.Content);
    await collection.updateOne(
      {
        contentId,
      },
      {
        $inc: {
          [`engagement.${engagementType}`]: decrement ? -1 : 1,
        },
      },
    );
  };
}
