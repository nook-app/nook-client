import { MongoClient } from "@flink/common/mongo";
import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterCastReactionData,
  FarcasterReactionType,
  PostActionData,
  RawEvent,
  EntityEvent,
} from "@flink/common/types";
import { ObjectId } from "mongodb";
import { toFarcasterURI } from "@flink/farcaster/utils";
import { getFarcasterPostByContentId } from "@flink/common/utils";
import { getOrCreateEntitiesForFids } from "@flink/common/entity";

export const handleCastReactionAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterCastReactionData>,
) => {
  const contentId = toFarcasterURI({
    fid: rawEvent.data.targetFid,
    hash: rawEvent.data.targetHash,
  });

  const data = await getFarcasterPostByContentId(client, contentId);
  if (!data) return;

  let type: EventActionType;
  if (rawEvent.data.reactionType === FarcasterReactionType.LIKE) {
    type =
      rawEvent.source.type === EventType.CAST_REACTION_ADD
        ? EventActionType.LIKE
        : EventActionType.UNLIKE;
  } else if (rawEvent.data.reactionType === FarcasterReactionType.RECAST) {
    type =
      rawEvent.source.type === EventType.CAST_REACTION_ADD
        ? EventActionType.REPOST
        : EventActionType.UNREPOST;
  } else {
    throw Error(`Unsupported reaction type: ${rawEvent.data.reactionType}`);
  }

  const identities = await getOrCreateEntitiesForFids(client, [
    rawEvent.data.fid,
  ]);
  const entityId = identities[rawEvent.data.fid]._id;

  const actions: EventAction<PostActionData>[] = [
    {
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      timestamp: rawEvent.timestamp,
      entityId,
      entityIds: Array.from(
        new Set([
          entityId,
          data.entityId,
          data.parentEntityId,
          data.rootParentEntityId,
          ...data.mentions.map(({ entityId }) => entityId),
        ]),
      ).filter(Boolean) as ObjectId[],
      contentIds: Array.from(
        new Set([
          contentId,
          data.rootParentId,
          data.parentId,
          ...data.embeds,
          data.channelId,
        ]),
      ).filter(Boolean) as string[],
      createdAt: new Date(),
      type,
      data: {
        entityId: data.entityId,
        contentId,
        content: data,
      },
      deletedAt: [EventActionType.UNPOST, EventActionType.UNREPLY].includes(
        type,
      )
        ? new Date()
        : undefined,
    },
  ];

  const event: EntityEvent<FarcasterCastReactionData> = {
    ...rawEvent,
    entityId,
    createdAt: new Date(),
  };

  return { event, actions };
};
