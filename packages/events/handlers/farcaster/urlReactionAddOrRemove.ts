import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterReactionType,
  FarcasterUrlReactionData,
  RawEvent,
  EntityEvent,
} from "@flink/common/types";
import { ObjectId } from "mongodb";
import { ContentActionData } from "@flink/common/types/actionTypes";
import { MongoClient } from "@flink/common/mongo";

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
  }

  const fidToIdentity = await client.findOrInsertIdentities([
    rawEvent.data.fid,
  ]);

  const entityId = fidToIdentity[rawEvent.data.fid]._id;
  const contentId = rawEvent.data.url;
  const actions: EventAction<ContentActionData>[] = [
    {
      _id: new ObjectId(),
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
    actions: actions.map(({ _id }) => _id),
    createdAt: actions[0].createdAt,
  };

  return { event, actions };
};
