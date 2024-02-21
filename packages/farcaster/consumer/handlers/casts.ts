import { HubRpcClient, Message } from "@farcaster/hub-nodejs";
import {
  bufferToHex,
  hexToBuffer,
  timestampToDate,
  bufferToHexAddress,
} from "@nook/common/farcaster";
import {
  FarcasterCast,
  FarcasterCastEmbedCast,
  FarcasterCastEmbedUrl,
  FarcasterCastMention,
  PrismaClient,
  Prisma,
} from "@nook/common/prisma/farcaster";

const prisma = new PrismaClient();

export const handleCastAdd = async (message: Message, client: HubRpcClient) => {
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

export const handleCastRemove = async (message: Message) => {
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

const messageToCast = (message: Message): FarcasterCast | undefined => {
  if (!message.data?.castAddBody) return;

  const hash = bufferToHex(message.hash);
  const fid = BigInt(message.data.fid);
  const parentCast = message.data.castAddBody.parentCastId;

  let rawMentions = null;
  let rawCastEmbeds = null;
  let rawUrlEmbeds = null;

  if (message.data.castAddBody.mentions.length > 0) {
    const mentionPositions = message.data.castAddBody.mentionsPositions;
    rawMentions = message.data.castAddBody.mentions.map((m, i) => ({
      mention: m,
      mentionPosition: mentionPositions[i],
    }));
  }

  if (message.data.castAddBody.embedsDeprecated.length > 0) {
    rawUrlEmbeds = message.data.castAddBody.embedsDeprecated;
  }

  if (message.data.castAddBody.embeds.length > 0) {
    for (const embed of message.data.castAddBody.embeds) {
      if (embed.castId) {
        if (rawCastEmbeds === null) rawCastEmbeds = [];
        rawCastEmbeds.push({
          embedHash: bufferToHex(embed.castId.hash),
          embedFid: BigInt(embed.castId.fid),
        });
      } else {
        if (rawUrlEmbeds === null) rawUrlEmbeds = [];
        rawUrlEmbeds.push(embed.url);
      }
    }
  }

  return {
    hash,
    fid,
    text: message.data.castAddBody.text,
    parentHash: parentCast ? bufferToHex(parentCast.hash) : null,
    parentFid: parentCast ? BigInt(parentCast.fid) : null,
    parentUrl: message.data.castAddBody.parentUrl || null,
    rootParentHash: parentCast ? bufferToHex(parentCast.hash) : hash,
    rootParentFid: parentCast ? BigInt(parentCast.fid) : fid,
    rootParentUrl: message.data.castAddBody.parentUrl || null,
    timestamp: timestampToDate(message.data.timestamp),
    deletedAt: null,
    rawMentions: (rawMentions || Prisma.DbNull) as Prisma.JsonValue,
    rawCastEmbeds: (rawCastEmbeds ||
      Prisma.DbNull) as unknown as Prisma.JsonValue,
    rawUrlEmbeds: (rawUrlEmbeds || Prisma.DbNull) as Prisma.JsonValue,
    hashScheme: message.hashScheme,
    signer: bufferToHexAddress(message.signer),
    signatureScheme: message.signatureScheme,
    signature: bufferToHex(message.signature),
  };
};

const messageToCastEmbedCast = (message: Message): FarcasterCastEmbedCast[] => {
  if (!message.data?.castAddBody) return [];
  const embeds = message.data.castAddBody.embeds;
  if (embeds.length === 0) return [];

  const hash = bufferToHex(message.hash);
  const fid = BigInt(message.data.fid);
  const timestamp = timestampToDate(message.data.timestamp);

  const embedCasts = [];
  for (const embed of embeds) {
    if (!embed.castId) continue;
    embedCasts.push({
      hash,
      fid,
      embedHash: bufferToHex(embed.castId.hash),
      embedFid: BigInt(embed.castId.fid),
      timestamp: timestamp,
      deletedAt: null,
    });
  }

  return embedCasts;
};

const messageToCastEmbedUrl = (message: Message): FarcasterCastEmbedUrl[] => {
  if (!message.data?.castAddBody) return [];

  const hash = bufferToHex(message.hash);
  const fid = BigInt(message.data.fid);
  const timestamp = timestampToDate(message.data.timestamp);

  const embedUrls = [];

  const embedsDeprecated = message.data.castAddBody.embedsDeprecated;
  for (const url of embedsDeprecated) {
    embedUrls.push({
      hash,
      fid,
      url,
      timestamp: timestamp,
      deletedAt: null,
    });
  }

  const embeds = message.data.castAddBody.embeds;
  for (const embed of embeds) {
    if (!embed.url) continue;
    embedUrls.push({
      hash,
      fid,
      url: embed.url,
      timestamp: timestamp,
      deletedAt: null,
    });
  }

  return embedUrls;
};

const messageToCastMentions = (message: Message): FarcasterCastMention[] => {
  if (!message.data?.castAddBody) return [];

  const mentionPositions = message.data.castAddBody.mentionsPositions;
  const mentions = message.data.castAddBody.mentions.map((m, i) => ({
    mention: m,
    mentionPosition: mentionPositions[i],
  }));
  if (mentions.length === 0) return [];

  const hash = bufferToHex(message.hash);
  const fid = BigInt(message.data.fid);
  const timestamp = timestampToDate(message.data.timestamp);

  const castMentions = [];
  for (const mention of mentions) {
    castMentions.push({
      hash,
      fid,
      mention: BigInt(mention.mention),
      mentionPosition: BigInt(mention.mentionPosition),
      timestamp: timestamp,
      deletedAt: null,
    });
  }

  return castMentions;
};

const findRootParent = async (client: HubRpcClient, cast: FarcasterCast) => {
  let hash = hexToBuffer(cast.hash);
  let fid = Number(cast.fid);
  let url = cast.parentUrl;

  while (true) {
    const currentCast = await client.getCast({ hash, fid });
    if (currentCast.isErr()) break;
    if (currentCast.value.data?.castAddBody?.parentCastId) {
      hash = currentCast.value.data.castAddBody.parentCastId.hash;
      fid = Number(currentCast.value.data.castAddBody.parentCastId.fid);
    } else {
      if (currentCast.value.data?.castAddBody?.parentUrl) {
        url = currentCast.value.data.castAddBody.parentUrl;
      }
      break;
    }
  }

  return {
    rootParentFid: BigInt(fid),
    rootParentHash: bufferToHex(hash),
    rootParentUrl: url,
  };
};

export const backfillCastAdd = async (
  client: HubRpcClient,
  messages: Message[],
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
