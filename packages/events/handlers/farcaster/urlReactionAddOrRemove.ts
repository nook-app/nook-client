import { MongoClient } from "@flink/common/mongo";
import {
  ContentEngagementType,
  EventAction,
  EventActionData,
  EventActionType,
  EventType,
  FarcasterReactionType,
  FarcasterUrlReactionData,
  RawEvent,
  UserEvent,
} from "@flink/common/types";
import { ObjectId } from "mongodb";
import { sdk } from "@flink/sdk";

export const handleUrlReactionAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterUrlReactionData>,
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
  const actions: EventAction<EventActionData>[] = [
    {
      _id: new ObjectId(),
      eventId,
      source: rawEvent.source,
      timestamp: rawEvent.timestamp,
      userId,
      userIds: [userId],
      contentIds: [rawEvent.data.url],
      createdAt: new Date(),
      type: eventActionType,
      data: {
        userId,
        contentId: rawEvent.data.url,
      },
    },
  ];

  const event: UserEvent<FarcasterUrlReactionData> = {
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
      rawEvent.data.url,
      isLike ? ContentEngagementType.LIKES : ContentEngagementType.REPOSTS,
      event.source.service,
    ),
  ]);
};
