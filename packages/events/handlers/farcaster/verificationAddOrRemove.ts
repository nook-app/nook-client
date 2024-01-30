import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterLinkData,
  FarcasterVerificationData,
  FarcasterVerificationType,
  RawEvent,
  UserEvent,
  VerificationActionData,
  toFarcasterVerificationType,
} from "@flink/common/types";
import { MongoClient } from "@flink/common/mongo";
import { sdk } from "@flink/sdk";
import { ObjectId } from "mongodb";
import { bufferToHexAddress } from "@flink/farcaster/utils";

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
  const fidToIdentity = await sdk.identity.getFidIdentityMap([
    rawEvent.data.fid,
  ]);
  const userId = fidToIdentity[rawEvent.data.fid].id;
  const type: FarcasterVerificationType = toFarcasterVerificationType(
    rawEvent.data.verificationType,
  );

  const action: EventAction<VerificationActionData> = {
    _id: new ObjectId(),
    eventId: rawEvent.eventId,
    source: rawEvent.source,
    timestamp: rawEvent.timestamp,
    userId,
    userIds: [userId],
    contentIds: [],
    createdAt: new Date(),
    type: EventActionType.VERIFICATION_ADD_ETH_ADDRESS,
    data: {
      userId,
      address: bufferToHexAddress(rawEvent.data.address),
      type,
    },
  };

  const event: UserEvent<FarcasterVerificationData> = {
    ...rawEvent,
    userId,
    actions: [action._id],
    createdAt: action.createdAt,
  };

  await Promise.all([
    client.upsertEvent(event),
    client.upsertActions([action]),
  ]);
};
export const handleVerificationRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterVerificationData>,
) => {
  const fidToIdentity = await sdk.identity.getFidIdentityMap([
    rawEvent.data.fid,
  ]);
  const userId = fidToIdentity[rawEvent.data.fid].id;

  const action: EventAction<VerificationActionData> = {
    _id: new ObjectId(),
    eventId: rawEvent.eventId,
    source: rawEvent.source,
    timestamp: rawEvent.timestamp,
    userId,
    userIds: [userId],
    contentIds: [],
    createdAt: new Date(),
    type: EventActionType.VERIFICATION_REMOVE,
    data: {
      userId,
      address: bufferToHexAddress(rawEvent.data.address),
    },
  };

  const event: UserEvent<FarcasterVerificationData> = {
    ...rawEvent,
    userId,
    actions: [action._id],
    createdAt: action.createdAt,
  };

  await Promise.all([
    client.upsertEvent(event),
    client.upsertActions([action]),
  ]);
};
