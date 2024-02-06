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
import { toFarcasterURI } from "@flink/farcaster/utils";
import { getOrCreatePostContentFromData } from "../../utils/farcaster";

export const handleCastAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastData>,
) => {
  const content = await getOrCreatePostContentFromData(client, rawEvent.data);

  let type: EventActionType;
  if (content.data.parentId) {
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
      timestamp: new Date(rawEvent.timestamp),
      entityId: content.data.entityId,
      entityIds: Array.from(
        new Set([
          content.data.entityId,
          content.data.parentEntityId,
          content.data.rootParentEntityId,
          ...content.data.mentions.map(({ entityId }) => entityId),
        ]),
      ).filter(Boolean) as ObjectId[],
      contentIds: Array.from(
        new Set([
          contentId,
          content.data.rootParentId,
          content.data.parentId,
          ...content.data.embeds,
          content.data.channelId,
        ]),
      ).filter(Boolean) as string[],
      createdAt: new Date(),
      type,
      data: {
        entityId: content.data.entityId,
        contentId,
        content: content.data,
      },
      deletedAt: [EventActionType.UNPOST, EventActionType.UNREPLY].includes(
        type,
      )
        ? new Date()
        : undefined,
      topics: content.topics,
    },
  ];

  const event: EntityEvent<FarcasterCastData> = {
    ...rawEvent,
    entityId: content.data.entityId,
    timestamp: new Date(rawEvent.timestamp),
    createdAt: new Date(),
  };

  return { event, actions };
};
