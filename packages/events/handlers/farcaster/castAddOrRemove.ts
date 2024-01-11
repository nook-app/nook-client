import {
  UserEvent,
  EventAction,
  EventActionType,
  FarcasterCastData,
  RawEvent,
  EventType,
  PostActionData,
} from "@flink/common/types";
import { MongoClient } from "@flink/common/mongo";
import { ObjectId } from "mongodb";
import { getFarcasterPostByData } from "@flink/common/utils";
import { toFarcasterURI } from "@flink/farcaster/utils";

export const handleCastAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastData>,
) => {
  const data = await getFarcasterPostByData(client, rawEvent.data);

  let type: EventActionType;
  if (data.parentId) {
    type =
      rawEvent.source.type === EventType.CAST_ADD
        ? EventActionType.REPLY
        : EventActionType.UNREPLY;
  } else {
    type =
      rawEvent.source.type === EventType.CAST_ADD
        ? EventActionType.POST
        : EventActionType.UNPOST;
  }

  const contentId = toFarcasterURI(rawEvent.data);
  const actions: EventAction<PostActionData>[] = [
    {
      _id: new ObjectId(),
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      timestamp: rawEvent.timestamp,
      userId: data.userId,
      userIds: Array.from(
        new Set([
          data.userId,
          data.parentUserId,
          data.rootParentUserId,
          ...data.mentions.map(({ userId }) => userId),
        ]),
      ).filter(Boolean),
      contentIds: Array.from(
        new Set([
          contentId,
          data.rootParentId,
          data.parentId,
          ...data.embeds,
          data.channelId,
        ]),
      ).filter(Boolean),
      createdAt: new Date(),
      type,
      data: {
        userId: data.userId,
        contentId,
        content: data,
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
    userId: data.userId,
    actions: actions.map(({ _id }) => _id),
    createdAt: new Date(),
  };

  return { event, actions };
};
