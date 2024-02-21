import { MongoClient } from "@nook/common/mongo";
import {
  EntityEvent,
  EventAction,
  EventActionType,
  RawEvent,
  TopicType,
  FarcasterUsernameProofData,
  EntityUsernameData,
  UsernameType,
} from "@nook/common/types";
import { getOrCreateEntitiesForFids } from "@nook/common/entity";

export const handleUsernameProofAdd = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterUsernameProofData>,
) => {
  const fidToIdentity = await getOrCreateEntitiesForFids(client, [
    rawEvent.data.fid,
  ]);
  const entityId = fidToIdentity[rawEvent.data.fid]._id;

  let usernameType: UsernameType;
  switch (rawEvent.data.type) {
    case 1:
      usernameType = UsernameType.FNAME;
      break;
    case 2:
      usernameType = UsernameType.ENS;
      break;
    default:
      throw new Error(`Unsupported username type: ${rawEvent.data.type}`);
  }

  const action: EventAction<EntityUsernameData> = {
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
      username: rawEvent.data.username,
      usernameType,
      owner: rawEvent.data.owner,
    },
    topics: [
      {
        type: TopicType.SOURCE_ENTITY,
        value: entityId.toString(),
      },
    ],
  };

  const event: EntityEvent<FarcasterUsernameProofData> = {
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
