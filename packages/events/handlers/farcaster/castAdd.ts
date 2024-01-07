import {
  UserEvent,
  EventAction,
  EventActionType,
  FarcasterCastAddData,
  RawEvent,
  EventActionData,
  ContentEngagementType,
} from "@flink/common/types";
import {
  transformCastAddToPost,
  transformCastAddToReply,
} from "@flink/content/handlers/farcaster";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import { ObjectId } from "mongodb";

export const handleCastAdd = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastAddData>,
) => {
  if (rawEvent.data.parentHash) {
    return await transformCastAddToReplyEvent(client, rawEvent);
  }
  return await transformCastAddToPostEvent(client, rawEvent);
};

const transformCastAddToPostEvent = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastAddData>,
) => {
  const content = await transformCastAddToPost(client, rawEvent.data);

  const eventId = new ObjectId();
  const actions: EventAction<EventActionData>[] = [
    {
      _id: new ObjectId(),
      eventId,
      source: rawEvent.source,
      timestamp: rawEvent.timestamp,
      userId: content.data.userId,
      userIds: content.userIds,
      contentIds: Array.from(
        new Set(
          [
            content.data.contentId,
            content.data.rootParentId,
            ...content.data.embeds,
            content.data.channelId,
          ].filter(Boolean),
        ),
      ),
      createdAt: content.createdAt,
      type: EventActionType.POST,
      data: content.data,
    },
  ];

  const event: UserEvent<FarcasterCastAddData> = {
    ...rawEvent,
    _id: eventId,
    userId: content.data.userId,
    actions: actions.map(({ _id }) => _id),
    createdAt: content.createdAt,
  };

  await Promise.all([client.upsertEvent(event), client.upsertActions(actions)]);
};

const transformCastAddToReplyEvent = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastAddData>,
) => {
  const content = await transformCastAddToReply(client, rawEvent.data);

  const eventId = new ObjectId();
  const actions: EventAction<EventActionData>[] = [
    {
      _id: new ObjectId(),
      eventId,
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
      ],
      createdAt: new Date(),
      type: EventActionType.REPLY,
      data: content.data,
    },
  ];

  const event: UserEvent<FarcasterCastAddData> = {
    ...rawEvent,
    _id: eventId,
    userId: content.data.userId,
    actions: actions.map(({ _id }) => _id),
    createdAt: content.createdAt,
  };

  await Promise.all([
    client.upsertEvent(event),
    client.upsertActions(actions),
    client.incrementEngagement(
      content.data.parentId,
      ContentEngagementType.REPLIES,
      event.source.service,
    ),
    client.incrementEngagement(
      content.data.rootParentId,
      ContentEngagementType.ROOT_REPLIES,
      event.source.service,
    ),
  ]);
};
