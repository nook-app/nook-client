import { MongoClient } from "@flink/common/mongo";
import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterCastReactionData,
  FarcasterReactionType,
  PostActionData,
  RawEvent,
  UserEvent,
} from "@flink/common/types";
import { ObjectId } from "mongodb";
import { toFarcasterURI } from "@flink/farcaster/utils";
import { getFarcasterPostByContentId } from "@flink/common/utils";

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
  }

  const identities = await client.findOrInsertIdentities([rawEvent.data.fid]);
  const userId = identities[rawEvent.data.fid]._id;

  const actions: EventAction<PostActionData>[] = [
    {
      _id: new ObjectId(),
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      timestamp: rawEvent.timestamp,
      userId,
      userIds: Array.from(
        new Set([
          userId,
          data.userId,
          data.parentUserId,
          data.rootParentUserId,
          ...data.mentions.map(({ userId }) => userId),
        ]),
      ).filter(Boolean),
      contentIds: Array.from(
        new Set([
          contentId,
          data.rootParentId,
          data.parentId,
          ...data.embeds,
          data.channelId,
        ]),
      ).filter(Boolean),
      createdAt: new Date(),
      type,
      data: {
        userId: data.userId,
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

  const event: UserEvent<FarcasterCastReactionData> = {
    ...rawEvent,
    userId,
    actions: actions.map(({ _id }) => _id),
    createdAt: new Date(),
  };

  return { event, actions };
};
