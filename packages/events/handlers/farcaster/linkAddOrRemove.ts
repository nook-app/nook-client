import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterLinkData,
  RawEvent,
  EntityEvent,
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

  const fidToIdentity = await getOrCreateEntitiesForFids(client, [
    rawEvent.data.fid,
    rawEvent.data.targetFid,
  ]);

  const entityId = fidToIdentity[rawEvent.data.fid]._id;
  const targetEntityId = fidToIdentity[rawEvent.data.targetFid]._id;

  const actions: EventAction<EntityActionData>[] = [
    {
      _id: new ObjectId(),
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
    },
  ];

  const event: EntityEvent<FarcasterLinkData> = {
    ...rawEvent,
    entityId,
    actions: actions.map(({ _id }) => _id),
    createdAt: actions[0].createdAt,
  };

  return { event, actions };
};
