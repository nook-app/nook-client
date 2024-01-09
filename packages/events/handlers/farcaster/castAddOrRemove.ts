import {
  UserEvent,
  EventAction,
  EventActionType,
  FarcasterCastData,
  RawEvent,
  EventActionData,
  EventType,
  PostData,
} from "@flink/common/types";
import { transformCastToPost } from "@flink/content/handlers/farcaster";
import { MongoClient } from "@flink/common/mongo";
import { ObjectId } from "mongodb";

export const handleCastAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastData>,
) => {
  await transformCastAddToPostEvent(client, rawEvent);
};

const transformCastAddToPostEvent = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastData>,
) => {
  const content = await transformCastToPost(client, rawEvent.data);

  const actions: EventAction<PostData>[] = [
    {
      _id: new ObjectId(),
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      timestamp: rawEvent.timestamp,
      userId: content.data.userId,
      userIds: content.userIds,
      contentIds: [
        content.data.contentId,
        content.data.rootParentId,
        content.data.parentId,
        ...content.data.embeds,
        content.data.channelId,
      ].filter(Boolean),
      createdAt: new Date(),
      type:
        rawEvent.source.type === EventType.CAST_REMOVE
          ? content.data.parentId
            ? EventActionType.UNREPLY
            : EventActionType.UNPOST
          : content.data.parentId
            ? EventActionType.REPLY
            : EventActionType.POST,
      data: content.data,
      deletedAt:
        rawEvent.source.type === EventType.CAST_REMOVE ? new Date() : undefined,
    },
  ];

  const event: UserEvent<FarcasterCastData> = {
    ...rawEvent,
    userId: content.data.userId,
    actions: actions.map(({ _id }) => _id),
    createdAt: content.createdAt,
  };

  await Promise.all([client.upsertEvent(event), client.upsertActions(actions)]);

  await client.refreshEngagement(content.data.contentId);
};
