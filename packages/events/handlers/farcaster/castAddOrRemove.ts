import {
  EntityEvent,
  EventAction,
  EventActionType,
  FarcasterCastData,
  RawEvent,
  EventType,
  PostActionData,
  Content,
  PostData,
  TipActionData,
  EventActionData,
} from "@flink/common/types";
import { MongoClient } from "@flink/common/mongo";
import { toFarcasterURI } from "@flink/farcaster/utils";
import {
  getOrCreatePostContent,
  getOrCreatePostContentFromData,
} from "../../utils/farcaster";

export const handleCastAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastData>,
) => {
  const content = await getOrCreatePostContentFromData(client, rawEvent.data);

  let type: EventActionType;
  if (content.data.parentId) {
    type =
      rawEvent.source.type === EventType.CAST_ADD
        ? EventActionType.REPLY
        : EventActionType.UNREPLY;
  } else {
    type =
      rawEvent.source.type === EventType.CAST_ADD
        ? EventActionType.POST
        : EventActionType.UNPOST;
  }

  const contentId = toFarcasterURI(rawEvent.data);
  const actions: EventAction<EventActionData>[] = [
    {
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      timestamp: new Date(rawEvent.timestamp),
      entityId: content.data.entityId,
      referencedEntityIds: content.referencedEntityIds,
      referencedContentIds: content.referencedContentIds,
      createdAt: new Date(),
      updatedAt: new Date(),
      type,
      data: {
        entityId: content.data.entityId,
        contentId,
        content: content.data,
      },
      deletedAt: [EventActionType.UNPOST, EventActionType.UNREPLY].includes(
        type,
      )
        ? new Date()
        : undefined,
      topics: content.topics,
    },
  ];

  if (content.data.tips) {
    const tipActions = await handleTipEvents(
      client,
      rawEvent,
      content,
      type === EventActionType.REPLY
        ? EventActionType.TIP
        : EventActionType.UNTIP,
    );
    if (tipActions) actions.push(...tipActions);
  }

  const event: EntityEvent<FarcasterCastData> = {
    ...rawEvent,
    entityId: content.data.entityId,
    timestamp: new Date(rawEvent.timestamp),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return { event, actions };
};

const handleTipEvents = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastData>,
  content: Content<PostData>,
  type: EventActionType.TIP | EventActionType.UNTIP,
) => {
  if (!content.data.tips) return;

  const tipActions = await Promise.all(
    content.data.tips.map(async (tip) => {
      const targetContent = await getOrCreatePostContent(
        client,
        tip.targetContentId,
      );

      if (!targetContent) return;

      return {
        eventId: rawEvent.eventId,
        source: rawEvent.source,
        timestamp: content.timestamp,
        entityId: content.data.entityId,
        referencedEntityIds: content.referencedEntityIds,
        referencedContentIds: content.referencedContentIds,
        createdAt: new Date(),
        updatedAt: new Date(),
        type,
        data: {
          ...tip,
          targetContent: targetContent.data,
        },
        topics: content.topics,
      };
    }),
  );

  return tipActions.filter(Boolean) as EventAction<TipActionData>[];
};
