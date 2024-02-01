import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterLinkData,
  RawEvent,
  EntityEvent,
  TopicType,
} from "@flink/common/types";
import { ObjectId } from "mongodb";
import { EntityActionData } from "@flink/common/types/actionTypes";
import { MongoClient } from "@flink/common/mongo";
import { getOrCreateEntitiesForFids } from "@flink/common/entity";

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
      timestamp: rawEvent.timestamp,
      entityId,
      entityIds: [entityId, targetEntityId],
      contentIds: [],
      createdAt: new Date(),
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
    createdAt: actions[0].createdAt,
  };

  return { event, actions };
};
