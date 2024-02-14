import { MongoClient } from "@flink/common/mongo";
import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterCastReactionData,
  FarcasterReactionType,
  RawEvent,
  EntityEvent,
  PostData,
  Topic,
  TopicType,
  ContentActionData,
} from "@flink/common/types";
import { ObjectId } from "mongodb";
import { toFarcasterURI } from "@flink/farcaster/utils";
import { getOrCreateEntitiesForFids } from "@flink/common/entity";
import { getOrCreatePostContent } from "../../utils/farcaster";

export const handleCastReactionAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastReactionData>,
) => {
  const contentId = toFarcasterURI({
    fid: rawEvent.data.targetFid,
    hash: rawEvent.data.targetHash,
  });

  const content = await getOrCreatePostContent(client, contentId);
  if (!content) return;

  let type: EventActionType;
  if (rawEvent.data.reactionType === FarcasterReactionType.LIKE) {
    type =
      rawEvent.source.type === EventType.CAST_REACTION_ADD
        ? EventActionType.LIKE
        : EventActionType.UNLIKE;
  } else if (rawEvent.data.reactionType === FarcasterReactionType.RECAST) {
    type =
      rawEvent.source.type === EventType.CAST_REACTION_ADD
        ? EventActionType.REPOST
        : EventActionType.UNREPOST;
  } else {
    throw Error(`Unsupported reaction type: ${rawEvent.data.reactionType}`);
  }

  const identities = await getOrCreateEntitiesForFids(client, [
    rawEvent.data.fid,
  ]);
  const entityId = identities[rawEvent.data.fid]._id;

  const actions: EventAction<ContentActionData>[] = [
    {
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      timestamp: new Date(rawEvent.timestamp),
      entityId,
      referencedEntityIds: Array.from(
        new Set([entityId, ...content.referencedEntityIds]),
      ).filter(Boolean) as ObjectId[],
      referencedContentIds: content.referencedContentIds,
      createdAt: new Date(),
      updatedAt: new Date(),
      type,
      data: {
        entityId: content.data.entityId,
        contentId,
      },
      deletedAt: [EventActionType.UNPOST, EventActionType.UNREPLY].includes(
        type,
      )
        ? new Date()
        : undefined,
      topics: generateTopics(entityId, content.data),
    },
  ];

  const event: EntityEvent<FarcasterCastReactionData> = {
    ...rawEvent,
    entityId,
    timestamp: new Date(rawEvent.timestamp),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return { event, actions, content: [content] };
};

const generateTopics = (entityId: ObjectId, data: PostData) => {
  const topics: Topic[] = [
    {
      type: TopicType.SOURCE_ENTITY,
      value: entityId.toString(),
    },
    {
      type: TopicType.TARGET_ENTITY,
      value: data.entityId.toString(),
    },
    {
      type: TopicType.TARGET_CONTENT,
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
      type: TopicType.TARGET_TAG,
      value: mention.entityId.toString(),
    });
  }

  for (const embed of data.embeds) {
    topics.push({
      type: TopicType.TARGET_EMBED,
      value: embed,
    });
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
