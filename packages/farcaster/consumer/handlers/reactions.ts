import { HubRpcClient, Message } from "@farcaster/hub-nodejs";
import {
  PrismaClient,
  FarcasterCastReaction,
  FarcasterUrlReaction,
} from "@flink/common/prisma/farcaster";
import {
  bufferToHex,
  timestampToDate,
  FidHandlerArgs,
  MessageHandlerArgs,
} from "../../utils";

const prisma = new PrismaClient();

export const handleReactionAdd = async (args: MessageHandlerArgs) => {
  await handleCastReactionAdd(args);
  await handleUrlReactionAdd(args);
};

export const handleReactionRemove = async (args: MessageHandlerArgs) => {
  await handleCastReactionRemove(args);
  await handleUrlReactionRemove(args);
};

const handleCastReactionAdd = async ({ message }: MessageHandlerArgs) => {
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
};

const handleUrlReactionAdd = async ({ message }: MessageHandlerArgs) => {
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
};

const handleCastReactionRemove = async ({ message }: MessageHandlerArgs) => {
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
};

const handleUrlReactionRemove = async ({ message }: MessageHandlerArgs) => {
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
};

const messageToCastReaction = (
  message: Message,
): FarcasterCastReaction | undefined => {
  if (!message.data?.reactionBody?.targetCastId) return;

  return {
    fid: BigInt(message.data.fid),
    targetFid: BigInt(message.data.reactionBody.targetCastId.fid),
    targetHash: bufferToHex(message.data.reactionBody.targetCastId.hash),
    reactionType: message.data.reactionBody.type,
    timestamp: timestampToDate(message.data.timestamp),
    deletedAt: null,
  };
};

const messageToUrlReaction = (
  message: Message,
): FarcasterUrlReaction | undefined => {
  if (!message.data?.reactionBody?.targetUrl) return;

  return {
    fid: BigInt(message.data.fid),
    targetUrl: message.data.reactionBody.targetUrl,
    reactionType: message.data.reactionBody.type,
    timestamp: timestampToDate(message.data.timestamp),
    deletedAt: null,
  };
};

export const batchHandleReactionAdd = async ({
  client,
  fid,
}: FidHandlerArgs) => {
  const messages = await client.getReactionsByFid({ fid });
  if (messages.isErr()) {
    throw new Error(messages.error.message);
  }

  const castReactions = messages.value.messages
    .map(messageToCastReaction)
    .filter(Boolean) as FarcasterCastReaction[];

  const urlReactions = messages.value.messages
    .map(messageToUrlReaction)
    .filter(Boolean) as FarcasterUrlReaction[];

  console.log(
    `[backfill] [${fid}] added ${
      castReactions.length + urlReactions.length
    } reactions`,
  );

  await prisma.farcasterCastReaction.createMany({
    data: castReactions,
    skipDuplicates: true,
  });

  await prisma.farcasterUrlReaction.createMany({
    data: urlReactions,
    skipDuplicates: true,
  });
};
