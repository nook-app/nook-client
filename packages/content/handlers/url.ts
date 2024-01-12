import { MongoClient, MongoCollection } from "@flink/common/mongo";
import {
  ContentRequest,
  ContentType,
  EventActionType,
} from "@flink/common/types";
import { ObjectId } from "mongodb";

export const handleUrlContent = async (
  client: MongoClient,
  request: ContentRequest,
) => {
  const existingContent = await client.findContent(request.contentId);
  if (existingContent) {
    return existingContent;
  }

  const actions = client.getCollection(MongoCollection.Actions);
  const embeds = await actions.countDocuments({
    contentIds: request.contentId,
    type: { $in: [EventActionType.POST, EventActionType.REPLY] },
    "data.content.embeds": request.contentId,
    deletedAt: null,
  });

  await client.insertContent({
    contentId: request.contentId,
    submitterId: new ObjectId(request.submitterId),
    timestamp: new Date(request.timestamp),
    entityIds: [new ObjectId(request.submitterId)],
    createdAt: new Date(),
    type: ContentType.URL,
    engagement: {
      embeds,
    },
    data: undefined,
  });
};
