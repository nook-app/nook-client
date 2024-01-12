import { ObjectId } from "mongodb";
import { ContentRelation, PrismaClient } from "../prisma/relations";
import { publishContentRequests } from "../queues";
import {
  Content,
  ContentRelationType,
  EntityRelationType,
  EventService,
  PostData,
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
    source: EventService.FARCASTER,
  }));

  relations.push({
    contentId: data.rootParentId,
    type: ContentRelationType.ROOT_PARENT_OF,
    targetContentId: contentId,
    source: EventService.FARCASTER,
  });

  if (data.parentId) {
    relations.push({
      contentId: data.parentId,
      type: ContentRelationType.PARENT_OF,
      targetContentId: contentId,
      source: EventService.FARCASTER,
    });
  }

  if (data.channelId) {
    relations.push({
      contentId: data.channelId,
      type: ContentRelationType.CHANNEL_OF,
      targetContentId: contentId,
      source: EventService.FARCASTER,
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

export const handleFollowRelation = async (
  entityId: string,
  targetEntityId: string,
  isUnfollow = false,
) => {
  const data = {
    entityId,
    targetEntityId,
    source: EventService.FARCASTER,
    type: EntityRelationType.FOLLOWER_OF,
  };
  if (isUnfollow) {
    await prisma.entityRelation.deleteMany({
      where: data,
    });
  } else {
    await prisma.entityRelation.upsert({
      where: {
        entityId_type_source_targetEntityId: data,
      },
      create: data,
      update: data,
    });
  }
};
