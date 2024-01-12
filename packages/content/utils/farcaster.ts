import { MongoClient, MongoCollection } from "@flink/common/mongo";
import {
  ContentEngagement,
  ContentType,
  EventActionType,
} from "@flink/common/types";
import { ContentRelation, PrismaClient } from "@flink/common/prisma/relations";
import { publishContentRequests } from "@flink/common/queues";
import {
  Content,
  ContentRelationType,
  PostData,
  EventService,
} from "@flink/common/types";
import { ObjectId } from "mongodb";

const prisma = new PrismaClient();

export const createPostContent = async (
  client: MongoClient,
  contentId: string,
  data: PostData,
) => {
  const relations = getContentRelations(contentId, data);
  const [content] = await Promise.all([
    insertContentWithEngagement(client, contentId, data),
    prisma.contentRelation.createMany({
      data: relations,
      skipDuplicates: true,
    }),
    publishContentRequests(relations.map((r) => ({ contentId: r.contentId }))),
  ]);

  return content;
};

const insertContentWithEngagement = async (
  client: MongoClient,
  contentId: string,
  data: PostData,
) => {
  const actions = client.getCollection(MongoCollection.Actions);

  const [replies, rootReplies, likes, reposts, embeds] = await Promise.all([
    actions.countDocuments({
      contentIds: contentId,
      type: EventActionType.REPLY,
      "data.content.parentId": contentId,
      deletedAt: null,
    }),
    actions.countDocuments({
      contentIds: contentId,
      type: EventActionType.REPLY,
      "data.content.rootParentId": contentId,
      deletedAt: null,
    }),
    actions.countDocuments({
      contentIds: contentId,
      type: EventActionType.LIKE,
      "data.contentId": contentId,
      deletedAt: null,
    }),
    actions.countDocuments({
      contentIds: contentId,
      type: EventActionType.REPOST,
      "data.contentId": contentId,
      deletedAt: null,
    }),
    actions.countDocuments({
      contentIds: contentId,
      type: { $in: [EventActionType.POST, EventActionType.REPLY] },
      "data.content.embeds": contentId,
      deletedAt: null,
    }),
  ]);

  const engagement: ContentEngagement = {
    replies,
    rootReplies,
    embeds,
    likes,
    reposts,
  };

  const content: Content<PostData> = {
    contentId,
    submitterId: data.entityId,
    createdAt: new Date(),
    timestamp: new Date(data.timestamp),
    type: data.parentId ? ContentType.REPLY : ContentType.POST,
    data,
    entityIds: getEntityIds(data),
    engagement,
  };

  await client.insertContent(content);

  return content;
};

const getContentRelations = (contentId: string, data: PostData) => {
  const relations: ContentRelation[] = data.embeds.map((embed) => ({
    contentId: embed,
    type: ContentRelationType.EMBED_OF,
    targetContentId: contentId,
    source: EventService.FARCASTER,
  }));

  relations.push({
    contentId: data.rootParentId,
    type: ContentRelationType.ROOT_PARENT_OF,
    targetContentId: contentId,
    source: EventService.FARCASTER,
  });

  if (data.parentId) {
    relations.push({
      contentId: data.parentId,
      type: ContentRelationType.PARENT_OF,
      targetContentId: contentId,
      source: EventService.FARCASTER,
    });
  }

  if (data.channelId) {
    relations.push({
      contentId: data.channelId,
      type: ContentRelationType.CHANNEL_OF,
      targetContentId: contentId,
      source: EventService.FARCASTER,
    });
  }

  return relations;
};

const getEntityIds = (post: PostData): ObjectId[] => {
  const entityIds = [post.entityId];

  if (post.rootParentEntityId && !entityIds.includes(post.rootParentEntityId)) {
    entityIds.push(post.rootParentEntityId);
  }

  if (post.parentEntityId && !entityIds.includes(post.parentEntityId)) {
    entityIds.push(post.parentEntityId);
  }

  for (const { entityId } of post.mentions) {
    if (!entityIds.includes(entityId)) {
      entityIds.push(entityId);
    }
  }

  return entityIds;
};
