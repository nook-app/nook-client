import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterReactionType,
  FarcasterUrlReactionData,
  RawEvent,
  EntityEvent,
} from "@flink/common/types";
import { ContentActionData } from "@flink/common/types/actionTypes";
import { MongoClient } from "@flink/common/mongo";
import { getOrCreateEntitiesForFids } from "@flink/common/entity";

export const handleUrlReactionAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterUrlReactionData>,
) => {
  let eventActionType: EventActionType | undefined;

  const isRemove = [
    EventType.CAST_REACTION_REMOVE,
    EventType.URL_REACTION_REMOVE,
  ].includes(rawEvent.source.type);

  if (rawEvent.data.reactionType === FarcasterReactionType.LIKE) {
    eventActionType = isRemove ? EventActionType.UNLIKE : EventActionType.LIKE;
  } else if (rawEvent.data.reactionType === FarcasterReactionType.RECAST) {
    eventActionType = isRemove
      ? EventActionType.UNREPOST
      : EventActionType.REPOST;
  } else {
    throw Error(`Unsupported reaction type: ${rawEvent.data.reactionType}`);
  }

  const fidToEntity = await getOrCreateEntitiesForFids(client, [
    rawEvent.data.fid,
  ]);

  const entityId = fidToEntity[rawEvent.data.fid]._id;
  const contentId = rawEvent.data.url;
  const actions: EventAction<ContentActionData>[] = [
    {
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      timestamp: rawEvent.timestamp,
      entityId,
      entityIds: [entityId],
      contentIds: [contentId],
      createdAt: new Date(),
      type: eventActionType,
      data: {
        entityId,
        contentId,
      },
      deletedAt: isRemove ? new Date() : undefined,
    },
  ];

  const event: EntityEvent<FarcasterUrlReactionData> = {
    ...rawEvent,
    entityId,
    createdAt: actions[0].createdAt,
  };

  return { event, actions };
};
