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
} from "@flink/common/types";
import { transformCastToPost } from "@flink/content/handlers/farcaster";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import { ObjectId } from "mongodb";

export const handleCastAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastData>,
) => {
  const content = await transformCastToPost(client, rawEvent.data);
  const isRemove = rawEvent.source.type === EventType.CAST_REMOVE;
  const isReply = content.type === ContentType.REPLY;

  const actions: EventAction<PostActionData>[] = [
    {
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
      type: isRemove
        ? isReply
          ? EventActionType.UNREPLY
          : EventActionType.UNPOST
        : isReply
          ? EventActionType.REPLY
          : EventActionType.POST,
      data: {
        userId: content.data.userId,
        contentId: content.contentId,
        content: content.data,
      },
      deletedAt: isRemove ? new Date() : undefined,
    },
  ];

  const event: UserEvent<FarcasterCastData> = {
    ...rawEvent,
    userId: content.data.userId,
    actions: actions.map(({ _id }) => _id),
    createdAt: content.createdAt,
  };

  const promises = [client.upsertEvent(event), client.upsertActions(actions)];

  if (isReply) {
    promises.push(
      updateEngagement(
        client,
        content.data.parentId,
        ContentEngagementType.REPLIES,
        isRemove ? -1 : 1,
      ),
      updateEngagement(
        client,
        content.data.rootParentId,
        ContentEngagementType.ROOT_REPLIES,
        isRemove ? -1 : 1,
      ),
    );
  }

  if (isRemove) {
    promises.push(
      void client.getCollection(MongoCollection.Actions).updateOne(
        {
          "source.id": rawEvent.source.id,
          type: isReply ? EventActionType.REPLY : EventActionType.POST,
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
