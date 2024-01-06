import {
  RawEvent,
  UserEvent,
  EventAction,
  EventActionType,
  ContentRequest,
} from "@flink/common/types";
import {
  transformCastAddToPost,
  transformCastAddToReply,
} from "@flink/content/handlers/farcaster";
import { ObjectId } from "mongodb";

export const transformCastAddToEvent = async (rawEvent: RawEvent) => {
  if (rawEvent.data.parentHash) {
    return await transformCastAddToReplyEvent(rawEvent);
  }
  return await transformCastAddToPostEvent(rawEvent);
};

const transformCastAddToPostEvent = async (rawEvent: RawEvent) => {
  const content = await transformCastAddToPost(rawEvent.data);

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

  return {
    event,
    actions,
    content: [content],
  };
};

export const transformCastAddToReplyEvent = async (rawEvent: RawEvent) => {
  const content = await transformCastAddToReply(rawEvent.data);

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

  return {
    event,
    actions,
    content: [content],
  };
};
