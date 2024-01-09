import {
  Application,
  Content,
  ContentRelation,
  ContentRelationType,
  ContentRequest,
  ContentType,
  FarcasterCastData,
  PostData,
  Protocol,
} from "@flink/common/types";
import { toFarcasterURI } from "@flink/farcaster/utils";
import { Identity } from "@flink/identity/types";
import { sdk } from "@flink/sdk";
import { MongoClient } from "@flink/common/mongo";
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

  const relations: ContentRelation[] = data.embeds.map((embedId) => ({
    type: ContentRelationType.EMBED,
    contentId: embedId,
  }));

  relations.push({
    type: ContentRelationType.ROOT_PARENT,
    contentId: data.rootParentId,
  });

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

    relations.push({
      type: ContentRelationType.PARENT,
      contentId: data.parentId,
    });
  }

  if (data.channelId) {
    relations.push({
      type: ContentRelationType.CHANNEL,
      contentId: data.channelId,
    });
  }

  const contentId = toFarcasterURI(cast);
  const content: Content<PostData> = {
    contentId,
    submitterId: data.userId,
    createdAt: new Date(),
    timestamp: new Date(cast.timestamp),
    type: cast.parentHash ? ContentType.REPLY : ContentType.POST,
    data,
    relations,
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
  };

  const contentRequests: ContentRequest[] = content.data.embeds.map(
    (embedId) => ({
      contentId: embedId,
      submitterId: content.data.userId,
    }),
  );

  if (cast.parentHash) {
    contentRequests.push({
      contentId: content.data.parentId,
      submitterId: content.data.parentUserId,
    });
    contentRequests.push({
      contentId: content.data.rootParentId,
      submitterId: content.data.rootParentUserId,
    });
  }

  await Promise.all([
    publishContentRequests(contentRequests),
    client.upsertContent(content),
  ]);

  return content;
};

const transformCast = (
  cast: FarcasterCastData,
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

const extractFidsFromCast = (cast: FarcasterCastData): string[] => {
  return [
    cast.fid,
    cast.parentFid,
    cast.rootParentFid,
    ...cast.mentions.map((mention) => mention.mention),
  ].filter(Boolean);
};
