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

export const getOrCreateFarcasterPostOrReplyByContentId = async (
  client: MongoClient,
  contentId: string,
) => {
  const content = await client.findContent(contentId);
  if (content) {
    return { content: content as Content<PostData>, created: false };
  }

  const cast = await sdk.farcaster.getCastByURI(contentId);
  if (!cast) {
    return { content: undefined, created: false };
  }

  return {
    content: await createFarcasterPostOrReply(client, cast),
    created: true,
  };
};

export const getOrCreateFarcasterPostOrReplyByData = async (
  client: MongoClient,
  cast: FarcasterCastData,
) => {
  const content = await client.findContent(toFarcasterURI(cast));
  if (content) {
    return { content: content as Content<PostData>, created: false };
  }

  return {
    content: await createFarcasterPostOrReply(client, cast),
    created: true,
  };
};

export const createFarcasterPostOrReply = async (
  client: MongoClient,
  cast: FarcasterCastData,
): Promise<Content<PostData>> => {
  if (cast.parentHash) {
    return await createFarcasterReply(client, cast);
  }

  return await createFarcasterPost(client, cast);
};

export const createFarcasterPost = async (
  client: MongoClient,
  cast: FarcasterCastData,
): Promise<Content<PostData>> => {
  const identities = await sdk.identity.getFidIdentityMap(
    extractFidsFromCasts([cast]),
  );

  const data: PostData = transformCast(cast, identities);

  const [content] = await Promise.all([
    upsertContent(client, toFarcasterURI(cast), data),
    void getAndPublishContentRequests(data),
  ]);

  return content;
};

export const createFarcasterReply = async (
  client: MongoClient,
  cast: FarcasterCastData,
): Promise<Content<PostData>> => {
  const { existingParent, existingRoot, newParent, newRoot } =
    await getParentAndRootCasts(client, cast);

  const casts = [cast];
  if (newParent) casts.push(newParent);
  if (newRoot) casts.push(newRoot);

  const identities = await sdk.identity.getFidIdentityMap(
    extractFidsFromCasts(casts),
  );

  const data: PostData = transformCast(cast, identities);
  data.rootParent =
    existingRoot?.data ||
    (newRoot ? transformCast(newRoot, identities) : undefined);
  data.parent =
    existingParent?.data ||
    (newParent ? transformCast(newParent, identities) : undefined);
  data.parentId = toFarcasterURI({
    fid: cast.parentFid,
    hash: cast.parentHash,
  });

  const promises = [
    upsertContent(client, toFarcasterURI(cast), data),
    void getAndPublishContentRequests(data),
  ];

  if (newRoot) {
    promises.push(upsertContent(client, data.rootParentId, data.rootParent));
  }

  if (newParent && data.parent.rootParentId === data.rootParentId) {
    promises.push(
      upsertContent(client, data.parentId, {
        ...data.parent,
        rootParentId: data.rootParentId,
        rootParentUserId: data.rootParentUserId,
        rootParent: data.rootParent,
      }),
    );
  }

  const [content] = await Promise.all(promises);

  return content;
};

const getParentAndRootCasts = async (
  client: MongoClient,
  cast: FarcasterCastData,
) => {
  const parentUri = toFarcasterURI({
    fid: cast.parentFid,
    hash: cast.parentHash,
  });
  const rootUri = toFarcasterURI({
    fid: cast.rootParentFid,
    hash: cast.rootParentHash,
  });

  const uris = [parentUri, rootUri];

  const existingContent: Content<PostData>[] = await client
    .getCollection<Content<PostData>>(MongoCollection.Content)
    .find({
      contentId: {
        $in: uris,
      },
    })
    .toArray();

  const existingParent = existingContent.find(
    (content) => content.contentId === parentUri,
  );

  const existingRoot = existingContent.find(
    (content) => content.contentId === rootUri,
  );

  let newParent: FarcasterCastData;

  let newRoot: FarcasterCastData;

  if (!existingParent || !existingRoot) {
    const missingUris = uris.filter(
      (uri) => !existingContent.find((content) => content.contentId === uri),
    );

    const casts = (await sdk.farcaster.getCasts({ uris: missingUris })).filter(
      Boolean,
    );

    newParent = casts.find(
      (c) => c.fid === cast.parentFid && c.hash === cast.parentHash,
    );

    newRoot = casts.find(
      (c) => c.fid === cast.rootParentFid && c.hash === cast.rootParentHash,
    );
  }

  return {
    existingParent,
    existingRoot,
    newParent,
    newRoot,
  };
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

const extractFidsFromCasts = (casts: FarcasterCastData[]): string[] => {
  return Array.from(
    new Set(
      casts.flatMap((cast) =>
        [
          cast.fid,
          cast.parentFid,
          cast.rootParentFid,
          ...cast.mentions.map((mention) => mention.mention),
        ].filter(Boolean),
      ),
    ),
  );
};

const upsertContent = async (
  client: MongoClient,
  contentId: string,
  post: PostData,
) => {
  const content = await formatContent(client, contentId, post);
  await client.upsertContent(content);
  return content;
};

const formatContent = async (
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
    relations: getRelations(post),
    userIds: getUserIds(post),
    engagement: await getEngagement(client, contentId),
  };
};

const getRelations = (post: PostData): ContentRelation[] => {
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

const getUserIds = (post: PostData): string[] => {
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

export const getEngagement = async (
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

const getAndPublishContentRequests = async (data: PostData) => {
  const contentRequests: ContentRequest[] = data.embeds.map((contentId) => ({
    contentId,
    submitterId: data.userId,
  }));

  if (data.parent && data.parent.parentId !== data.rootParentId) {
    contentRequests.push({
      contentId: data.parentId,
      submitterId: data.parentUserId,
    });
  }

  await publishContentRequests(contentRequests);
};
