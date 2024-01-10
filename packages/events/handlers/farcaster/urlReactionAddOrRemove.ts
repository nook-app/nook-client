import { MongoClient, MongoCollection } from "@flink/common/mongo";
import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterReactionType,
  FarcasterUrlReactionData,
  RawEvent,
  UserEvent,
} from "@flink/common/types";
import { ObjectId } from "mongodb";
import { sdk } from "@flink/sdk";
import { publishContentRequest } from "@flink/common/queues";
import { ContentActionData } from "@flink/common/types/actionTypes";

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

  const fidToIdentity = await sdk.identity.getFidIdentityMap([
    rawEvent.data.fid,
  ]);

  const userId = fidToIdentity[rawEvent.data.fid].id;
  const contentId = rawEvent.data.url;
  const actions: EventAction<ContentActionData>[] = [
    {
      _id: new ObjectId(),
      eventId: rawEvent.eventId,
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
      deletedAt: isRemove ? new Date() : undefined,
    },
  ];

  const event: UserEvent<FarcasterUrlReactionData> = {
    ...rawEvent,
    userId,
    actions: actions.map(({ _id }) => _id),
    createdAt: actions[0].createdAt,
  };

  const promises = [
    client.upsertEvent(event),
    client.upsertActions(actions),
    publishContentRequest({
      submitterId: userId,
      contentId,
    }),
    updateEngagement(client, contentId, eventActionType),
  ];

  if (isRemove) {
    promises.push(
      void client.getCollection(MongoCollection.Actions).updateOne(
        {
          "source.id": rawEvent.source.id,
          type:
            eventActionType === EventActionType.UNLIKE
              ? EventActionType.LIKE
              : EventActionType.REPOST,
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

const updateEngagement = async (
  client: MongoClient,
  contentId: string,
  type: EventActionType,
) => {
  let $inc: Record<string, number> = {};
  if (type === EventActionType.LIKE) {
    $inc = {
      "data.engagement.likes": 1,
    };
  } else if (type === EventActionType.UNLIKE) {
    $inc = {
      "data.engagement.likes": -1,
    };
  } else if (type === EventActionType.REPOST) {
    $inc = {
      "data.engagement.reposts": 1,
    };
  } else if (type === EventActionType.UNREPOST) {
    $inc = {
      "data.engagement.reposts": -1,
    };
  }

  if (!$inc) return;

  await client
    .getCollection(MongoCollection.Content)
    .updateOne({ contentId }, { $inc });
};
