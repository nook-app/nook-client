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
import {
  generateFarcasterReply,
  generateFarcasterPost,
} from "@flink/common/farcaster";

export const handleFarcasterCastAdd = async (rawEvent: RawEvent) => {
  if (rawEvent.data.parentHash) {
    return await handleCastReply(rawEvent);
  }
  return await handleCastPost(rawEvent);
};

const handleCastPost = async (rawEvent: RawEvent) => {
  const data = await generateFarcasterPost(rawEvent.data);

  const actions: EventAction[] = [];

  const action = {
    eventId: rawEvent.eventId,
    source: rawEvent.source,
    timestamp: rawEvent.timestamp,
    userId: data.userId,
    topics: generateTopics(data),
    userIds: Array.from(
      new Set(
        [
          data.userId,
          data.rootParentUserId,
          ...data.mentions.map(({ userId }) => userId),
        ].filter(Boolean),
      ),
    ),
    contentIds: Array.from(
      new Set(
        [
          data.contentId,
          data.rootParentId,
          ...data.embeds,
          data.channelId,
        ].filter(Boolean),
      ),
    ),
    createdAt: new Date(),
  };

  actions.push({
    ...action,
    type: EventActionType.POST,
    data,
  });

  const content: Content[] = [
    {
      contentId: data.contentId,
      type: ContentType.FARCASTER_POST,
      submitterId: data.userId,
      data,
      createdAt: action.createdAt,
    },
  ];

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

  return {
    userId: action.userId,
    actions,
    content,
    additionalContent,
    createdAt: action.createdAt,
  };
};

export const handleCastReply = async (rawEvent: RawEvent) => {
  const data = await generateFarcasterReply(rawEvent.data);

  const actions: EventAction[] = [];

  const action = {
    eventId: rawEvent.eventId,
    source: rawEvent.source,
    timestamp: rawEvent.timestamp,
    userId: data.userId,
    topics: generateTopics(data),
    userIds: [
      data.userId,
      data.rootParentUserId,
      data.parentUserId,
      ...data.mentions.map(({ userId }) => userId),
    ],
    contentIds: [
      data.contentId,
      data.rootParentId,
      data.parentId,
      ...data.embeds,
      data.channelId,
    ],
    createdAt: new Date(),
  };

  actions.push({
    ...action,
    type: EventActionType.REPLY,
    data,
  });

  const content: Content[] = [
    {
      contentId: data.contentId,
      type: ContentType.FARCASTER_REPLY,
      submitterId: data.userId,
      data,
      createdAt: action.createdAt,
    },
  ];

  const additionalContent: ContentBase[] = [
    {
      contentId: data.rootParentId,
      submitterId: data.rootParentUserId,
      createdAt: action.createdAt,
    },
    {
      contentId: data.parentId,
      submitterId: data.parentUserId,
      createdAt: action.createdAt,
    },
    ...data.embeds.map((embedId) => ({
      contentId: embedId,
      submitterId: data.userId,
      createdAt: action.createdAt,
    })),
  ];

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
    ...data.mentions
      .filter(
        (value, index, self) =>
          self.findIndex((m) => m.userId === value.userId) === index,
      )
      .map(({ userId }) => ({
        type: TopicType.MENTION,
        id: userId,
      })),
    ...data.embeds
      .filter(
        (value, index, self) => self.findIndex((m) => m === value) === index,
      )
      .map((embedId) => ({
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
