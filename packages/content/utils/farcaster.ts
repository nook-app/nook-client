import { MongoClient, MongoCollection } from "@flink/common/mongo";
import {
  ContentEngagement,
  ContentType,
  EventActionType,
} from "@flink/common/types";
import { handlePostRelations } from "@flink/common/relations";
import { Content, PostData } from "@flink/common/types";
import { ObjectId } from "mongodb";

export const insertPostContent = async (
  client: MongoClient,
  contentId: string,
  data: PostData,
) => {
  const existingContent = await client.findContent(contentId);
  if (existingContent) {
    return existingContent;
  }

  const [content] = await Promise.all([
    insertPostContentWithEngagement(client, contentId, data),
    handlePostRelations(contentId, data),
  ]);

  return content;
};

const insertPostContentWithEngagement = async (
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

  await client.upsertContent(content);

  return content;
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
