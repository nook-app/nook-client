import { MongoClient } from "@flink/common/mongo";
import {
  ContentEngagementType,
  EventAction,
  EventActionData,
  EventActionType,
  EventType,
  FarcasterCastReactionData,
  FarcasterReactionType,
  RawEvent,
  UserEvent,
} from "@flink/common/types";
import { ObjectId } from "mongodb";
import { sdk } from "@flink/sdk";
import { toFarcasterURI } from "@flink/farcaster/utils";

export const handleCastReactionAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastReactionData>,
) => {
  let eventActionType: EventActionType | undefined;

  const isRemove = [
    EventType.CAST_REACTION_REMOVE,
    EventType.URL_REACTION_REMOVE,
  ].includes(rawEvent.source.type);

  if (rawEvent.data.reactionType === FarcasterReactionType.LIKE) {
    eventActionType = isRemove ? EventActionType.UNLIKE : EventActionType.LIKE;
  } else if (rawEvent.data.reactionType === FarcasterReactionType.RECAST) {
    eventActionType = isRemove
      ? EventActionType.UNREPOST
      : EventActionType.REPOST;
  }

  if (!eventActionType) {
    throw new Error(
      `[events] [${rawEvent.source.service}] [${rawEvent.source.type}] unknown reaction type`,
    );
  }

  const identities = await sdk.identity.getForFids([rawEvent.data.fid]);

  const eventId = new ObjectId();
  const userId = identities[0].id;
  const contentId = toFarcasterURI({
    fid: rawEvent.data.targetFid,
    hash: rawEvent.data.targetHash,
  });
  const actions: EventAction<EventActionData>[] = [
    {
      _id: new ObjectId(),
      eventId,
      source: rawEvent.source,
      timestamp: rawEvent.timestamp,
      userId,
      userIds: [userId],
      contentIds: [contentId],
      createdAt: new Date(),
      type: eventActionType,
      data: {
        userId,
        contentId,
      },
    },
  ];

  const event: UserEvent<FarcasterCastReactionData> = {
    ...rawEvent,
    _id: eventId,
    userId,
    actions: actions.map(({ _id }) => _id),
    createdAt: actions[0].createdAt,
  };

  const isLike = [EventActionType.LIKE, EventActionType.UNLIKE].includes(
    eventActionType,
  );

  const incrementFn = [
    EventActionType.UNLIKE,
    EventActionType.UNREPOST,
  ].includes(eventActionType)
    ? client.decrementEngagement
    : client.incrementEngagement;

  await Promise.all([
    client.upsertEvent(event),
    client.upsertActions(actions),
    incrementFn(
      contentId,
      isLike ? ContentEngagementType.LIKES : ContentEngagementType.REPOSTS,
      event.source.service,
    ),
  ]);
};
