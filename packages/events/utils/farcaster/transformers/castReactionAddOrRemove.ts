import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterCastReactionData,
  RawEvent,
  EntityEvent,
  PostData,
  Topic,
  TopicType,
  ContentActionData,
  Content,
  Entity,
} from "@nook/common/types";

export const transformCastReactionAddOrRemove = (
  rawEvent: RawEvent<FarcasterCastReactionData>,
  entities: Record<string, Entity>,
  contentId: string,
  content?: Content<PostData>,
) => {
  let type: EventActionType;
  switch (rawEvent.data.reactionType) {
    case 1:
      type =
        rawEvent.source.type === EventType.CAST_REACTION_ADD
          ? EventActionType.LIKE
          : EventActionType.UNLIKE;
      break;
    case 2:
      type =
        rawEvent.source.type === EventType.CAST_REACTION_ADD
          ? EventActionType.REPOST
          : EventActionType.UNREPOST;
      break;
    default:
      throw new Error(
        `Unsupported reaction type: ${rawEvent.data.reactionType}`,
      );
  }

  const entityId = entities[rawEvent.data.fid]._id.toString();

  const actions: EventAction<ContentActionData>[] = [
    {
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      timestamp: new Date(rawEvent.timestamp),
      entityId,
      referencedEntityIds: Array.from(
        new Set([entityId, ...(content?.referencedEntityIds || [])]),
      ).filter(Boolean) as string[],
      referencedContentIds: content?.referencedContentIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      type,
      data: {
        entityId,
        contentId,
      },
      deletedAt: [EventActionType.UNPOST, EventActionType.UNREPLY].includes(
        type,
      )
        ? new Date()
        : undefined,
      topics: content
        ? generateTopics(entityId, content.data)
        : [
            {
              type: TopicType.SOURCE_ENTITY,
              value: entityId.toString(),
            },
          ],
    },
  ];

  const event: EntityEvent<FarcasterCastReactionData> = {
    ...rawEvent,
    entityId,
    timestamp: new Date(rawEvent.timestamp),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return { event, actions };
};

const generateTopics = (entityId: string, data: PostData) => {
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
