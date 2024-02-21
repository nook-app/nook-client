import {
  EntityEvent,
  EventAction,
  EventActionType,
  FarcasterUserDataAddData,
  RawEvent,
  UpdateEntityInfoActionData,
  EntityInfoType,
  TopicType,
  Entity,
} from "@nook/common/types";

export const transformUserDataAddEvent = async (
  rawEvent: RawEvent<FarcasterUserDataAddData>,
  entities: Record<string, Entity>,
) => {
  const entityId = entities[rawEvent.data.fid]._id;

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
