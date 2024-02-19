import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterLinkData,
  RawEvent,
  EntityEvent,
  TopicType,
} from "@nook/common/types";
import { EntityActionData } from "@nook/common/types/actionTypes";
import { MongoClient } from "@nook/common/mongo";
import { getOrCreateEntitiesForFids } from "@nook/common/entity";

export const handleLinkAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterLinkData>,
) => {
  const isRemove = rawEvent.source.type === EventType.LINK_REMOVE;

  const fidToEntity = await getOrCreateEntitiesForFids(client, [
    rawEvent.data.fid,
    rawEvent.data.targetFid,
  ]);

  const entityId = fidToEntity[rawEvent.data.fid]._id;
  const targetEntityId = fidToEntity[rawEvent.data.targetFid]._id;

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
        sourceEntityId: rawEvent.data.fid,
        sourceTargetEntityId: rawEvent.data.targetFid,
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

  return { event, actions, content: [] };
};
