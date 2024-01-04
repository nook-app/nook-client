import { Message } from "@farcaster/hub-nodejs";
import { PrismaClient, FarcasterLink } from "@flink/common/prisma/farcaster";
import { timestampToDate } from "../utils";
import { FidHandlerArgs, MessageHandlerArgs } from "../types";

const prisma = new PrismaClient();

export const handleLinkAdd = async ({ message }: MessageHandlerArgs) => {
  const link = messageToLink(message);
  if (!link) return;

  await prisma.farcasterLink.upsert({
    where: {
      fid_linkType_targetFid: {
        fid: link.fid,
        linkType: link.linkType,
        targetFid: link.targetFid,
      },
    },
    create: link,
    update: link,
  });

  console.log(
    `[link-add] [${link.fid}] added ${link.linkType} to ${link.targetFid}`,
  );
};

export const handleLinkRemove = async ({ message }: MessageHandlerArgs) => {
  const link = messageToLink(message);
  if (!link) return;

  await prisma.farcasterLink.updateMany({
    where: {
      fid: link.fid,
      linkType: link.linkType,
      targetFid: link.targetFid,
    },
    data: {
      deletedAt: link.timestamp,
    },
  });

  console.log(
    `[link-remove] [${link.fid}] removed ${link.linkType} to ${link.targetFid}`,
  );
};

const messageToLink = (message: Message): FarcasterLink | undefined => {
  if (!message.data?.linkBody?.targetFid) return;
  return {
    fid: BigInt(message.data.fid),
    linkType: message.data.linkBody.type,
    targetFid: BigInt(message.data.linkBody.targetFid),
    timestamp: timestampToDate(message.data.timestamp),
    deletedAt: null,
  };
};

export const batchHandleLinkAdd = async ({ client, fid }: FidHandlerArgs) => {
  const messages = await client.getLinksByFid({ fid });
  if (messages.isErr()) {
    throw new Error(messages.error.message);
  }

  const links = messages.value.messages
    .map(messageToLink)
    .filter(Boolean) as FarcasterLink[];

  console.log(`[backfill] [${fid}] added ${links.length} links`);

  await prisma.farcasterLink.createMany({
    data: links,
    skipDuplicates: true,
  });
};
