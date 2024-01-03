import {
  RawEvent,
  Identity,
  EventAction,
  EventActionType,
  FarcasterCastRawData,
  FarcasterPostData,
  Content,
  ContentType,
} from "@flink/common/types";
import { getFarcasterCast, getIdentitiesForFids } from "../utils";

export const handleFarcasterCastAdd = async (rawEvent: RawEvent) => {
  const data: FarcasterCastRawData = rawEvent.data;

  const thread =
    data.hash !== data.rootParentHash
      ? await getFarcasterCast(data.rootParentFid, data.rootParentHash)
      : undefined;

  const parent =
    data.parentFid && data.parentHash
      ? await getFarcasterCast(data.parentFid, data.parentHash)
      : undefined;
  if (data.parentFid && data.parentHash && !parent) {
    throw new Error(
      `[events] could not find parent ${data.parentFid}/${data.parentHash}`,
    );
  }

  const relevantFids = extractFidsFromCast(data);
  if (thread) {
    relevantFids.push(...extractFidsFromCast(thread));
  }
  if (parent) {
    relevantFids.push(...extractFidsFromCast(parent));
  }

  const identities = await getIdentitiesForFids([...new Set(relevantFids)]);

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
  const content: Content[] = [];

  const post = {
    ...formatCast(data, fidToIdentity),
    thread: thread ? formatCast(thread, fidToIdentity) : undefined,
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

  const createdAt = new Date();

  const actionType = parent
    ? EventActionType.FARCASTER_REPLY
    : EventActionType.FARCASTER_POST;
  const contentData = {
    ...post,
    parent: parent ? formatCast(parent, fidToIdentity) : undefined,
  };

  actions.push({
    eventId: rawEvent.eventId,
    source: rawEvent.source,
    timestamp: rawEvent.timestamp,
    userId,
    type: actionType,
    data: contentData,
    topics,
    userIds: [],
    contentIds: [],
    createdAt,
  });

  content.push({
    contentId: post.contentId,
    submitterId: userId,
    creatorId: userId,
    type: parent ? ContentType.FARCASTER_REPLY : ContentType.FARCASTER_POST,
    data: contentData,
    createdAt,
  });

  for (const url of contentData.embeds) {
    content.push({
      contentId: url,
      submitterId: userId,
      type: ContentType.URL,
      url,
      createdAt,
    });
  }

  return {
    sourceUserId,
    userId,
    actions,
    content,
    createdAt,
  };
};

const formatCast = (
  cast: FarcasterCastRawData,
  fidToIdentity: Record<string, Identity>,
): FarcasterPostData => {
  const embeds = cast.urls
    .map((url) => url.url)
    .concat(cast.casts.map(castToContentId));

  return {
    contentId: castToContentId(cast),
    fid: cast.fid,
    hash: cast.hash,
    userId: fidToIdentity[cast.fid].id,
    mentions: cast.mentions.map(({ mention, mentionPosition }) => ({
      userId: fidToIdentity[mention].id,
      position: parseInt(mentionPosition),
    })),
    embeds,
    channel: cast.rootParentUrl,
  };
};

const extractFidsFromCast = (cast: FarcasterCastRawData): string[] => {
  return [
    cast.fid,
    cast.parentFid,
    cast.rootParentFid,
    ...cast.mentions.map((mention) => mention.mention),
  ].filter(Boolean);
};

const castToContentId = ({ fid, hash }: { fid: string; hash: string }) => {
  return `farcaster://cast/${fid}/${hash}`;
};
