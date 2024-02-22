import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterUrlReactionData,
  RawEvent,
  EntityEvent,
  TopicType,
  Entity,
} from "@nook/common/types";
import { ContentActionData } from "@nook/common/types/actionTypes";

export const transformUrlReactionAddOrRemove = (
  rawEvent: RawEvent<FarcasterUrlReactionData>,
  entities: Record<string, Entity>,
) => {
  const isRemove = [
    EventType.CAST_REACTION_REMOVE,
    EventType.URL_REACTION_REMOVE,
  ].includes(rawEvent.source.type);

  let type: EventActionType;
  switch (rawEvent.data.reactionType) {
    case 1:
      type = isRemove ? EventActionType.UNLIKE : EventActionType.LIKE;
      break;
    case 2:
      type = isRemove ? EventActionType.UNREPOST : EventActionType.REPOST;
      break;
    default:
      throw new Error(
        `Unsupported reaction type: ${rawEvent.data.reactionType}`,
      );
  }

  const entityId = entities[rawEvent.data.fid]._id.toString();
  const contentId = rawEvent.data.url;
  const actions: EventAction<ContentActionData>[] = [
    {
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      timestamp: new Date(rawEvent.timestamp),
      entityId,
      referencedEntityIds: [entityId],
      referencedContentIds: [contentId],
      createdAt: new Date(),
      updatedAt: new Date(),
      type,
      data: {
        entityId,
        contentId,
      },
      deletedAt: isRemove ? new Date() : undefined,
      topics: [
        {
          type: TopicType.SOURCE_ENTITY,
          value: entityId.toString(),
        },
        {
          type: TopicType.TARGET_CONTENT,
          value: contentId,
        },
      ],
    },
  ];

  const event: EntityEvent<FarcasterUrlReactionData> = {
    ...rawEvent,
    entityId,
    timestamp: new Date(rawEvent.timestamp),
    createdAt: actions[0].createdAt,
    updatedAt: actions[0].updatedAt,
  };

  return { event, actions };
};
