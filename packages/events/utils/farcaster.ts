import {
  Content,
  FarcasterCastData,
  PostData,
  FidHash,
  ContentType,
  Topic,
  TopicType,
} from "@flink/common/types";
import { toFarcasterURI } from "@flink/farcaster/utils";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import { Entity } from "@flink/common/types/entity";
import { getOrCreateEntitiesForFids } from "@flink/common/entity";
import { publishContent } from "@flink/common/queues";
import { ObjectId } from "mongodb";

export const getOrCreatePostContent = async (
  client: MongoClient,
  contentId: string,
) => {
  const existingContent = await client.findContent(contentId);
  if (existingContent) {
    return existingContent as Content<PostData>;
  }

  const cast = await getFarcasterCastByURI(contentId);
  if (!cast) {
    return;
  }

  return await createPostContent(client, cast);
};

export const getOrCreatePostContentFromData = async (
  client: MongoClient,
  cast: FarcasterCastData,
) => {
  const existingContent = await client.findContent(toFarcasterURI(cast));
  if (existingContent) {
    return existingContent as Content<PostData>;
  }

  return await createPostContent(client, cast);
};

const createPostContent = async (
  client: MongoClient,
  cast: FarcasterCastData,
) => {
  let content: Content<PostData>;
  if (cast.parentHash) {
    content = await generateReplyContent(client, cast);
  } else {
    content = await generatePostContent(client, cast);
  }

  await client.upsertContent(content);

  for (const embed of content.data.embeds) {
    if (!(await client.findContent(embed))) {
      await publishContent(embed);
    }
  }

  return content;
};

const generatePostContent = async (
  client: MongoClient,
  cast: FarcasterCastData,
) => {
  const identities = await getOrCreateEntitiesForFids(
    client,
    extractFidsFromCasts([cast]),
  );
  return formatContent(generatePost(cast, identities));
};

const generateReplyContent = async (
  client: MongoClient,
  cast: FarcasterCastData,
) => {
  const { existingParent, existingRoot, newParent, newRoot } =
    await getParentAndRootCasts(client, cast);

  const casts = [cast];
  if (newParent) casts.push(newParent);
  if (newRoot) casts.push(newRoot);

  const identities = await getOrCreateEntitiesForFids(
    client,
    extractFidsFromCasts(casts),
  );

  const data: PostData = generatePost(cast, identities);
  data.rootParent =
    existingRoot?.data ||
    (newRoot ? generatePost(newRoot, identities) : undefined);
  data.parent =
    existingParent?.data ||
    (newParent ? generatePost(newParent, identities) : undefined);
  data.parentEntityId = identities[cast.parentFid as string]._id;

  return formatContent(data);
};

const getParentAndRootCasts = async (
  client: MongoClient,
  cast: FarcasterCastData,
) => {
  // only called when cast.parentHash is defined, ie, not a root cast
  const parentUri = toFarcasterURI({
    fid: cast.parentFid as string,
    hash: cast.parentHash as string,
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

  let newParent: FarcasterCastData | undefined;

  let newRoot: FarcasterCastData | undefined;

  if (!existingParent || !existingRoot) {
    const missingUris = uris.filter(
      (uri) => !existingContent.find((content) => content.contentId === uri),
    );

    const casts = (await getFarcasterCasts({ uris: missingUris })).filter(
      Boolean,
    );

    if (casts) {
      newParent = casts.find(
        (c) => c.fid === cast.parentFid && c.hash === cast.parentHash,
      );

      newRoot = casts.find(
        (c) => c.fid === cast.rootParentFid && c.hash === cast.rootParentHash,
      );
    }
  }

  return {
    existingParent: existingParent
      ? { ...existingParent, parent: undefined }
      : undefined,
    existingRoot,
    newParent,
    newRoot,
  };
};

const formatContent = (data: PostData): Content<PostData> => {
  return {
    contentId: data.contentId,
    createdAt: new Date(),
    updatedAt: new Date(),
    timestamp: new Date(data.timestamp),
    type: data.parentId ? ContentType.REPLY : ContentType.POST,
    data,
    engagement: {
      likes: 0,
      reposts: 0,
      replies: 0,
      embeds: 0,
      degenTips: 0,
    },
    topics: generateTopics(data),
    referencedEntityIds: Array.from(
      new Set([
        data.entityId,
        data.parentEntityId,
        data.rootParentEntityId,
        ...data.mentions.map(({ entityId }) => entityId),
      ]),
    ).filter(Boolean) as ObjectId[],
    referencedContentIds: Array.from(
      new Set([
        data.contentId,
        data.rootParentId,
        data.parentId,
        ...data.embeds,
        data.channelId,
      ]),
    ).filter(Boolean) as string[],
  };
};

const generatePost = (
  cast: FarcasterCastData,
  fidToEntity: Record<string, Entity>,
): PostData => {
  return {
    contentId: toFarcasterURI(cast),
    text: cast.text,
    timestamp: cast.timestamp,
    entityId: fidToEntity[cast.fid]._id,
    mentions: cast.mentions.map(({ mention, mentionPosition }) => ({
      entityId: fidToEntity[mention]._id,
      position: parseInt(mentionPosition),
    })),
    embeds: cast.embeds,
    channelId: cast.rootParentUrl,
    parentId:
      cast.parentFid && cast.parentHash
        ? toFarcasterURI({
            fid: cast.parentFid,
            hash: cast.parentHash,
          })
        : undefined,
    rootParentId: toFarcasterURI({
      fid: cast.rootParentFid,
      hash: cast.rootParentHash,
    }),
    rootParentEntityId: fidToEntity[cast.rootParentFid]._id,
  };
};

const extractFidsFromCasts = (casts: FarcasterCastData[]): string[] => {
  return Array.from(
    new Set(
      casts.flatMap(
        (cast) =>
          [
            cast.fid,
            cast.parentFid,
            cast.rootParentFid,
            ...cast.mentions.map((mention) => mention.mention),
          ].filter(Boolean) as string[],
      ),
    ),
  );
};

export const getFarcasterCastByURI = async (uri: string) => {
  const casts = await getFarcasterCasts({ uris: [uri] });
  if (!casts) {
    return;
  }
  return casts[0];
};

export const getFarcasterCasts = async ({
  uris,
  fidHashes,
}: { uris?: string[]; fidHashes?: FidHash[] }): Promise<
  FarcasterCastData[]
> => {
  if (!uris?.length && !fidHashes?.length) {
    return [];
  }

  const response = await fetch(`${process.env.FARCASTER_SERVICE_URL}/casts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ids: Array.from(new Set(fidHashes)),
      uris: Array.from(new Set(uris)),
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed getting cast with ${response.status} for ${fidHashes} and ${uris}`,
    );
  }

  const { casts } = await response.json();
  if (Array.isArray(casts)) {
    return casts;
  }
  throw new Error(`Invalid response from farcaster: ${JSON.stringify(casts)}`);
};

const generateTopics = (data: PostData) => {
  const topics: Topic[] = [
    {
      type: TopicType.SOURCE_ENTITY,
      value: data.entityId.toString(),
    },
    {
      type: TopicType.SOURCE_CONTENT,
      value: data.contentId,
    },
    {
      type: TopicType.ROOT_TARGET_ENTITY,
      value: data.rootParentEntityId.toString(),
    },
    {
      type: TopicType.ROOT_TARGET_CONTENT,
      value: data.rootParentId,
    },
  ];

  for (const mention of data.mentions) {
    topics.push({
      type: TopicType.SOURCE_TAG,
      value: mention.entityId.toString(),
    });
  }

  for (const embed of data.embeds) {
    topics.push({
      type: TopicType.SOURCE_EMBED,
      value: embed,
    });
  }

  if (data.parentId && data.parentEntityId) {
    topics.push({
      type: TopicType.TARGET_ENTITY,
      value: data.parentEntityId.toString(),
    });
    topics.push({
      type: TopicType.TARGET_CONTENT,
      value: data.parentId,
    });

    if (data.parent) {
      for (const mention of data.parent.mentions) {
        topics.push({
          type: TopicType.TARGET_TAG,
          value: mention.entityId.toString(),
        });
      }

      for (const embed of data.parent.embeds) {
        topics.push({
          type: TopicType.TARGET_EMBED,
          value: embed,
        });
      }
    }
  }

  if (data.rootParent) {
    for (const mention of data.rootParent.mentions) {
      topics.push({
        type: TopicType.ROOT_TARGET_TAG,
        value: mention.entityId.toString(),
      });
    }

    for (const embed of data.rootParent.embeds) {
      topics.push({
        type: TopicType.ROOT_TARGET_EMBED,
        value: embed,
      });
    }
  }

  if (data.channelId) {
    topics.push({
      type: TopicType.CHANNEL,
      value: data.channelId,
    });
  }

  return topics;
};
