import { MongoClient } from "@flink/common/mongo";
import {
  EntityEvent,
  EventAction,
  EventActionType,
  FarcasterUserDataAddData,
  RawEvent,
  UpdateEntityInfoActionData,
  EntityInfoType,
  toUserDataType,
} from "@flink/common/types";
import { getOrCreateEntitiesForFids } from "@flink/common/entity";

export const handleUserDataAdd = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterUserDataAddData>,
) => {
  const fidToIdentity = await getOrCreateEntitiesForFids(client, [
    rawEvent.data.fid,
  ]);
  const entityId = fidToIdentity[rawEvent.data.fid]._id;

  const action: EventAction<UpdateEntityInfoActionData> = {
    eventId: rawEvent.eventId,
    source: rawEvent.source,
    timestamp: rawEvent.timestamp,
    entityId,
    entityIds: [entityId],
    contentIds: [],
    createdAt: new Date(),
    type: EventActionType.UPDATE_USER_INFO,
    data: {
      sourceEntityId: rawEvent.data.fid,
      entityId,
      entityDataType: Object.values(EntityInfoType).find(
        (t) => t.toString() === rawEvent.data.type.toString(),
      ),
      entityData: rawEvent.data.value,
    },
  };

  const event: EntityEvent<FarcasterUserDataAddData> = {
    ...rawEvent,
    entityId,
    createdAt: action.createdAt,
  };

  return {
    event,
    actions: [action],
  };
};
