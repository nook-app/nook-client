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

const DEFAULT_CREATOR_ID = "65d6d628bcf8dea3200bb9c3";

export const getDefaultEntityNook = (entity: Entity): Nook => {
  const date = new Date();
  const type = NookType.Entity;
  const nookId = `${type}:${entity._id.toString()}`;
  const name =
    entity.farcaster.displayName ||
    entity.farcaster.username ||
    entity.farcaster.fid ||
    "Home";
  const description = entity.farcaster.bio || "Your personal space";
  const image = entity.farcaster.pfp || "";
  const slug = `@${entity.farcaster.username || entity.farcaster.fid}`;
  return {
    _id: new ObjectId(),
    type,
    nookId,
    name,
    description,
    image,
    slug,
    shelves: [
      {
        name: "New posts",
        slug: "new",
        description: `by ${slug}`,
        panels: [
          {
            name: "Posts",
            slug: "posts",
            type: NookPanelType.ContentFeed,
            args: {
              filter: {
                type: ContentType.POST,
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
                topics: {
                  type: TopicType.SOURCE_ENTITY,
                  value: entity._id.toString(),
                },
              },
            },
          },
        ],
      },
      {
        name: "Top posts",
        slug: "top",
        description: `by ${slug}`,
        panels: [
          {
            name: "All time",
            slug: "all",
            type: NookPanelType.ContentFeed,
            args: {
              filter: {
                type: ContentType.POST,
                topics: {
                  type: TopicType.SOURCE_ENTITY,
                  value: entity._id.toString(),
                },
              },
              sort: "engagement.likes",
            },
          },
        ],
      },
    ],
    createdAt: date,
    updatedAt: date,
    creatorId: DEFAULT_CREATOR_ID,
  };
};

export const getDefaultChannelNook = (channel: Channel): Nook => {
  const date = new Date();
  const type = NookType.Channel;
  const nookId = `${type}:${channel.contentId}`;
  const name = channel.name;
  const description = channel.description;
  const image = channel.imageUrl;
  const slug = `f/${channel.slug}`;

  return {
    _id: new ObjectId(),
    type,
    nookId,
    name,
    description,
    image,
    slug,
    shelves: [
      {
        name: "New & Trending",
        slug: "trending",
        description: `Hot posts in ${slug}`,
        panels: [
          {
            name: "New",
            slug: "new",
            type: NookPanelType.ContentFeed,
            args: {
              filter: {
                type: ContentType.POST,
                topics: {
                  type: TopicType.CHANNEL,
                  value: channel.contentId,
                },
              },
            },
          },
        ],
      },
      {
        name: "Top posts",
        slug: "top",
        description: `Popular posts in ${slug}`,
        panels: [
          {
            name: "All time",
            slug: "all",
            type: NookPanelType.ContentFeed,
            args: {
              filter: {
                type: ContentType.POST,
                topics: {
                  type: TopicType.CHANNEL,
                  value: channel.contentId,
                },
              },
              sort: "engagement.likes",
            },
          },
        ],
      },
    ],
    createdAt: date,
    updatedAt: date,
    creatorId: DEFAULT_CREATOR_ID,
  };
};
