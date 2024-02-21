import { ObjectId } from "mongodb";
import { MongoClient, MongoCollection } from "../mongo";
import { BlockchainAccount, Entity, FarcasterAccount } from "../types/entity";
import { UsernameType } from "../types";

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
  const missingDataFids = Object.values(entities)
    .filter(
      (entity) =>
        !entity.farcaster.username ||
        !entity.farcaster.displayName ||
        !entity.farcaster.pfp ||
        !entity.farcaster.bio,
    )
    .map((entity) => entity.farcaster.fid);

  if (missingFids.length > 0) {
    const data = await getFarcasterUsers(missingFids);
    if (data) {
      const newEntities: Entity[] = missingFids.map((fid, i) => {
        const usernames = [];

        const username = data.users[i].farcaster.username;
        if (username) {
          usernames.push({
            type: username.endsWith(".eth")
              ? UsernameType.ENS
              : UsernameType.FNAME,
            username,
          });
        }

        return {
          ...data.users[i],
          usernames,
          _id: new ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
      await collection.insertMany(newEntities);
      for (const entity of newEntities) {
        entities[entity.farcaster.fid] = entity;
      }
    }
  }

  if (missingDataFids.length > 0) {
    const data = await getFarcasterUsers(missingDataFids);
    if (data) {
      for (const user of data.users) {
        const entity = entities[user.farcaster.fid];
        entity.farcaster = user.farcaster;
        entity.blockchain = user.blockchain;

        const usernames = [];

        const username = user.farcaster.username;
        if (username) {
          usernames.push({
            type: username.endsWith(".eth")
              ? UsernameType.ENS
              : UsernameType.FNAME,
            username,
          });
        }

        await collection.updateOne(
          {
            _id: entity._id,
          },
          {
            $set: {
              farcaster: user.farcaster,
              blockchain: user.blockchain,
            },
            $addToSet: {
              usernames: {
                $each: usernames,
              },
            },
          },
        );
      }
    }
  }

  return entities;
};

const getFarcasterUsers = async (fids: string[]) => {
  if (!fids?.length) return;

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
    throw new Error(`Failed getting user with ${response.status} for ${fids}`);
  }

  return (await response.json()) as {
    users: {
      farcaster: FarcasterAccount;
      blockchain: BlockchainAccount[];
    }[];
  };
};
