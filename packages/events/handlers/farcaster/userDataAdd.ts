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
  TopicType,
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

  // TODO: this is pretty fragile; should change or explicitly use the same enum
  const entityDataType = Object.values(EntityInfoType).find(
    (t) => t.toString().toUpperCase() === rawEvent.data.type.toString(),
  );
  if (!entityDataType) {
    throw new Error(`Unknown entity data type: ${rawEvent.data.type}`);
  }

  const action: EventAction<UpdateEntityInfoActionData> = {
    eventId: rawEvent.eventId,
    source: rawEvent.source,
    timestamp: new Date(rawEvent.timestamp),
    entityId,
    entityIds: [entityId],
    contentIds: [],
    createdAt: new Date(),
    type: EventActionType.UPDATE_USER_INFO,
    data: {
      sourceEntityId: rawEvent.data.fid,
      entityId,
      entityDataType: entityDataType,
      entityData: rawEvent.data.value,
    },
    topics: [
      {
        type: TopicType.SOURCE_ENTITY,
        value: entityId.toString(),
      },
    ],
  };

  const event: EntityEvent<FarcasterUserDataAddData> = {
    ...rawEvent,
    entityId,
    timestamp: new Date(rawEvent.timestamp),
    createdAt: action.createdAt,
  };

  return {
    event,
    actions: [action],
  };
};
