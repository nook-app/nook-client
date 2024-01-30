import { MongoClient, MongoCollection } from "@flink/common/mongo";
import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterLinkData,
  FarcasterUserDataAddData,
  RawEvent,
  UserDataType,
  UserEvent,
  toUserDataType,
} from "@flink/common/types";
import { UserDataType as FarcasterUserDataType } from "@farcaster/hub-nodejs";
import { ObjectId } from "mongodb";
import { sdk } from "@flink/sdk";
import { Identity } from "@flink/identity/types";
import {
  UserActionData,
  UserDataActionData,
} from "@flink/common/types/actionTypes";

export const handleUserDataAdd = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterUserDataAddData>,
) => {
  const fidToIdentity = await sdk.identity.getFidIdentityMap([
    rawEvent.data.fid,
  ]);
  const userId = fidToIdentity[rawEvent.data.fid].id;
  const type: UserDataType = toUserDataType(rawEvent.data.type);

  const action: EventAction<UserDataActionData> = {
    _id: new ObjectId(),
    eventId: rawEvent.eventId,
    source: rawEvent.source,
    timestamp: rawEvent.timestamp,
    userId,
    userIds: [userId],
    contentIds: [],
    createdAt: new Date(),
    type: EventActionType.USER_DATA_ADD,
    data: {
      userId,
      userDataType: type,
      userData: rawEvent.data.value,
    },
  };

  const event: UserEvent<FarcasterUserDataAddData> = {
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
