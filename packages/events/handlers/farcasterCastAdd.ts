import {
  RawEvent,
  Identity,
  EventAction,
  EventActionType,
  EventActionPostData,
} from "@flink/common/types";
import { getFarcasterCast, getIdentitiesForFids } from "../utils";
import { FarcasterCastData } from "@flink/common/types/sources/farcaster";

export const handleFarcasterCastAdd = async (rawEvent: RawEvent) => {
  const data: FarcasterCastData = rawEvent.data;
  const identities = await getIdentitiesForFids(
    [
      data.fid,
      data.parentFid,
      data.rootParentFid,
      ...data.mentions.map((mention) => mention.mention),
    ].filter(Boolean),
  );

  const fidToIdentity = identities.reduce(
    (acc, identity) => {
      acc[identity.socialAccounts[0].platformId] = identity;
      return acc;
    },
    {} as Record<string, Identity>,
  );

  const sourceUserId = data.fid;
  const userId = fidToIdentity[sourceUserId].id;

  const actions: EventAction[] = [];

  const thread =
    data.hash !== data.rootParentHash
      ? await getAndFormatCast(
          data.rootParentFid,
          data.rootParentHash,
          fidToIdentity,
        )
      : undefined;

  const post = {
    ...formatCast(data, fidToIdentity),
    thread,
  };

  const topics = [
    `user:${userId}`,
    `thread:${rawEvent.source}-${data.rootParentHash}`,
    ...data.mentions.map(
      ({ mention }) => `mention:${fidToIdentity[mention].id}`,
    ),
  ];

  if (data.rootParentUrl) {
    topics.push(`channel:${data.rootParentUrl}`);
  }

  if (data.parentFid && data.parentHash) {
    actions.push({
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      sourceEventId: rawEvent.sourceEventId,
      timestamp: rawEvent.timestamp,
      sourceUserId,
      userId,
      type: EventActionType.REPLY,
      data: {
        ...post,
        parent: await getAndFormatCast(
          data.parentFid,
          data.parentHash,
          fidToIdentity,
        ),
      },
      topics: [...topics, `mention:${fidToIdentity[data.parentFid].id}`],
    });
  } else {
    actions.push({
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      sourceEventId: rawEvent.sourceEventId,
      timestamp: rawEvent.timestamp,
      sourceUserId,
      userId,
      type: EventActionType.POST,
      data: post,
      topics,
    });
  }

  return {
    sourceUserId,
    userId,
    actions,
  };
};

const getAndFormatCast = async (
  fid: string,
  hash: string,
  fidToIdentity: Record<string, Identity>,
): Promise<EventActionPostData | undefined> => {
  const cast = await getFarcasterCast(fid, hash);
  return formatCast(cast, fidToIdentity);
};

const formatCast = (
  cast: FarcasterCastData,
  fidToIdentity: Record<string, Identity>,
): EventActionPostData => {
  let content = cast.text;
  for (let i = cast.mentions.length - 1; i >= 0; i--) {
    const mention = cast.mentions[i].mention;
    const position = parseInt(cast.mentions[i].mentionPosition);
    content = `${content.slice(0, position)}{{user|${
      fidToIdentity[mention].id
    }}}${content.slice(position)}`;
  }

  const embeds = cast.urls
    .map((url) => url.url)
    .concat(cast.casts.map((cast) => `farcaster://cast/${cast.hash}`));

  return {
    sourceUserId: cast.fid,
    userId: fidToIdentity[cast.fid].id,
    content,
    embeds,
  };
};
