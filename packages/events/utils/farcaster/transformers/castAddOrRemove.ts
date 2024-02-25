import {
  EntityEvent,
  EventAction,
  EventActionType,
  FarcasterCastData,
  RawEvent,
  EventType,
  EventActionData,
  Content,
  PostData,
} from "@nook/common/types";
import { toFarcasterURI } from "@nook/common/farcaster";

export const transformCastAddOrRemove = (
  rawEvent: RawEvent<FarcasterCastData>,
  content: Content<PostData>,
) => {
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
  const actions: EventAction[] = [
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
      },
      topics: content.topics,
    },
  ];

  const event: EntityEvent<FarcasterCastData> = {
    ...rawEvent,
    entityId: content.data.entityId,
    timestamp: new Date(rawEvent.timestamp),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return { event, actions };
};
