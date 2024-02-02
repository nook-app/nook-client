import { MongoClient } from "@flink/common/mongo";
import { Content, ContentType, PostData } from "@flink/common/types";

export const getOrCreatePostContent = async (
  client: MongoClient,
  data: PostData,
) => {
  const existingContent = await client.findContent(data.contentId);
  if (existingContent) {
    return existingContent;
  }

  const entityIds = [data.entityId];

  if (data.rootParentEntityId && !entityIds.includes(data.rootParentEntityId)) {
    entityIds.push(data.rootParentEntityId);
  }

  if (data.parentEntityId && !entityIds.includes(data.parentEntityId)) {
    entityIds.push(data.parentEntityId);
  }

  for (const { entityId } of data.mentions) {
    if (!entityIds.includes(entityId)) {
      entityIds.push(entityId);
    }
  }

  const content: Content<PostData> = {
    contentId: data.contentId,
    submitterId: data.entityId,
    createdAt: new Date(),
    timestamp: new Date(data.timestamp),
    type: data.parentId ? ContentType.REPLY : ContentType.POST,
    data,
    entityIds,
  };

  await client.upsertContent(content);

  return content;
};
