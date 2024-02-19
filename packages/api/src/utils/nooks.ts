import { MongoClient, MongoCollection } from "@nook/common/mongo";
import {
  ContentType,
  Entity,
  Nook,
  NookPanelType,
  TopicType,
} from "@nook/common/types";
import { ObjectId } from "mongodb";

export const getOrCreateEntityNook = async (
  client: MongoClient,
  entity: Entity,
) => {
  const nook = await client.getCollection<Nook>(MongoCollection.Nooks).findOne({
    nookId: `entity:${entity._id.toString()}`,
  });
  if (nook) return nook;
  return createEntityNook(client, entity);
};

export const createEntityNook = async (client: MongoClient, entity: Entity) => {
  const nook = getDefaultEntityNook(entity);
  await client.getCollection<Nook>(MongoCollection.Nooks).insertOne(nook);
  return nook;
};

export const getDefaultEntityNook = (entity: Entity): Nook => {
  const date = new Date();
  return {
    _id: entity._id,
    nookId: `entity:${entity._id.toString()}`,
    name:
      entity.farcaster.displayName ||
      entity.farcaster.username ||
      entity.farcaster.fid ||
      "Home",
    description: entity.farcaster.bio || "Your personal space",
    image: entity.farcaster.pfp || "",
    slug: entity._id.toString(),
    theme: "gray",
    shelves: [
      {
        name: "Posts",
        slug: "posts",
        description: `by ${
          entity.farcaster.displayName ||
          entity.farcaster.username ||
          entity.farcaster.fid
        }`,
        panels: [
          {
            name: "Posts",
            slug: "posts",
            type: NookPanelType.ContentFeed,
            args: {
              filter: {
                type: ContentType.POST,
                deletedAt: null,
                topics: {
                  type: TopicType.SOURCE_ENTITY,
                  value: entity._id.toString(),
                },
              },
            },
          },
          {
            name: "Replies",
            slug: "replies",
            type: NookPanelType.ContentFeed,
            args: {
              filter: {
                type: ContentType.REPLY,
                deletedAt: null,
                topics: {
                  type: TopicType.SOURCE_ENTITY,
                  value: entity._id.toString(),
                },
              },
            },
          },
        ],
      },
    ],
    createdAt: date,
    updatedAt: date,
    creatorId: new ObjectId("65d003330f2e60b1c360d9a3"),
  };
};
