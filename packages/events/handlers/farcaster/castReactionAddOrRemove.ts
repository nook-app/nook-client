import { MongoClient } from "@flink/common/mongo";
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
import { getFarcasterPostOrReplyByContentId } from "@flink/content/utils";

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

  const { content } = await getFarcasterPostOrReplyByContentId(
    client,
    contentId,
  );
  if (!content) return;

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
};

export const handleCastReactionRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastReactionData>,
) => {
  const contentId = toFarcasterURI({
    fid: rawEvent.data.targetFid,
    hash: rawEvent.data.targetHash,
  });

  const { content } = await getFarcasterPostOrReplyByContentId(
    client,
    contentId,
  );
  if (!content) return;

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
  ]);
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
