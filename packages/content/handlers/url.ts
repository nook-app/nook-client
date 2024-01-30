import { MongoClient } from "@flink/common/mongo";
import { ContentRequest, ContentType } from "@flink/common/types";
import { ObjectId } from "mongodb";

export const handleUrlContent = async (
  client: MongoClient,
  request: ContentRequest,
) => {
  const existingContent = await client.findContent(request.contentId);
  if (existingContent) {
    return existingContent;
  }

  await client.insertContent({
    contentId: request.contentId,
    submitterId: new ObjectId(request.submitterId),
    timestamp: new Date(request.timestamp),
    entityIds: [new ObjectId(request.submitterId)],
    createdAt: new Date(),
    type: ContentType.URL,
    data: undefined,
  });
};
