import { ContentRelation, PrismaClient } from "../prisma/relations";
import { publishContentRequests } from "../queues";
import {
  ContentRelationType,
  ContentRequest,
  EntityRelationType,
  EventService,
  PostData,
} from "../types";

const prisma = new PrismaClient();

export const handlePostRelations = async (
  contentId: string,
  data: PostData,
) => {
  const relations: ContentRelation[] = [
    {
      contentId: data.rootParentId,
      type: ContentRelationType.ROOT_PARENT_OF,
      targetContentId: contentId,
      source: EventService.FARCASTER,
    },
  ];

  const requests: ContentRequest[] = [
    {
      contentId: data.rootParentId,
      submitterId: data.rootParentEntityId.toString(),
      timestamp: data.timestamp.toString(),
    },
  ];

  for (const embed of data.embeds) {
    relations.push({
      contentId: embed,
      type: ContentRelationType.EMBED_OF,
      targetContentId: contentId,
      source: EventService.FARCASTER,
    });
    requests.push({
      submitterId: data.entityId.toString(),
      contentId: embed,
      timestamp: data.timestamp.toString(),
    });
  }

  if (data.parentId) {
    relations.push({
      contentId: data.parentId,
      type: ContentRelationType.PARENT_OF,
      targetContentId: contentId,
      source: EventService.FARCASTER,
    });
    if (data.parentEntityId) {
      requests.push({
        submitterId: data.parentEntityId?.toString(),
        contentId: data.parentId,
        timestamp: data.timestamp.toString(),
      });
    } else {
      throw Error(`Missing parentEntityId for ${contentId}`);
    }
  }

  if (data.channelId) {
    relations.push({
      contentId: data.channelId,
      type: ContentRelationType.CHANNEL_OF,
      targetContentId: contentId,
      source: EventService.FARCASTER,
    });
    requests.push({
      submitterId: data.entityId.toString(),
      contentId: data.channelId,
      timestamp: data.timestamp.toString(),
    });
  }

  await Promise.all([
    prisma.contentRelation.createMany({
      data: relations,
      skipDuplicates: true,
    }),
    publishContentRequests(requests),
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
