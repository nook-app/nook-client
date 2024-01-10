import { MongoClient, MongoCollection } from "@flink/common/mongo";
import {
  Content,
  EventAction,
  EventActionType,
  EventType,
  FarcasterCastReactionData,
  FarcasterReactionType,
  PostActionData,
  PostData,
  RawEvent,
  UserEvent,
} from "@flink/common/types";
import { ObjectId } from "mongodb";
import { sdk } from "@flink/sdk";
import { toFarcasterURI } from "@flink/farcaster/utils";
import { getOrCreateFarcasterPostOrReplyByContentId } from "@flink/content/handlers/farcaster";

export const handleCastReactionAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastReactionData>,
) => {
  if (rawEvent.source.type === EventType.CAST_REACTION_ADD) {
    await handleCastReactionAdd(client, rawEvent);
  } else if (rawEvent.source.type === EventType.CAST_REACTION_REMOVE) {
    await handleCastReactionRemove(client, rawEvent);
  }
};

export const handleCastReactionAdd = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastReactionData>,
) => {
  const contentId = toFarcasterURI({
    fid: rawEvent.data.targetFid,
    hash: rawEvent.data.targetHash,
  });

  const { content, created } = await getOrCreateFarcasterPostOrReplyByContentId(
    client,
    contentId,
  );

  const type =
    rawEvent.data.reactionType === FarcasterReactionType.LIKE
      ? EventActionType.LIKE
      : EventActionType.REPOST;

  const identities = await sdk.identity.getFidIdentityMap([rawEvent.data.fid]);

  const userId = identities[rawEvent.data.fid].id;
  const action = formatReactionAction(rawEvent, content, type, userId);

  const event: UserEvent<FarcasterCastReactionData> = {
    ...rawEvent,
    userId,
    actions: [action._id],
    createdAt: content.createdAt,
  };

  await Promise.all([
    client.upsertActions([action]),
    client.upsertEvent(event),
  ]);

  if (!created) {
    await updateEngagement(client, contentId, type);
  }
};

export const handleCastReactionRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastReactionData>,
) => {
  const contentId = toFarcasterURI({
    fid: rawEvent.data.targetFid,
    hash: rawEvent.data.targetHash,
  });

  const { content, created } = await getOrCreateFarcasterPostOrReplyByContentId(
    client,
    contentId,
  );

  const type =
    rawEvent.data.reactionType === FarcasterReactionType.LIKE
      ? EventActionType.UNLIKE
      : EventActionType.UNREPOST;

  const identities = await sdk.identity.getFidIdentityMap([rawEvent.data.fid]);

  const userId = identities[rawEvent.data.fid].id;
  const action = formatReactionAction(rawEvent, content, type, userId);

  const event: UserEvent<FarcasterCastReactionData> = {
    ...rawEvent,
    userId,
    actions: [action._id],
    createdAt: content.createdAt,
  };

  await Promise.all([
    client.upsertActions([action]),
    client.upsertEvent(event),
    void client.getCollection(MongoCollection.Actions).updateOne(
      {
        "source.id": rawEvent.source.id,
      },
      {
        $set: {
          deletedAt: new Date(),
        },
      },
    ),
  ]);

  if (!created) {
    await updateEngagement(client, contentId, type);
  }
};

const formatReactionAction = (
  rawEvent: RawEvent<FarcasterCastReactionData>,
  content: Content<PostData>,
  type: EventActionType,
  userId: string,
): EventAction<PostActionData> => {
  return {
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
    type,
    data: {
      userId: content.data.userId,
      contentId: content.contentId,
      content: content.data,
    },
    deletedAt: [EventActionType.UNPOST, EventActionType.UNREPLY].includes(type)
      ? new Date()
      : undefined,
  };
};

const updateEngagement = async (
  client: MongoClient,
  contentId: string,
  type: EventActionType,
) => {
  let $inc: Record<string, number> = {};
  if (type === EventActionType.LIKE) {
    $inc = {
      "engagement.likes": 1,
    };
  } else if (type === EventActionType.UNLIKE) {
    $inc = {
      "engagement.likes": -1,
    };
  } else if (type === EventActionType.REPOST) {
    $inc = {
      "engagement.reposts": 1,
    };
  } else if (type === EventActionType.UNREPOST) {
    $inc = {
      "engagement.reposts": -1,
    };
  }

  if (!$inc) return;

  await client
    .getCollection(MongoCollection.Content)
    .updateOne({ contentId }, { $inc });
};
