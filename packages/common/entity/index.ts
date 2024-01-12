import { ObjectId } from "mongodb";
import { MongoClient, MongoCollection } from "../mongo";
import { Entity } from "../types/entity";
import { sdk } from "@flink/sdk";

export const getOrCreateEntitiesForFids = async (
  client: MongoClient,
  fids: string[],
) => {
  const collection = client.getCollection<Entity>(MongoCollection.Entity);
  const existingEntities = await collection
    .find({
      farcasterAccounts: {
        $elemMatch: {
          id: {
            $in: fids,
          },
        },
      },
    })
    .toArray();

  const entities = existingEntities.reduce(
    (acc, entity) => {
      for (const account of entity.farcasterAccounts) {
        acc[account.id] = entity;
      }
      return acc;
    },
    {} as Record<string, Entity>,
  );

  const existingFids = new Set(Object.keys(entities));
  const missingFids = fids.filter((fid) => !existingFids.has(fid));

  if (missingFids.length > 0) {
    const users = await sdk.farcaster.getUsers(missingFids);
    const newEntities = missingFids.map((fid, i) => ({
      _id: new ObjectId(),
      farcasterAccounts: [
        {
          id: fid,
          metadata: users[i],
          following: 0,
          followers: 0,
        },
      ],
      createdAt: new Date(),
    }));
    await collection.insertMany(newEntities);
    for (const entity of newEntities) {
      entities[entity.farcasterAccounts[0].id] = entity;
    }
  }

  return entities;
};
