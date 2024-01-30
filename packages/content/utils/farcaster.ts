import { MongoClient } from "@flink/common/mongo";
import { handlePostRelations } from "@flink/common/relations";
import { Content, ContentType, PostData } from "@flink/common/types";
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

  const content: Content<PostData> = {
    contentId,
    submitterId: data.entityId,
    createdAt: new Date(),
    timestamp: new Date(data.timestamp),
    type: data.parentId ? ContentType.REPLY : ContentType.POST,
    data,
    entityIds: getEntityIds(data),
  };

  await client.upsertContent(content);

  return await handlePostRelations(contentId, data);
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
