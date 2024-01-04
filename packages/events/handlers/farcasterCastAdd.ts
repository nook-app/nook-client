import {
  RawEvent,
  EventAction,
  EventActionType,
  FarcasterPostData,
  Topic,
  TopicType,
  FarcasterReplyData,
  Content,
  ContentType,
  ContentBase,
} from "@flink/common/types";
import { generateFarcasterContent } from "@flink/common/farcaster";

export const handleFarcasterCastAdd = async (rawEvent: RawEvent) => {
  const data = await generateFarcasterContent(rawEvent.data);

  const actions: EventAction[] = [];
  const content: Content[] = [];

  const action = {
    eventId: rawEvent.eventId,
    source: rawEvent.source,
    timestamp: rawEvent.timestamp,
    userId: data.userId,
    topics: generateTopics(data),
    userIds: [
      data.userId,
      data.rootParentUserId,
      ...("parentUserId" in data && data.parentUserId
        ? [data.parentUserId]
        : []),
      ...data.mentions.map(({ userId }) => userId),
    ],
    contentIds: [
      data.contentId,
      data.rootParentId,
      ...("parentId" in data && data.parentId ? [data.parentId] : []),
      ...data.embeds,
      data.channelId,
    ],
    createdAt: new Date(),
  };

  const additionalContent: ContentBase[] = [
    {
      contentId: data.rootParentId,
      submitterId: data.rootParentUserId,
      createdAt: action.createdAt,
    },
    ...data.embeds.map((embedId) => ({
      contentId: embedId,
      submitterId: data.userId,
      createdAt: action.createdAt,
    })),
  ];

  if ("parentId" in data) {
    actions.push({
      ...action,
      type: EventActionType.REPLY,
      data,
    });
    content.push({
      contentId: data.contentId,
      type: ContentType.FARCASTER_REPLY,
      submitterId: data.userId,
      data,
      createdAt: action.createdAt,
    });
    additionalContent.push({
      contentId: data.parentId,
      submitterId: data.parentUserId,
      createdAt: action.createdAt,
    });
  } else {
    actions.push({
      ...action,
      type: EventActionType.POST,
      data,
    });
    content.push({
      contentId: data.contentId,
      type: ContentType.FARCASTER_POST,
      submitterId: data.userId,
      data,
      createdAt: action.createdAt,
    });
  }

  return {
    userId: action.userId,
    actions,
    content,
    additionalContent,
    createdAt: action.createdAt,
  };
};

const generateTopics = (
  data: FarcasterPostData | FarcasterReplyData,
): Topic[] => {
  const topics: Topic[] = [
    {
      type: TopicType.USER,
      id: data.userId,
    },
    {
      type: TopicType.ROOT_PARENT,
      id: data.rootParentId,
    },
    {
      type: TopicType.ROOT_PARENT_USER,
      id: data.rootParentUserId,
    },
    ...data.mentions.map(({ userId }) => ({
      type: TopicType.MENTION,
      id: userId,
    })),
    ...data.embeds.map((embedId) => ({
      type: TopicType.EMBED,
      id: embedId,
    })),
  ];

  if ("parentId" in data) {
    topics.push({
      type: TopicType.PARENT,
      id: data.parentId,
    });
    topics.push({
      type: TopicType.PARENT_USER,
      id: data.parentUserId,
    });
  }

  if (data.channelId) {
    topics.push({
      type: TopicType.CHANNEL,
      id: data.channelId,
    });
  }

  return topics;
};
