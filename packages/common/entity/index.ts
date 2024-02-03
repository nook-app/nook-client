import { ObjectId } from "mongodb";
import { MongoClient, MongoCollection } from "../mongo";
import { Entity } from "../types/entity";

export const getOrCreateEntitiesForFids = async (
  client: MongoClient,
  fids: string[],
) => {
  const collection = client.getCollection<Entity>(MongoCollection.Entity);
  const existingEntities = await collection
    .find({
      "farcaster.fid": {
        $in: fids,
      },
    })
    .toArray();

  const entities = existingEntities.reduce(
    (acc, entity) => {
      acc[entity.farcaster.fid] = entity;
      return acc;
    },
    {} as Record<string, Entity>,
  );

  const existingFids = new Set(Object.keys(entities));
  const missingFids = fids.filter((fid) => !existingFids.has(fid));

  if (missingFids.length > 0) {
    const { users } = await getFarcasterUsers(missingFids);
    const newEntities = missingFids.map((fid, i) => ({
      ...users[i],
      _id: new ObjectId(),
      createdAt: new Date(),
    }));
    await collection.insertMany(newEntities);
    for (const entity of newEntities) {
      entities[entity.farcaster.fid] = entity;
    }
  }

  return entities;
};

const getFarcasterUsers = async (fids: string[]) => {
  if (!fids?.length) return [];

  const response = await fetch(`${process.env.FARCASTER_SERVICE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fids,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed getting cast with ${response.status} for ${fids}`);
  }

  return await response.json();
};
