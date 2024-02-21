import { MongoClient, MongoCollection } from "@nook/common/mongo";
import {
  Channel,
  ContentType,
  Entity,
  Nook,
  NookPanelType,
  NookType,
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
    _id: new ObjectId(),
    nookId: `${NookType.Entity}:${entity._id.toString()}`,
    type: NookType.Entity,
    name:
      entity.farcaster.displayName ||
      entity.farcaster.username ||
      entity.farcaster.fid ||
      "Home",
    description: entity.farcaster.bio || "Your personal space",
    image: entity.farcaster.pfp || "",
    slug: `@${entity.farcaster.username || entity.farcaster.fid}`,
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
    creatorId: "65d003330f2e60b1c360d9a3",
  };
};

export const createChannelNook = async (
  client: MongoClient,
  channel: Channel,
) => {
  const nook = getDefaultChannelNook(channel);
  await client.getCollection<Nook>(MongoCollection.Nooks).insertOne(nook);
  return nook;
};

export const getDefaultChannelNook = (channel: Channel): Nook => {
  const date = new Date();
  return {
    _id: new ObjectId(),
    nookId: `${NookType.Channel}:${channel.contentId}`,
    type: NookType.Channel,
    name: channel.name,
    description: channel.description,
    image: channel.imageUrl,
    slug: `f/${channel.slug}`,
    shelves: [
      {
        name: "Posts",
        slug: "posts",
        description: "Posts in this channel",
        panels: [
          {
            name: "New",
            slug: "new",
            type: NookPanelType.ContentFeed,
            args: {
              filter: {
                type: ContentType.POST,
                deletedAt: null,
                topics: {
                  type: TopicType.CHANNEL,
                  value: channel.contentId,
                },
              },
            },
          },
          {
            name: "Top",
            slug: "top",
            type: NookPanelType.ContentFeed,
            args: {
              filter: {
                type: ContentType.POST,
                deletedAt: null,
                topics: {
                  type: TopicType.CHANNEL,
                  value: channel.contentId,
                },
                sort: "engagement.likes",
                sortDirection: -1,
              },
            },
          },
        ],
      },
    ],
    createdAt: date,
    updatedAt: date,
    creatorId: "65d003330f2e60b1c360d9a3",
  };
};
