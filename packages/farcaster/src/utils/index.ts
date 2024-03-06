import { HubRpcClient, Message, UserNameProof } from "@farcaster/hub-nodejs";
import {
  bufferToHex,
  timestampToDate,
  bufferToHexAddress,
  hexToBuffer,
} from "@nook/common/farcaster";
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
} from "@nook/common/prisma/farcaster";

export const messageToCast = (message: Message): FarcasterCast | undefined => {
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

export const messageToCastEmbedCast = (
  message: Message,
): FarcasterCastEmbedCast[] => {
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

export const messageToCastEmbedUrl = (
  message: Message,
): FarcasterCastEmbedUrl[] => {
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

export const messageToCastMentions = (
  message: Message,
): FarcasterCastMention[] => {
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

export const messageToLink = (message: Message): FarcasterLink | undefined => {
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

export const messageToCastReaction = (
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

export const messageToUrlReaction = (
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

export const messageToUserData = (
  message: Message,
): FarcasterUserData | undefined => {
  if (!message.data?.userDataBody) return;

  const fid = BigInt(message.data.fid);

  return {
    fid,
    type: message.data.userDataBody.type,
    value: message.data.userDataBody.value,
    timestamp: timestampToDate(message.data.timestamp),
    hash: bufferToHex(message.hash),
    hashScheme: message.hashScheme,
    signer: bufferToHexAddress(message.signer),
    signatureScheme: message.signatureScheme,
    signature: bufferToHex(message.signature),
  };
};

export const messageToVerification = (
  message: Message,
): FarcasterVerification | undefined => {
  if (!message.data?.verificationAddAddressBody) return;

  const fid = BigInt(message.data.fid);
  const address = bufferToHexAddress(
    message.data.verificationAddAddressBody.address,
  );

  return {
    fid,
    address,
    protocol: message.data.verificationAddAddressBody.protocol,
    verificationType: message.data.verificationAddAddressBody.verificationType,
    chainId: message.data.verificationAddAddressBody.chainId,
    claimSignature: bufferToHex(
      message.data.verificationAddAddressBody.claimSignature,
    ),
    blockHash: bufferToHex(message.data.verificationAddAddressBody.blockHash),
    timestamp: timestampToDate(message.data.timestamp),
    deletedAt: null,
    hash: bufferToHex(message.hash),
    hashScheme: message.hashScheme,
    signer: bufferToHexAddress(message.signer),
    signatureScheme: message.signatureScheme,
    signature: bufferToHex(message.signature),
  };
};

export const messageToUsernameProof = (
  message: UserNameProof,
): FarcasterUsernameProof => {
  return {
    fid: BigInt(message.fid),
    username: Buffer.from(message.name).toString(),
    owner: bufferToHexAddress(message.owner),
    signature: bufferToHex(message.signature),
    type: message.type,
    timestamp: new Date(message.timestamp * 1000),
    deletedAt: null,
  };
};

export const findRootParent = async (
  client: HubRpcClient,
  cast: FarcasterCast,
) => {
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
