import {
  Chain,
  EntityEvent,
  EventAction,
  EventActionType,
  EventType,
  FarcasterVerificationData,
  LinkBlockchainAddressActionData,
  RawEvent,
} from "@flink/common/types";
import { MongoClient } from "@flink/common/mongo";
import { bufferToHexAddress } from "@flink/farcaster/utils";
import { getOrCreateEntitiesForFids } from "@flink/common/entity";

export async function handleVerificationAddOrRemove(
  client: MongoClient,
  rawEvent: RawEvent<FarcasterVerificationData>,
) {
  if (rawEvent.source.type === EventType.VERIFICATION_ADD_ETH_ADDRESS) {
    await handleVerificationAdd(client, rawEvent);
  } else {
    await handleVerificationRemove(client, rawEvent);
  }
}

export const handleVerificationAdd = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterVerificationData>,
) => {
  const fidToIdentity = await getOrCreateEntitiesForFids(client, [
    rawEvent.data.fid,
  ]);
  const entityId = fidToIdentity[rawEvent.data.fid]._id;
  const action: EventAction<LinkBlockchainAddressActionData> = {
    eventId: rawEvent.eventId,
    source: rawEvent.source,
    timestamp: rawEvent.timestamp,
    entityId,
    entityIds: [entityId],
    contentIds: [],
    createdAt: new Date(),
    type: EventActionType.LINK_BLOCKCHAIN_ADDRESS,
    data: {
      sourceEntityId: rawEvent.data.fid,
      entityId,
      address: bufferToHexAddress(rawEvent.data.address),
      isContract: rawEvent.data.verificationType === 1,
      chain: Chain.ETHEREUM,
    },
  };

  const event: EntityEvent<FarcasterVerificationData> = {
    ...rawEvent,
    entityId,
    createdAt: action.createdAt,
  };

  return {
    event,
    actions: [action],
  };
};

export const handleVerificationRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterVerificationData>,
) => {
  const fidToIdentity = await getOrCreateEntitiesForFids(client, [
    rawEvent.data.fid,
  ]);
  const entityId = fidToIdentity[rawEvent.data.fid]._id;

  const action: EventAction<LinkBlockchainAddressActionData> = {
    eventId: rawEvent.eventId,
    source: rawEvent.source,
    timestamp: rawEvent.timestamp,
    entityId,
    entityIds: [entityId],
    contentIds: [],
    createdAt: new Date(),
    type: EventActionType.UNLINK_BLOCKCHAIN_ADDRESS,
    data: {
      sourceEntityId: rawEvent.data.fid,
      entityId,
      address: bufferToHexAddress(rawEvent.data.address),
      isContract: rawEvent.data.verificationType === 1,
      chain: Chain.ETHEREUM,
    },
  };

  const event: EntityEvent<FarcasterVerificationData> = {
    ...rawEvent,
    entityId,
    createdAt: action.createdAt,
  };

  return {
    event,
    actions: [action],
  };
};
