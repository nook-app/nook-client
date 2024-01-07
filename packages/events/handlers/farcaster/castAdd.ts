import { UserEvent, EventAction, EventActionType } from "@flink/common/types";
import {
  transformCastAddToPost,
  transformCastAddToReply,
} from "@flink/content/handlers/farcaster";
import { HandlerArgs } from "../../types";
import { MongoCollection } from "@flink/common/mongo";
import { ObjectId } from "mongodb";

export const handleCastAdd = async (args: HandlerArgs) => {
  if (args.rawEvent.data.parentHash) {
    return await transformCastAddToReplyEvent(args);
  }
  return await transformCastAddToPostEvent(args);
};

const transformCastAddToPostEvent = async ({
  client,
  rawEvent,
}: HandlerArgs) => {
  const content = await transformCastAddToPost(client, rawEvent.data);

  const eventId = new ObjectId();
  const actions: EventAction[] = [
    {
      _id: new ObjectId(),
      eventId,
      source: rawEvent.source,
      timestamp: rawEvent.timestamp,
      userId: content.data.userId,
      userIds: Array.from(
        new Set(
          [
            content.data.userId,
            content.data.rootParentUserId,
            ...content.data.mentions.map(({ userId }) => userId),
          ].filter(Boolean),
        ),
      ),
      contentIds: Array.from(
        new Set(
          [
            content.data.contentId,
            content.data.rootParentId,
            ...content.data.embeds,
            content.data.channelId,
          ].filter(Boolean),
        ),
      ),
      createdAt: content.createdAt,
      type: EventActionType.POST,
      data: content.data,
    },
  ];

  const event: UserEvent = {
    ...rawEvent,
    _id: eventId,
    userId: content.data.userId,
    actions: actions.map(({ _id }) => _id),
    createdAt: content.createdAt,
  };

  await Promise.all([client.upsertEvent(event), client.upsertActions(actions)]);
};

const transformCastAddToReplyEvent = async ({
  client,
  rawEvent,
}: HandlerArgs) => {
  const content = await transformCastAddToReply(client, rawEvent.data);

  const eventId = new ObjectId();
  const actions: EventAction[] = [
    {
      _id: new ObjectId(),
      eventId,
      source: rawEvent.source,
      timestamp: rawEvent.timestamp,
      userId: content.data.userId,
      userIds: [
        content.data.userId,
        content.data.rootParentUserId,
        content.data.parentUserId,
        ...content.data.mentions.map(({ userId }) => userId),
      ],
      contentIds: [
        content.data.contentId,
        content.data.rootParentId,
        content.data.parentId,
        ...content.data.embeds,
        content.data.channelId,
      ],
      createdAt: new Date(),
      type: EventActionType.REPLY,
      data: content.data,
    },
  ];

  const event: UserEvent = {
    ...rawEvent,
    _id: eventId,
    userId: content.data.userId,
    actions: actions.map(({ _id }) => _id),
    createdAt: content.createdAt,
  };

  const incrementReplyCount = async (contentId: string) => {
    const collection = client.getCollection(MongoCollection.Content);
    await collection.updateOne(
      { contentId },
      {
        $inc: { [`engagement.reply.${rawEvent.source.service}`]: 1 },
      },
    );
  };

  const incrementRootReplyCount = async (contentId: string) => {
    const collection = client.getCollection(MongoCollection.Content);
    await collection.updateOne(
      { contentId },
      {
        $inc: { [`engagement.rootReply.${rawEvent.source.service}`]: 1 },
      },
    );
  };

  await Promise.all([
    client.upsertEvent(event),
    client.upsertActions(actions),
    incrementReplyCount(content.data.parentId),
    incrementRootReplyCount(content.data.rootParentId),
  ]);
};
