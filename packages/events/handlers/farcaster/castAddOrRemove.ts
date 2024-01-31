import {
  EntityEvent,
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
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      timestamp: rawEvent.timestamp,
      entityId: data.entityId,
      entityIds: Array.from(
        new Set([
          data.entityId,
          data.parentEntityId,
          data.rootParentEntityId,
          ...data.mentions.map(({ entityId }) => entityId),
        ]),
      ).filter(Boolean) as ObjectId[],
      contentIds: Array.from(
        new Set([
          contentId,
          data.rootParentId,
          data.parentId,
          ...data.embeds,
          data.channelId,
        ]),
      ).filter(Boolean) as string[],
      createdAt: new Date(),
      type,
      data: {
        entityId: data.entityId,
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

  const event: EntityEvent<FarcasterCastData> = {
    ...rawEvent,
    entityId: data.entityId,
    createdAt: new Date(),
  };

  return { event, actions };
};
