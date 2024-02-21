import { Message } from "@farcaster/hub-nodejs";
import {
  PrismaClient,
  FarcasterCastReaction,
  FarcasterUrlReaction,
} from "@nook/common/prisma/farcaster";
import {
  bufferToHex,
  timestampToDate,
  bufferToHexAddress,
} from "@nook/common/farcaster";

const prisma = new PrismaClient();

export const handleReactionAdd = async (message: Message) => {
  return (
    (await handleCastReactionAdd(message)) ||
    (await handleUrlReactionAdd(message))
  );
};

export const handleReactionRemove = async (message: Message) => {
  return (
    (await handleCastReactionRemove(message)) ||
    (await handleUrlReactionRemove(message))
  );
};

const handleCastReactionAdd = async (message: Message) => {
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

const handleUrlReactionAdd = async (message: Message) => {
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

const handleCastReactionRemove = async (message: Message) => {
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

const handleUrlReactionRemove = async (message: Message) => {
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
    hash: bufferToHex(message.hash),
    hashScheme: message.hashScheme,
    signer: bufferToHexAddress(message.signer),
    signatureScheme: message.signatureScheme,
    signature: bufferToHex(message.signature),
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
    hash: bufferToHex(message.hash),
    hashScheme: message.hashScheme,
    signer: bufferToHexAddress(message.signer),
    signatureScheme: message.signatureScheme,
    signature: bufferToHex(message.signature),
  };
};

export const backfillReactionAdd = async (messages: Message[]) => {
  const castReactions = messages
    .map(messageToCastReaction)
    .filter(Boolean) as FarcasterCastReaction[];
  if (castReactions.length > 0) {
    await prisma.farcasterCastReaction.createMany({
      data: castReactions,
      skipDuplicates: true,
    });
  }

  const urlReactions = messages
    .map(messageToUrlReaction)
    .filter(Boolean) as FarcasterUrlReaction[];
  if (urlReactions.length > 0) {
    await prisma.farcasterUrlReaction.createMany({
      data: urlReactions,
      skipDuplicates: true,
    });
  }

  return { castReactions, urlReactions };
};
