import { Message } from "@farcaster/hub-nodejs";
import { PrismaClient, FarcasterLink } from "@flink/common/prisma/farcaster";
import {
  timestampToDate,
  FidHandlerArgs,
  MessageHandlerArgs,
} from "../../utils";
import {
  EventService,
  EventType,
  FarcasterLinkData,
  RawEvent,
} from "@flink/common/types";
import { publishRawEvent, publishRawEvents } from "@flink/common/queues";

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

  const event = transformToLinkEvent(EventType.LINK_ADD, link);
  await publishRawEvent(event);
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

  const event = transformToLinkEvent(EventType.LINK_REMOVE, link);
  await publishRawEvent(event);
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

export const backfillLinks = async (messages: Message[]) => {
  const links = messages.map(messageToLink).filter(Boolean) as FarcasterLink[];
  await prisma.farcasterLink.createMany({
    data: links,
    skipDuplicates: true,
  });

  await publishRawEvents(
    links.map((link) => transformToLinkEvent(EventType.LINK_ADD, link)),
    true,
  );
};

const transformToLinkEvent = (
  type: EventType,
  link: FarcasterLink,
): RawEvent<FarcasterLinkData> => {
  return {
    eventId: `${type}-${link.fid}-${link.linkType}-${link.targetFid}`,
    source: {
      service: EventService.FARCASTER,
      type,
      id: `${link.fid}-${link.linkType}-${link.targetFid}`,
      userId: link.fid.toString(),
    },
    timestamp: link.timestamp,
    data: {
      fid: link.fid.toString(),
      linkType: link.linkType,
      targetFid: link.targetFid.toString(),
      timestamp: link.timestamp.getTime(),
    },
  };
};
