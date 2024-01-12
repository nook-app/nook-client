import { Content, FarcasterCastData, PostData } from "@flink/common/types";
import { toFarcasterURI } from "@flink/farcaster/utils";
import { sdk } from "@flink/sdk";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import { Entity } from "@flink/common/types/entity";
import { getOrCreateEntitiesForFids } from "../entity";

export const getFarcasterPostByContentId = async (
  client: MongoClient,
  contentId: string,
) => {
  const content = await client.findContent(contentId);
  if (content) {
    return content.data as PostData;
  }

  const cast = await sdk.farcaster.getCastByURI(contentId);
  if (!cast) {
    return;
  }

  return await generateFarcasterPost(client, cast);
};

export const getFarcasterPostByData = async (
  client: MongoClient,
  cast: FarcasterCastData,
) => {
  const content = await client.findContent(toFarcasterURI(cast));
  if (content) {
    return content.data as PostData;
  }

  return await generateFarcasterPost(client, cast);
};

export const generateFarcasterPostByContentId = async (
  client: MongoClient,
  contentId: string,
) => {
  const cast = await sdk.farcaster.getCastByURI(contentId);
  if (!cast) {
    return;
  }

  return await generateFarcasterPost(client, cast);
};

const generateFarcasterPost = async (
  client: MongoClient,
  cast: FarcasterCastData,
): Promise<PostData> => {
  if (!cast.parentHash) {
    const identities = await getOrCreateEntitiesForFids(
      client,
      extractFidsFromCasts([cast]),
    );
    return transformCast(cast, identities);
  }

  const { existingParent, existingRoot, newParent, newRoot } =
    await getParentAndRootCasts(client, cast);

  const casts = [cast];
  if (newParent) casts.push(newParent);
  if (newRoot) casts.push(newRoot);

  const identities = await getOrCreateEntitiesForFids(
    client,
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

  return data;
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
  fidToEntity: Record<string, Entity>,
): PostData => {
  return {
    text: cast.text,
    timestamp: cast.timestamp,
    entityId: fidToEntity[cast.fid]._id,
    mentions: cast.mentions.map(({ mention, mentionPosition }) => ({
      entityId: fidToEntity[mention]._id,
      position: parseInt(mentionPosition),
    })),
    embeds: cast.embeds,
    channelId: cast.rootParentUrl,
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
