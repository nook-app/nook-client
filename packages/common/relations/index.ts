import { ContentRelation, PrismaClient } from "../prisma/relations";
import { publishContentRequests } from "../queues";
import {
  Content,
  ContentRelationType,
  PostData,
  RelationSource,
} from "../types";

const prisma = new PrismaClient();

export const handlePostRelations = async ({
  contentId,
  data,
}: Content<PostData>) => {
  const relations: ContentRelation[] = data.embeds.map((embed) => ({
    contentId: embed,
    type: ContentRelationType.EMBED_OF,
    targetContentId: contentId,
    source: RelationSource.FARCASTER,
  }));

  relations.push({
    contentId: data.rootParentId,
    type: ContentRelationType.ROOT_PARENT_OF,
    targetContentId: contentId,
    source: RelationSource.FARCASTER,
  });

  if (data.parentId) {
    relations.push({
      contentId: data.parentId,
      type: ContentRelationType.PARENT_OF,
      targetContentId: contentId,
      source: RelationSource.FARCASTER,
    });
  }

  if (data.channelId) {
    relations.push({
      contentId: data.channelId,
      type: ContentRelationType.CHANNEL_OF,
      targetContentId: contentId,
      source: RelationSource.FARCASTER,
    });
  }

  await Promise.all([
    prisma.contentRelation.createMany({
      data: relations,
      skipDuplicates: true,
    }),
    publishContentRequests(relations.map((r) => ({ contentId: r.contentId }))),
  ]);
};
