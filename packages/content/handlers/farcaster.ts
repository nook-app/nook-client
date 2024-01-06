import {
  Application,
  Content,
  ContentRequest,
  ContentType,
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
import { ObjectId } from "mongodb";
import { publishContentRequests } from "../utils";

export const getAndTransformCastAddToContent = async (
  contentId: string,
): Promise<Content | undefined> => {
  const cast = await sdk.farcaster.getCastByURI(contentId);
  if (!cast) {
    return;
  }

  return transformCastAddToContent(cast);
};

export const transformCastAddToContent = async (
  cast: FarcasterCastAddData,
): Promise<Content> => {
  if (cast.parentHash) {
    return await transformCastAddToReply(cast);
  }

  return await transformCastAddToPost(cast);
};

export const transformCastAddToPost = async (
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

  const content: PostContent = {
    _id: new ObjectId(),
    contentId: toFarcasterURI(cast),
    submitterId: data.userId,
    createdAt: new Date(),
    timestamp: cast.timestamp,
    type: ContentType.POST,
    data,
    relations: [],
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

  await publishContentRequests(contentRequests);

  return content;
};

export const transformCastAddToReply = async (
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

  const content: ReplyContent = {
    _id: new ObjectId(),
    contentId: toFarcasterURI(cast),
    submitterId: data.userId,
    createdAt: new Date(),
    timestamp: cast.timestamp,
    type: ContentType.REPLY,
    data,
    relations: [],
  };

  const additionalContent: ContentRequest[] = [
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

  await publishContentRequests(additionalContent);

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
