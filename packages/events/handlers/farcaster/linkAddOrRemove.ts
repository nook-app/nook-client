import { MongoClient, MongoCollection } from "@flink/common/mongo";
import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterLinkData,
  RawEvent,
  UserEvent,
} from "@flink/common/types";
import { ObjectId } from "mongodb";
import { sdk } from "@flink/sdk";
import { Identity } from "@flink/identity/types";
import { UserActionData } from "@flink/common/types/actionTypes";

export const handleLinkAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterLinkData>,
) => {
  const isRemove = rawEvent.source.type === EventType.LINK_REMOVE;

  const identities = await sdk.identity.getForFids([
    rawEvent.data.fid,
    rawEvent.data.targetFid,
  ]);

  const fidToIdentity = identities.reduce(
    (acc, identity) => {
      acc[identity.socialAccounts[0].platformId] = identity;
      return acc;
    },
    {} as Record<string, Identity>,
  );

  const userId = fidToIdentity[rawEvent.data.fid].id;
  const targetUserId = fidToIdentity[rawEvent.data.targetFid].id;

  const actions: EventAction<UserActionData>[] = [
    {
      _id: new ObjectId(),
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      timestamp: rawEvent.timestamp,
      userId,
      userIds: [userId, targetUserId],
      contentIds: [],
      createdAt: new Date(),
      type: isRemove ? EventActionType.UNFOLLOW : EventActionType.FOLLOW,
      data: {
        userId,
        targetUserId,
      },
      deletedAt: isRemove ? new Date() : undefined,
    },
  ];

  const event: UserEvent<FarcasterLinkData> = {
    ...rawEvent,
    userId,
    actions: actions.map(({ _id }) => _id),
    createdAt: actions[0].createdAt,
  };

  const promises = [client.upsertEvent(event), client.upsertActions(actions)];

  if (isRemove) {
    promises.push(
      void client.getCollection(MongoCollection.Actions).updateOne(
        {
          "source.id": rawEvent.source.id,
          type: EventActionType.FOLLOW,
        },
        {
          $set: {
            deletedAt: new Date(),
          },
        },
      ),
    );
  }

  await Promise.all(promises);
};
