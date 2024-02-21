import { Message } from "@farcaster/hub-nodejs";
import { PrismaClient, FarcasterLink } from "@nook/common/prisma/farcaster";
import {
  timestampToDate,
  bufferToHex,
  bufferToHexAddress,
} from "@nook/common/farcaster";

const prisma = new PrismaClient();

export const handleLinkAdd = async (message: Message) => {
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

  return link;
};

export const handleLinkRemove = async (message: Message) => {
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

  return link;
};

const messageToLink = (message: Message): FarcasterLink | undefined => {
  if (!message.data?.linkBody?.targetFid) return;
  return {
    fid: BigInt(message.data.fid),
    linkType: message.data.linkBody.type,
    targetFid: BigInt(message.data.linkBody.targetFid),
    timestamp: timestampToDate(message.data.timestamp),
    deletedAt: null,
    hash: bufferToHex(message.hash),
    hashScheme: message.hashScheme,
    signer: bufferToHexAddress(message.signer),
    signatureScheme: message.signatureScheme,
    signature: bufferToHex(message.signature),
  };
};

export const backfillLinkAdd = async (messages: Message[]) => {
  const links = messages.map(messageToLink).filter(Boolean) as FarcasterLink[];
  if (links.length > 0) {
    await prisma.farcasterLink.createMany({
      data: links,
      skipDuplicates: true,
    });
  }
  return links;
};
