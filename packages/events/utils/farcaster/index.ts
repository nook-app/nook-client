import { toFarcasterURI } from "@nook/common/farcaster";
import {
  Content,
  ContentType,
  Entity,
  FarcasterCastData,
  PostData,
  Topic,
  TopicType,
} from "@nook/common/types";
export * from "./transformers";

export const formatPostContent = (
  cast: FarcasterCastData,
  entities: Record<string, Entity>,
  contents: Record<string, Content<PostData>>,
) => {
  const content = formatContent(cast, entities);

  // Add parent if this is a reply
  if (cast.parentFid && cast.parentHash) {
    const parentId = toFarcasterURI({
      fid: cast.parentFid,
      hash: cast.parentHash,
    });
    content.data.parentId = parentId;
    const parent = contents[parentId];
    if (parent) {
      content.data.parent = parent.data;
      content.data.parentEntityId = parent.data.entityId;
      content.data.parent.parent = undefined;
      content.data.parent.rootParent = undefined;
    }
  }

  // Add root if this is not the root
  if (cast.rootParentHash !== cast.hash) {
    const rootParentId = toFarcasterURI({
      fid: cast.rootParentFid,
      hash: cast.rootParentHash,
    });
    const rootParent = contents[rootParentId];
    content.data.rootParentId = rootParentId;
    if (rootParent) {
      content.data.rootParent = rootParent.data;
      content.data.rootParentEntityId = rootParent.data.entityId;
    }
  }

  return content;
};

const formatContent = (
  cast: FarcasterCastData,
  entities: Record<string, Entity>,
): Content<PostData> => {
  const data = formatPost(cast, entities);

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
    },
    topics: generateTopicsForPost(data),
    referencedEntityIds: Array.from(
      new Set([
        data.entityId,
        data.parentEntityId,
        data.rootParentEntityId,
        ...data.mentions.map(({ entityId }) => entityId),
      ]),
    ).filter(Boolean) as string[],
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

const formatPost = (
  cast: FarcasterCastData,
  entities: Record<string, Entity>,
): PostData => {
  return {
    contentId: toFarcasterURI(cast),
    text: cast.text,
    timestamp: new Date(cast.timestamp),
    entityId: entities[cast.fid]._id.toString(),
    mentions: cast.mentions.map(({ mention, mentionPosition }) => ({
      entityId: entities[mention]._id.toString(),
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
    rootParentEntityId: entities[cast.rootParentFid]._id.toString(),
  };
};

const generateTopicsForPost = (data: PostData) => {
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

export const extractFidFromCast = (cast: FarcasterCastData) => {
  const fids = [cast.fid];

  if (cast.parentFid && !fids.includes(cast.parentFid)) {
    fids.push(cast.parentFid);
  }

  if (cast.rootParentFid && !fids.includes(cast.rootParentFid)) {
    fids.push(cast.rootParentFid);
  }

  for (const mention of cast.mentions) {
    if (!fids.includes(mention.mention)) {
      fids.push(mention.mention);
    }
  }

  return fids;
};

export const extractRelatedCastsFromCast = (cast: FarcasterCastData) => {
  const relatedCasts = [];

  if (cast.parentFid && cast.parentHash) {
    relatedCasts.push(
      toFarcasterURI({
        fid: cast.parentFid,
        hash: cast.parentHash,
      }),
    );
  }

  if (cast.rootParentHash !== cast.hash) {
    relatedCasts.push(
      toFarcasterURI({
        fid: cast.rootParentFid,
        hash: cast.rootParentHash,
      }),
    );
  }

  return relatedCasts;
};
