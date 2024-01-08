import {
  Application,
  ContentEngagement,
  ContentRequest,
  ContentType,
  EventActionType,
  EventService,
  FarcasterCastAddData,
  PostContent,
  PostData,
  Protocol,
  ReplyContent,
  ReplyData,
} from "@flink/common/types";
import { toFarcasterURI } from "@flink/farcaster/utils";
import { Identity } from "@flink/identity/types";
import { sdk } from "@flink/sdk";
import { publishContentRequests } from "../../utils";
import { HandlerArgs } from "../../types";
import { MongoClient, MongoCollection } from "@flink/common/mongo";

export const getAndTransformCastAddToContent = async ({
  client,
  request,
}: HandlerArgs) => {
  const content = await client.findContent(request.contentId);
  if (content?.engagement && "likes" in content.engagement) {
    console.log(`[content] already processed ${request.contentId}`);
    return;
  }

  const cast = await sdk.farcaster.getCastByURI(request.contentId);
  if (!cast) {
    return;
  }

  if (cast.parentHash) {
    await transformCastAddToReply(client, cast);
  }

  await transformCastAddToPost(client, cast);
};

export const transformCastAddToPost = async (
  client: MongoClient,
  cast: FarcasterCastAddData,
): Promise<PostContent> => {
  const identities = await sdk.identity.getForFids([
    ...new Set(extractFidsFromCast(cast)),
  ]);

  const fidToIdentity = identities.reduce(
    (acc, identity) => {
      acc[identity.socialAccounts[0].platformId] = identity;
      return acc;
    },
    {} as Record<string, Identity>,
  );

  const data = transformCast(cast, fidToIdentity);

  const contentId = toFarcasterURI(cast);
  const content: PostContent = {
    contentId,
    submitterId: data.userId,
    createdAt: new Date(),
    timestamp: new Date(cast.timestamp),
    type: ContentType.POST,
    data,
    relations: [],
    userIds: Array.from(
      new Set(
        [
          data.userId,
          data.rootParentUserId,
          ...data.mentions.map(({ userId }) => userId),
        ].filter(Boolean),
      ),
    ),
    engagement: await getEngagementData(client, contentId),
  };

  const contentRequests: ContentRequest[] = [
    {
      contentId: content.data.rootParentId,
      submitterId: content.data.rootParentUserId,
    },
    ...content.data.embeds.map((embedId) => ({
      contentId: embedId,
      submitterId: content.data.userId,
    })),
  ];

  await Promise.all([
    publishContentRequests(contentRequests),
    client.upsertContent(content),
  ]);

  return content;
};

export const transformCastAddToReply = async (
  client: MongoClient,
  cast: FarcasterCastAddData,
): Promise<ReplyContent> => {
  const casts = (
    await sdk.farcaster.getCasts({
      fidHashes: [
        {
          fid: cast.rootParentFid,
          hash: cast.rootParentHash,
        },
        {
          fid: cast.parentFid,
          hash: cast.parentHash,
        },
      ],
    })
  ).filter(Boolean);

  const identities = await sdk.identity.getForFids([
    ...new Set([
      ...extractFidsFromCast(cast),
      ...casts.flatMap(extractFidsFromCast),
    ]),
  ]);

  const fidToIdentity = identities.reduce(
    (acc, identity) => {
      acc[identity.socialAccounts[0].platformId] = identity;
      return acc;
    },
    {} as Record<string, Identity>,
  );

  const rootParent = casts.find(
    (cast) =>
      cast.fid === cast.rootParentFid && cast.hash === cast.rootParentHash,
  );

  const parent = casts.find(
    (cast) => cast.fid === cast.parentFid && cast.hash === cast.parentHash,
  );

  const data = {
    ...transformCast(cast, fidToIdentity),
    rootParent: rootParent
      ? transformCast(rootParent, fidToIdentity)
      : undefined,
    parentId: toFarcasterURI({ fid: cast.parentFid, hash: cast.parentHash }),
    parent: parent ? transformCast(parent, fidToIdentity) : undefined,
  } as ReplyData;

  const contentId = toFarcasterURI(cast);
  const content: ReplyContent = {
    contentId,
    submitterId: data.userId,
    createdAt: new Date(),
    timestamp: new Date(cast.timestamp),
    type: ContentType.REPLY,
    data,
    relations: [],
    userIds: Array.from(
      new Set(
        [
          data.userId,
          data.rootParentUserId,
          data.parentUserId,
          ...data.mentions.map(({ userId }) => userId),
        ].filter(Boolean),
      ),
    ),
    engagement: await getEngagementData(client, contentId),
  };

  const contentRequests: ContentRequest[] = [
    {
      contentId: content.data.rootParentId,
      submitterId: content.data.rootParentUserId,
    },
    {
      contentId: content.data.parentId,
      submitterId: content.data.parentUserId,
    },
    ...content.data.embeds.map((embedId) => ({
      contentId: embedId,
      submitterId: content.data.userId,
    })),
  ];

  await Promise.all([
    publishContentRequests(contentRequests),
    client.upsertContent(content),
  ]);

  return content;
};

const transformCast = (
  cast: FarcasterCastAddData,
  fidToIdentity: Record<string, Identity>,
): PostData => {
  const embeds = cast.urls
    .map((url) => url.url)
    .concat(cast.casts.map((c) => toFarcasterURI(c)));

  return {
    contentId: toFarcasterURI(cast),
    protocol: Protocol.FARCASTER,
    application: Application.TBD,
    text: cast.text,
    userId: fidToIdentity[cast.fid].id,
    mentions: cast.mentions.map(({ mention, mentionPosition }) => ({
      userId: fidToIdentity[mention].id,
      position: parseInt(mentionPosition),
    })),
    embeds,
    channelId: cast.rootParentUrl,
    rootParentId: toFarcasterURI({
      fid: cast.rootParentFid,
      hash: cast.rootParentHash,
    }),
    rootParentUserId: fidToIdentity[cast.rootParentFid].id,
  };
};

const extractFidsFromCast = (cast: FarcasterCastAddData): string[] => {
  return [
    cast.fid,
    cast.parentFid,
    cast.rootParentFid,
    ...cast.mentions.map((mention) => mention.mention),
  ].filter(Boolean);
};

const getEngagementData = async (
  client: MongoClient,
  contentId: string,
): Promise<ContentEngagement> => {
  const collection = client.getCollection(MongoCollection.Actions);
  const [replies, rootReplies, embeds, likes, reposts] = await Promise.all([
    collection.countDocuments({
      type: EventActionType.REPLY,
      "data.parentId": contentId,
    }),
    collection.countDocuments({
      type: EventActionType.REPLY,
      "data.rootParentId": contentId,
    }),
    collection.countDocuments({
      $or: [{ type: EventActionType.POST }, { type: EventActionType.REPLY }],
      "data.embeds": contentId,
    }),
    collection.countDocuments({
      type: EventActionType.LIKE,
      "data.contentId": contentId,
    }),
    collection.countDocuments({
      type: EventActionType.REPOST,
      "data.contentId": contentId,
    }),
  ]);

  return {
    replies: {
      [EventService.FARCASTER]: replies,
    },
    rootReplies: {
      [EventService.FARCASTER]: rootReplies,
    },
    embeds: {
      [EventService.FARCASTER]: embeds,
    },
    likes: {
      [EventService.FARCASTER]: likes,
    },
    reposts: {
      [EventService.FARCASTER]: reposts,
    },
  };
};
