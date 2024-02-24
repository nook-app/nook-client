import { Message } from "@farcaster/hub-nodejs";
import { PrismaClient } from "@nook/common/prisma/farcaster";
import { messageToCastReaction, messageToUrlReaction } from "../utils";

export const handleReactionAdd = async (
  prisma: PrismaClient,
  message: Message,
) => {
  return (
    (await handleCastReactionAdd(prisma, message)) ||
    (await handleUrlReactionAdd(prisma, message))
  );
};

export const handleReactionRemove = async (
  prisma: PrismaClient,
  message: Message,
) => {
  return (
    (await handleCastReactionRemove(prisma, message)) ||
    (await handleUrlReactionRemove(prisma, message))
  );
};

const handleCastReactionAdd = async (
  prisma: PrismaClient,
  message: Message,
) => {
  const reaction = messageToCastReaction(message);
  if (!reaction) return;

  await prisma.farcasterCastReaction.upsert({
    where: {
      targetHash_reactionType_fid: {
        targetHash: reaction.targetHash,
        reactionType: reaction.reactionType,
        fid: reaction.fid,
      },
    },
    create: reaction,
    update: reaction,
  });

  console.log(
    `[reaction-add] [${reaction.fid}] added ${reaction.reactionType} from ${reaction.targetHash}`,
  );

  return reaction;
};

const handleUrlReactionAdd = async (prisma: PrismaClient, message: Message) => {
  const reaction = messageToUrlReaction(message);
  if (!reaction) return;

  await prisma.farcasterUrlReaction.upsert({
    where: {
      targetUrl_reactionType_fid: {
        targetUrl: reaction.targetUrl,
        reactionType: reaction.reactionType,
        fid: reaction.fid,
      },
    },
    create: reaction,
    update: reaction,
  });

  console.log(
    `[reaction-add] [${reaction.fid}] added ${reaction.reactionType} from ${reaction.targetUrl}`,
  );

  return reaction;
};

const handleCastReactionRemove = async (
  prisma: PrismaClient,
  message: Message,
) => {
  const reaction = messageToCastReaction(message);
  if (!reaction) return;

  await prisma.farcasterCastReaction.updateMany({
    where: {
      targetHash: reaction.targetHash,
      reactionType: reaction.reactionType,
      fid: reaction.fid,
    },
    data: {
      deletedAt: reaction.timestamp,
    },
  });

  console.log(
    `[reaction-remove] [${reaction.fid}] removed ${reaction.reactionType} from ${reaction.targetHash}`,
  );

  return reaction;
};

const handleUrlReactionRemove = async (
  prisma: PrismaClient,
  message: Message,
) => {
  const reaction = messageToUrlReaction(message);
  if (!reaction) return;

  await prisma.farcasterUrlReaction.updateMany({
    where: {
      targetUrl: reaction.targetUrl,
      reactionType: reaction.reactionType,
      fid: reaction.fid,
    },
    data: {
      deletedAt: reaction.timestamp,
    },
  });

  console.log(
    `[reaction-remove] [${reaction.fid}] removed ${reaction.reactionType} from ${reaction.targetUrl}`,
  );

  return reaction;
};
