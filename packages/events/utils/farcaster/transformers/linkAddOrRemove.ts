import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterLinkData,
  RawEvent,
  EntityEvent,
  TopicType,
  Entity,
} from "@nook/common/types";
import { EntityActionData } from "@nook/common/types/actionTypes";

export const transformLinkAddOrRemove = (
  rawEvent: RawEvent<FarcasterLinkData>,
  entities: Record<string, Entity>,
) => {
  const isRemove = rawEvent.source.type === EventType.LINK_REMOVE;

  const entityId = entities[rawEvent.data.fid]._id.toString();
  const targetEntityId = entities[rawEvent.data.targetFid]._id.toString();

  const actions: EventAction<EntityActionData>[] = [
    {
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      timestamp: new Date(rawEvent.timestamp),
      entityId,
      referencedEntityIds: [entityId, targetEntityId],
      referencedContentIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      type: isRemove ? EventActionType.UNFOLLOW : EventActionType.FOLLOW,
      data: {
        entityId,
        targetEntityId,
        sourceUserId: rawEvent.data.fid,
        sourceTargetUserId: rawEvent.data.targetFid,
      },
      deletedAt: isRemove ? new Date() : undefined,
      topics: [
        {
          type: TopicType.SOURCE_ENTITY,
          value: entityId.toString(),
        },
        {
          type: TopicType.TARGET_ENTITY,
          value: targetEntityId.toString(),
        },
      ],
    },
  ];

  const event: EntityEvent<FarcasterLinkData> = {
    ...rawEvent,
    entityId,
    timestamp: new Date(rawEvent.timestamp),
    createdAt: actions[0].createdAt,
    updatedAt: actions[0].updatedAt,
  };

  return { event, actions };
};
