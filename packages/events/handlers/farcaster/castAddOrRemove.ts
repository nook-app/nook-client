import {
  UserEvent,
  EventAction,
  EventActionType,
  FarcasterCastData,
  RawEvent,
  EventType,
  PostActionData,
  ContentEngagementType,
  ContentType,
  Content,
  PostData,
} from "@flink/common/types";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import { ObjectId } from "mongodb";
import { getOrCreateFarcasterPostOrReplyByData } from "@flink/content/handlers/farcaster";

export const handleCastAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastData>,
) => {
  if (rawEvent.source.type === EventType.CAST_ADD) {
    if (rawEvent.data.parentHash) {
      await handleCastAddReply(client, rawEvent);
    }
    await handleCastAddPost(client, rawEvent);
  } else if (rawEvent.source.type === EventType.CAST_REMOVE) {
    await handleCastRemove(client, rawEvent);
  }
};

export const handleCastAddPost = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastData>,
) => {
  const { content } = await getOrCreateFarcasterPostOrReplyByData(
    client,
    rawEvent.data,
  );

  const action = formatPostAction(rawEvent, content, EventActionType.POST);

  const event: UserEvent<FarcasterCastData> = {
    ...rawEvent,
    userId: content.data.userId,
    actions: [action._id],
    createdAt: content.createdAt,
  };

  await Promise.all([
    client.upsertEvent(event),
    client.upsertActions([action]),
  ]);
};

export const handleCastAddReply = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastData>,
) => {
  const { content, created } = await getOrCreateFarcasterPostOrReplyByData(
    client,
    rawEvent.data,
  );

  const action = formatPostAction(rawEvent, content, EventActionType.REPLY);

  const event: UserEvent<FarcasterCastData> = {
    ...rawEvent,
    userId: content.data.userId,
    actions: [action._id],
    createdAt: content.createdAt,
  };

  await Promise.all([
    client.upsertEvent(event),
    client.upsertActions([action]),
  ]);

  if (!created) {
    await Promise.all([
      updateEngagement(
        client,
        content.data.parentId,
        ContentEngagementType.REPLIES,
        1,
      ),
      updateEngagement(
        client,
        content.data.rootParentId,
        ContentEngagementType.ROOT_REPLIES,
        1,
      ),
    ]);
  }
};

export const handleCastRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastData>,
) => {
  const { content, created } = await getOrCreateFarcasterPostOrReplyByData(
    client,
    rawEvent.data,
  );

  const type =
    content.type === ContentType.REPLY
      ? EventActionType.UNREPLY
      : EventActionType.UNPOST;

  const action = formatPostAction(rawEvent, content, type);

  const event: UserEvent<FarcasterCastData> = {
    ...rawEvent,
    userId: content.data.userId,
    actions: [action._id],
    createdAt: content.createdAt,
  };

  await Promise.all([
    client.upsertEvent(event),
    client.upsertActions([action]),
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

  if (!created && type === EventActionType.UNREPLY) {
    await Promise.all([
      void updateEngagement(
        client,
        content.data.parentId,
        ContentEngagementType.REPLIES,
        -1,
      ),
      void updateEngagement(
        client,
        content.data.rootParentId,
        ContentEngagementType.ROOT_REPLIES,
        -1,
      ),
    ]);
  }
};

const formatPostAction = (
  rawEvent: RawEvent<FarcasterCastData>,
  content: Content<PostData>,
  type: EventActionType,
): EventAction<PostActionData> => {
  return {
    _id: new ObjectId(),
    eventId: rawEvent.eventId,
    source: rawEvent.source,
    timestamp: rawEvent.timestamp,
    userId: content.data.userId,
    userIds: content.userIds,
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
  engagementType: ContentEngagementType,
  increment: number,
) => {
  await client.getCollection(MongoCollection.Content).updateOne(
    { contentId },
    {
      $inc: {
        [`data.engagement.${engagementType}`]: increment,
      },
    },
  );
};
