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
  hexToBuffer,
} from "../../utils";
import { publishRawEvent, publishRawEvents } from "@flink/common/events";
import {
  EventService,
  EventType,
  FarcasterCastReactionData,
  FarcasterReactionType,
  FarcasterUrlReactionData,
  FidHash,
  RawEvent,
} from "@flink/common/types";

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

  const event = transformToCastReactionEvent(
    EventType.CAST_REACTION_ADD,
    reaction,
  );
  await publishRawEvent(event);
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

  const event = transformToUrlReactionEvent(
    EventType.URL_REACTION_ADD,
    reaction,
  );
  await publishRawEvent(event);
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

  const event = transformToCastReactionEvent(
    EventType.CAST_REACTION_REMOVE,
    reaction,
  );
  await publishRawEvent(event);
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

  const event = transformToUrlReactionEvent(
    EventType.URL_REACTION_REMOVE,
    reaction,
  );
  await publishRawEvent(event);
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

export const backfillCastReactions = async (
  client: HubRpcClient,
  fidHashes: FidHash[],
) => {
  const messages = (
    await Promise.all(
      fidHashes.map(async ({ fid, hash }) => {
        const message = await client.getReactionsByCast({
          targetCastId: {
            fid: parseInt(fid),
            hash: hexToBuffer(hash),
          },
        });

        if (message.isErr()) {
          return undefined;
        }

        return message.value.messages;
      }),
    )
  )
    .filter(Boolean)
    .flat();

  const castReactions = messages
    .map(messageToCastReaction)
    .filter(Boolean) as FarcasterCastReaction[];

  await prisma.farcasterCastReaction.createMany({
    data: castReactions,
    skipDuplicates: true,
  });

  await publishRawEvents(
    castReactions.map((reaction) =>
      transformToCastReactionEvent(EventType.CAST_REACTION_ADD, reaction, true),
    ),
  );
};

const transformToCastReactionEvent = (
  type: EventType,
  reaction: FarcasterCastReaction,
  backfill = false,
): RawEvent<FarcasterCastReactionData> => {
  let reactionType = FarcasterReactionType.NONE;
  if (reaction.reactionType === 1) {
    reactionType = FarcasterReactionType.LIKE;
  } else if (reaction.reactionType === 2) {
    reactionType = FarcasterReactionType.RECAST;
  }

  return {
    source: {
      service: EventService.FARCASTER,
      type,
      id: `${reaction.fid}-${reaction.targetHash}-${reaction.reactionType}`,
      userId: reaction.fid.toString(),
    },
    timestamp: reaction.timestamp,
    data: {
      timestamp: reaction.timestamp.getTime(),
      fid: reaction.fid.toString(),
      reactionType,
      targetFid: reaction.targetFid.toString(),
      targetHash: reaction.targetHash,
    },
    backfill,
  };
};

const transformToUrlReactionEvent = (
  type: EventType,
  reaction: FarcasterUrlReaction,
  backfill = false,
): RawEvent<FarcasterUrlReactionData> => {
  let reactionType = FarcasterReactionType.NONE;
  if (reaction.reactionType === 1) {
    reactionType = FarcasterReactionType.LIKE;
  } else if (reaction.reactionType === 2) {
    reactionType = FarcasterReactionType.RECAST;
  }

  return {
    source: {
      service: EventService.FARCASTER,
      type,
      id: `${reaction.fid}-${reaction.targetUrl}-${reaction.reactionType}`,
      userId: reaction.fid.toString(),
    },
    timestamp: reaction.timestamp,
    data: {
      timestamp: reaction.timestamp.getTime(),
      fid: reaction.fid.toString(),
      reactionType,
      url: reaction.targetUrl,
    },
    backfill,
  };
};
