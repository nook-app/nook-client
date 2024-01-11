import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterLinkData,
  RawEvent,
  UserEvent,
} from "@flink/common/types";
import { ObjectId } from "mongodb";
import { UserActionData } from "@flink/common/types/actionTypes";
import { MongoClient } from "@flink/common/mongo";

export const handleLinkAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterLinkData>,
) => {
  const isRemove = rawEvent.source.type === EventType.LINK_REMOVE;

  const fidToIdentity = await client.findOrInsertIdentities([
    rawEvent.data.fid,
    rawEvent.data.targetFid,
  ]);

  const userId = fidToIdentity[rawEvent.data.fid]._id;
  const targetUserId = fidToIdentity[rawEvent.data.targetFid]._id;

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

  return { event, actions };
};
