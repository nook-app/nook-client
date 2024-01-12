import { ObjectId } from "mongodb";
import { MongoClient, MongoCollection } from "../mongo";
import { Entity } from "../types/identity";
import { sdk } from "@flink/sdk";

export const getOrCreateEntitiesForFids = async (
  client: MongoClient,
  fids: string[],
) => {
  const collection = client.getCollection<Entity>(MongoCollection.Entity);
  const existingIdentities = await collection
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

  const identities = existingIdentities.reduce(
    (acc, identity) => {
      for (const account of identity.farcasterAccounts) {
        acc[account.id] = identity;
      }
      return acc;
    },
    {} as Record<string, Entity>,
  );

  const existingFids = new Set(Object.keys(identities));
  const missingFids = fids.filter((fid) => !existingFids.has(fid));

  if (missingFids.length > 0) {
    const users = await sdk.farcaster.getUsers(missingFids);
    const newIdentities = missingFids.map((fid, i) => ({
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
    await collection.insertMany(newIdentities);
    for (const identity of newIdentities) {
      identities[identity.farcasterAccounts[0].id] = identity;
    }
  }

  return identities;
};
