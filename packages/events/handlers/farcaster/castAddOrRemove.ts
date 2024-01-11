import {
  UserEvent,
  EventAction,
  EventActionType,
  FarcasterCastData,
  RawEvent,
  EventType,
  PostActionData,
  ContentType,
} from "@flink/common/types";
import { MongoClient } from "@flink/common/mongo";
import { ObjectId } from "mongodb";
import { getFarcasterPostOrReplyByData } from "@flink/content/utils";

export const handleCastAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastData>,
) => {
  const { content } = await getFarcasterPostOrReplyByData(
    client,
    rawEvent.data,
  );

  let type: EventActionType;
  if (content.type === ContentType.POST) {
    type =
      rawEvent.source.type === EventType.CAST_ADD
        ? EventActionType.POST
        : EventActionType.UNPOST;
  } else {
    type =
      rawEvent.source.type === EventType.CAST_ADD
        ? EventActionType.REPLY
        : EventActionType.UNREPLY;
  }

  const actions: EventAction<PostActionData>[] = [
    {
      _id: new ObjectId(),
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      timestamp: rawEvent.timestamp,
      userId: content.data.userId,
      userIds: content.userIds,
      contentIds: [
        content.contentId,
        content.data.rootParentId,
        content.data.parentId,
        ...content.data.embeds,
        content.data.channelId,
      ].filter(Boolean),
      createdAt: new Date(),
      type,
      data: {
        userId: content.data.userId,
        contentId: content.contentId,
        content: content.data,
      },
      deletedAt: [EventActionType.UNPOST, EventActionType.UNREPLY].includes(
        type,
      )
        ? new Date()
        : undefined,
    },
  ];

  const event: UserEvent<FarcasterCastData> = {
    ...rawEvent,
    userId: content.data.userId,
    actions: actions.map(({ _id }) => _id),
    createdAt: content.createdAt,
  };

  return { event, actions };
};
