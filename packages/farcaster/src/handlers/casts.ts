import { HubRpcClient, Message } from "@farcaster/hub-nodejs";
import { bufferToHex, timestampToDate } from "@nook/common/farcaster";
import { PrismaClient, Prisma } from "@nook/common/prisma/farcaster";
import {
  findRootParent,
  messageToCast,
  messageToCastEmbedCast,
  messageToCastEmbedUrl,
  messageToCastMentions,
} from "../utils";

export const handleCastAdd = async (
  prisma: PrismaClient,
  message: Message,
  client: HubRpcClient,
) => {
  const cast = messageToCast(message);
  if (!cast) return;

  if (cast.parentHash) {
    const { rootParentFid, rootParentHash, rootParentUrl } =
      await findRootParent(client, cast);
    cast.rootParentFid = rootParentFid;
    cast.rootParentHash = rootParentHash;
    cast.rootParentUrl = rootParentUrl;
  }

  await prisma.farcasterCast.upsert({
    where: {
      hash: cast.hash,
    },
    create: cast as Prisma.FarcasterCastCreateInput,
    update: cast as Prisma.FarcasterCastCreateInput,
  });

  const embedCasts = messageToCastEmbedCast(message);

  for (const embedCast of embedCasts) {
    await prisma.farcasterCastEmbedCast.upsert({
      where: {
        hash_embedHash: {
          hash: embedCast.hash,
          embedHash: embedCast.embedHash,
        },
      },
      create: embedCast,
      update: embedCast,
    });
  }

  const embedUrls = messageToCastEmbedUrl(message);

  for (const embedUrl of embedUrls) {
    await prisma.farcasterCastEmbedUrl.upsert({
      where: {
        hash_url: {
          hash: embedUrl.hash,
          url: embedUrl.url,
        },
      },
      create: embedUrl,
      update: embedUrl,
    });
  }

  const mentions = messageToCastMentions(message);

  for (const mention of mentions) {
    await prisma.farcasterCastMention.upsert({
      where: {
        hash_mention_mentionPosition: {
          hash: mention.hash,
          mention: mention.mention,
          mentionPosition: mention.mentionPosition,
        },
      },
      create: mention,
      update: mention,
    });
  }

  console.log(`[cast-add] [${cast.fid}] added ${cast.hash}`);

  return cast;
};

export const handleCastRemove = async (
  prisma: PrismaClient,
  message: Message,
) => {
  if (!message.data?.castRemoveBody) return;

  const hash = bufferToHex(message.data.castRemoveBody.targetHash);
  const deletedAt = timestampToDate(message.data.timestamp);

  await prisma.farcasterCast.updateMany({
    where: { hash },
    data: { deletedAt },
  });

  await prisma.farcasterCastEmbedCast.updateMany({
    where: { hash },
    data: { deletedAt },
  });

  await prisma.farcasterCastEmbedUrl.updateMany({
    where: { hash },
    data: { deletedAt },
  });

  await prisma.farcasterCastMention.updateMany({
    where: { hash },
    data: { deletedAt },
  });

  console.log(`[cast-remove] [${message.data?.fid}] removed ${hash}`);

  return await prisma.farcasterCast.findUnique({ where: { hash } });
};
