import {
  Application,
  Content,
  ContentEngagement,
  ContentRelation,
  ContentRelationType,
  ContentRequest,
  ContentType,
  EventActionType,
  FarcasterCastData,
  PostData,
  Protocol,
} from "@flink/common/types";
import { toFarcasterURI } from "@flink/farcaster/utils";
import { Identity } from "@flink/identity/types";
import { sdk } from "@flink/sdk";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import { publishContentRequests } from "@flink/common/queues";

export const getAndTransformCastToContent = async (
  client: MongoClient,
  contentId: string,
): Promise<Content<PostData>> => {
  const content = await client.findContent(contentId);
  if (content) {
    return content;
  }

  const cast = await sdk.farcaster.getCastByURI(contentId);
  if (!cast) {
    return;
  }

  return await transformCastToPost(client, cast);
};

export const transformCastToPost = async (
  client: MongoClient,
  cast: FarcasterCastData,
): Promise<Content<PostData>> => {
  const fidHashes = [];
  if (cast.parentHash) {
    fidHashes.push({
      fid: cast.parentFid,
      hash: cast.parentHash,
    });
    fidHashes.push({
      fid: cast.rootParentFid,
      hash: cast.rootParentHash,
    });
  }

  // TODO: Optimize by looking in collection first
  const casts = (await sdk.farcaster.getCasts({ fidHashes })).filter(Boolean);

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

  const data: PostData = transformCast(cast, fidToIdentity);

  if (cast.parentHash) {
    const rootParent = casts.find(
      (cast) =>
        cast.fid === cast.rootParentFid && cast.hash === cast.rootParentHash,
    );
    if (rootParent) {
      data.rootParent = transformCast(rootParent, fidToIdentity);
    }

    const parent = casts.find(
      (cast) => cast.fid === cast.parentFid && cast.hash === cast.parentHash,
    );
    if (parent) {
      data.parent = transformCast(parent, fidToIdentity);
    }

    data.parentId = toFarcasterURI({
      fid: cast.parentFid,
      hash: cast.parentHash,
    });
  }

  const promises = [getAndUpsertContent(client, toFarcasterURI(cast), data)];

  const contentRequests: ContentRequest[] = data.embeds.map((contentId) => ({
    contentId,
    submitterId: data.userId,
  }));

  if (data.rootParent) {
    promises.push(
      getAndUpsertContent(client, data.rootParentId, data.rootParent),
    );

    if (data.parent && data.parent.rootParentId === data.rootParentId) {
      promises.push(
        getAndUpsertContent(client, data.rootParentId, {
          ...data.parent,
          rootParentId: data.rootParentId,
          rootParentUserId: data.rootParentUserId,
          rootParent: data.rootParent,
        }),
      );
    } else if (data.parent) {
      contentRequests.push({
        contentId: data.parentId,
        submitterId: data.parentUserId,
      });
    }
  }

  promises.push(void publishContentRequests(contentRequests));

  const [content] = await Promise.all(promises);

  return content;
};

const transformCast = (
  cast: FarcasterCastData,
  fidToIdentity: Record<string, Identity>,
): PostData => {
  return {
    protocol: Protocol.FARCASTER,
    application: Application.TBD,
    text: cast.text,
    timestamp: cast.timestamp,
    userId: fidToIdentity[cast.fid].id,
    mentions: cast.mentions.map(({ mention, mentionPosition }) => ({
      userId: fidToIdentity[mention].id,
      position: parseInt(mentionPosition),
    })),
    embeds: cast.embeds,
    channelId: cast.rootParentUrl,
    rootParentId: toFarcasterURI({
      fid: cast.rootParentFid,
      hash: cast.rootParentHash,
    }),
    rootParentUserId: fidToIdentity[cast.rootParentFid].id,
  };
};

const extractFidsFromCast = (cast: FarcasterCastData): string[] => {
  return [
    cast.fid,
    cast.parentFid,
    cast.rootParentFid,
    ...cast.mentions.map((mention) => mention.mention),
  ].filter(Boolean);
};

const getAndUpsertContent = async (
  client: MongoClient,
  contentId: string,
  post: PostData,
) => {
  const content = await transformPostToContent(client, contentId, post);
  await client.upsertContent(content);
  return content;
};

const transformPostToContent = async (
  client: MongoClient,
  contentId: string,
  post: PostData,
): Promise<Content<PostData>> => {
  return {
    contentId,
    submitterId: post.userId,
    createdAt: new Date(),
    timestamp: new Date(post.timestamp),
    type: post.parentId ? ContentType.REPLY : ContentType.POST,
    data: post,
    relations: generateRelations(post),
    userIds: generateUserIds(post),
    engagement: await getEngagement(client, contentId),
  };
};

const generateRelations = (post: PostData): ContentRelation[] => {
  const relations: ContentRelation[] = post.embeds.map((contentId) => ({
    type: ContentRelationType.EMBED,
    contentId,
  }));

  relations.push({
    type: ContentRelationType.ROOT_PARENT,
    contentId: post.rootParentId,
  });

  if (post.parentId) {
    relations.push({
      type: ContentRelationType.PARENT,
      contentId: post.parentId,
    });
  }

  if (post.channelId) {
    relations.push({
      type: ContentRelationType.CHANNEL,
      contentId: post.channelId,
    });
  }

  return relations;
};

const generateUserIds = (post: PostData): string[] => {
  const userIds: string[] = [post.userId];

  if (post.rootParentUserId && !userIds.includes(post.rootParentUserId)) {
    userIds.push(post.rootParentUserId);
  }

  if (post.parentUserId && !userIds.includes(post.parentUserId)) {
    userIds.push(post.parentUserId);
  }

  for (const { userId } of post.mentions) {
    if (!userIds.includes(userId)) {
      userIds.push(userId);
    }
  }

  return userIds;
};

const getEngagement = async (
  client: MongoClient,
  contentId: string,
): Promise<ContentEngagement> => {
  const actions = client.getCollection(MongoCollection.Actions);

  const [replies, rootReplies, likes, reposts, embeds] = await Promise.all([
    actions.countDocuments({
      contentIds: contentId,
      type: EventActionType.REPLY,
      "data.content.parentId": contentId,
      deletedAt: null,
    }),
    actions.countDocuments({
      contentIds: contentId,
      type: EventActionType.REPLY,
      "data.content.rootParentId": contentId,
      deletedAt: null,
    }),
    actions.countDocuments({
      contentIds: contentId,
      type: EventActionType.LIKE,
      "data.contentId": contentId,
      deletedAt: null,
    }),
    actions.countDocuments({
      contentIds: contentId,
      type: EventActionType.REPOST,
      "data.contentId": contentId,
      deletedAt: null,
    }),
    actions.countDocuments({
      contentIds: contentId,
      type: { $in: [EventActionType.POST, EventActionType.REPLY] },
      "data.content.embeds": contentId,
      deletedAt: null,
    }),
  ]);

  return {
    replies,
    rootReplies,
    embeds,
    likes,
    reposts,
  };
};
