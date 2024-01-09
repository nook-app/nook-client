import { MongoClient, MongoCollection } from "@flink/common/mongo";
import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterCastReactionData,
  FarcasterReactionType,
  PostActionData,
  RawEvent,
  UserEvent,
} from "@flink/common/types";
import { ObjectId } from "mongodb";
import { sdk } from "@flink/sdk";
import { toFarcasterURI } from "@flink/farcaster/utils";
import { Identity } from "@flink/identity/types";
import { getAndTransformCastToContent } from "@flink/content/handlers/farcaster";

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

  const fidToIdentity = identities.reduce(
    (acc, identity) => {
      acc[identity.socialAccounts[0].platformId] = identity;
      return acc;
    },
    {} as Record<string, Identity>,
  );

  const userId = fidToIdentity[rawEvent.data.fid].id;
  const contentId = toFarcasterURI({
    fid: rawEvent.data.targetFid,
    hash: rawEvent.data.targetHash,
  });

  const content = await getAndTransformCastToContent(client, contentId);

  const actions: EventAction<PostActionData>[] = [
    {
      _id: new ObjectId(),
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      timestamp: rawEvent.timestamp,
      userId,
      userIds: [userId, ...content.userIds],
      contentIds: [
        content.contentId,
        ...content.relations.map((relation) => relation.contentId),
      ],
      createdAt: new Date(),
      type: eventActionType,
      data: {
        userId,
        contentId: content.contentId,
        content: content.data,
      },
      deletedAt: isRemove ? new Date() : undefined,
    },
  ];

  const event: UserEvent<FarcasterCastReactionData> = {
    ...rawEvent,
    userId,
    actions: actions.map(({ _id }) => _id),
    createdAt: actions[0].createdAt,
  };

  const promises = [
    client.upsertEvent(event),
    client.upsertActions(actions),
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
