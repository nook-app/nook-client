import { MongoClient } from "@flink/common/mongo";
import {
  EntityEvent,
  EventAction,
  EventActionType,
  FarcasterUserDataAddData,
  RawEvent,
  UpdateEntityInfoActionData,
  EntityInfoType,
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
  let entityDataType: EntityInfoType | undefined;
  switch (rawEvent.data.type) {
    case 1:
      entityDataType = EntityInfoType.PFP;
      break;
    case 2:
      entityDataType = EntityInfoType.DISPLAY;
      break;
    case 3:
      entityDataType = EntityInfoType.BIO;
      break;
    case 5:
      entityDataType = EntityInfoType.URL;
      break;
    case 6:
      entityDataType = EntityInfoType.USERNAME;
      break;
    default:
      throw new Error(`Unknown entity data type: ${rawEvent.data.type}`);
  }

  const action: EventAction<UpdateEntityInfoActionData> = {
    eventId: rawEvent.eventId,
    source: rawEvent.source,
    timestamp: new Date(rawEvent.timestamp),
    entityId,
    referencedEntityIds: [entityId],
    referencedContentIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
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
    updatedAt: action.updatedAt,
  };

  return {
    event,
    actions: [action],
    content: [],
  };
};
