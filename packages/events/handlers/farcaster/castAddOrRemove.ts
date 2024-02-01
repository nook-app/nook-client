import {
  EntityEvent,
  EventAction,
  EventActionType,
  FarcasterCastData,
  RawEvent,
  EventType,
  PostActionData,
  Topic,
  PostData,
  TopicType,
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
      topics: generateTopics(data),
    },
  ];

  const event: EntityEvent<FarcasterCastData> = {
    ...rawEvent,
    entityId: data.entityId,
    createdAt: new Date(),
  };

  return { event, actions };
};

const generateTopics = (data: PostData) => {
  const topics: Topic[] = [
    {
      type: TopicType.SOURCE_ENTITY,
      value: data.entityId.toString(),
    },
    {
      type: TopicType.SOURCE_CONTENT,
      value: data.contentId,
    },
    {
      type: TopicType.ROOT_TARGET_ENTITY,
      value: data.rootParentEntityId.toString(),
    },
    {
      type: TopicType.ROOT_TARGET_CONTENT,
      value: data.rootParentId,
    },
  ];

  for (const mention of data.mentions) {
    topics.push({
      type: TopicType.SOURCE_TAG,
      value: mention.entityId.toString(),
    });
  }

  for (const embed of data.embeds) {
    topics.push({
      type: TopicType.SOURCE_EMBED,
      value: embed,
    });
  }

  if (data.parentId && data.parentEntityId) {
    topics.push({
      type: TopicType.TARGET_ENTITY,
      value: data.parentEntityId.toString(),
    });
    topics.push({
      type: TopicType.TARGET_CONTENT,
      value: data.parentId,
    });

    if (data.parent) {
      for (const mention of data.parent.mentions) {
        topics.push({
          type: TopicType.TARGET_TAG,
          value: mention.entityId.toString(),
        });
      }

      for (const embed of data.parent.embeds) {
        topics.push({
          type: TopicType.TARGET_EMBED,
          value: embed,
        });
      }
    }
  }

  if (data.rootParent) {
    for (const mention of data.rootParent.mentions) {
      topics.push({
        type: TopicType.ROOT_TARGET_TAG,
        value: mention.entityId.toString(),
      });
    }

    for (const embed of data.rootParent.embeds) {
      topics.push({
        type: TopicType.ROOT_TARGET_EMBED,
        value: embed,
      });
    }
  }

  if (data.channelId) {
    topics.push({
      type: TopicType.CHANNEL,
      value: data.channelId,
    });
  }

  return topics;
};
