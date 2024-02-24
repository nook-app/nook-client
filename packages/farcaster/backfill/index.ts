import { HubRpcClient, Message, UserNameProof } from "@farcaster/hub-nodejs";
import {
  findRootParent,
  messageToCast,
  messageToCastEmbedCast,
  messageToCastEmbedUrl,
  messageToCastMentions,
  messageToCastReaction,
  messageToLink,
  messageToUrlReaction,
  messageToUserData,
  messageToUsernameProof,
  messageToVerification,
} from "../src/utils";
import {
  FarcasterCast,
  FarcasterCastEmbedCast,
  FarcasterCastEmbedUrl,
  FarcasterCastMention,
  FarcasterCastReaction,
  FarcasterLink,
  FarcasterUrlReaction,
  FarcasterUserData,
  FarcasterUsernameProof,
  FarcasterVerification,
  Prisma,
  PrismaClient,
} from "@nook/common/prisma/farcaster";

export const backfillCastAdd = async (
  prisma: PrismaClient,
  messages: Message[],
  client: HubRpcClient,
) => {
  const casts = messages.map(messageToCast).filter(Boolean) as FarcasterCast[];
  if (casts.length === 0) return [];

  const rootParents = await Promise.all(
    casts.map((cast) => findRootParent(client, cast)),
  );

  for (let i = 0; i < casts.length; i++) {
    casts[i].rootParentFid = rootParents[i].rootParentFid;
    casts[i].rootParentHash = rootParents[i].rootParentHash;
    casts[i].rootParentUrl = rootParents[i].rootParentUrl;
  }

  await prisma.farcasterCast.createMany({
    data: casts as Prisma.FarcasterCastCreateInput[],
    skipDuplicates: true,
  });

  const embedCasts = messages
    .map(messageToCastEmbedCast)
    .filter(Boolean) as FarcasterCastEmbedCast[][];

  const embedUrls = messages
    .map(messageToCastEmbedUrl)
    .filter(Boolean) as FarcasterCastEmbedUrl[][];

  const mentions = messages
    .map(messageToCastMentions)
    .filter(Boolean) as FarcasterCastMention[][];

  await prisma.farcasterCastEmbedCast.createMany({
    data: embedCasts.flat(),
    skipDuplicates: true,
  });

  await prisma.farcasterCastEmbedUrl.createMany({
    data: embedUrls.flat(),
    skipDuplicates: true,
  });

  await prisma.farcasterCastMention.createMany({
    data: mentions.flat(),
    skipDuplicates: true,
  });

  return casts;
};

export const backfillLinkAdd = async (
  prisma: PrismaClient,
  messages: Message[],
) => {
  const links = messages.map(messageToLink).filter(Boolean) as FarcasterLink[];
  if (links.length > 0) {
    await prisma.farcasterLink.createMany({
      data: links,
      skipDuplicates: true,
    });
  }
  return links;
};

export const backfillReactionAdd = async (
  prisma: PrismaClient,
  messages: Message[],
) => {
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

export const backfillUsernameProofAdd = async (
  prisma: PrismaClient,
  messages: UserNameProof[],
) => {
  const proofs = messages
    .map(messageToUsernameProof)
    .filter(Boolean) as FarcasterUsernameProof[];
  if (proofs.length > 0) {
    await prisma.farcasterUsernameProof.createMany({
      data: proofs,
      skipDuplicates: true,
    });
  }
  return proofs;
};

export const backfillUserDataAdd = async (
  prisma: PrismaClient,
  messages: Message[],
) => {
  const userDatas = messages
    .map(messageToUserData)
    .filter(Boolean) as FarcasterUserData[];
  if (userDatas.length > 0) {
    await prisma.farcasterUserData.createMany({
      data: userDatas,
      skipDuplicates: true,
    });
  }
  return userDatas;
};

export const backfillVerificationAdd = async (
  prisma: PrismaClient,
  messages: Message[],
) => {
  const verifications = messages
    .map(messageToVerification)
    .filter(Boolean) as FarcasterVerification[];
  if (verifications.length) {
    await prisma.farcasterVerification.createMany({
      data: verifications,
      skipDuplicates: true,
    });
  }
  return verifications;
};

export {
  findRootParent,
  messageToCast,
  messageToCastEmbedCast,
  messageToCastEmbedUrl,
  messageToCastMentions,
  messageToCastReaction,
  messageToLink,
  messageToUrlReaction,
  messageToUserData,
  messageToUsernameProof,
  messageToVerification,
};
