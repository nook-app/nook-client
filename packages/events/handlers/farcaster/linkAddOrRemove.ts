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
import { UserActionData } from "@flink/common/types/actionTypes";

export const handleLinkAddOrRemove = async (
  rawEvent: RawEvent<FarcasterLinkData>,
) => {
  const isRemove = rawEvent.source.type === EventType.LINK_REMOVE;

  const fidToIdentity = await sdk.identity.getFidIdentityMap([
    rawEvent.data.fid,
    rawEvent.data.targetFid,
  ]);

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

  return { event, actions };
};
