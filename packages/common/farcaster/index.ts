import { FARCASTER_EPOCH } from "@farcaster/hub-nodejs";
import {
  FarcasterCast,
  FarcasterCastEmbedCast,
  FarcasterCastMention,
  Prisma,
} from "../prisma/farcaster";
export * from "./events";
export * from "./notifications";
export * from "./message";

export const timestampToDate = (timestamp: number) =>
  new Date(timestamp * 1000 + FARCASTER_EPOCH);

export const bufferToHex = (buffer: Uint8Array) => {
  return `0x${Buffer.from(buffer).toString("hex").toLowerCase()}`;
};

export const bufferToHexAddress = (buffer: Uint8Array) => {
  return `0x${Buffer.from(buffer)
    .toString("hex")
    .toLowerCase()
    .padStart(40, "0")}`;
};

export const hexToBuffer = (hex: string) => {
  return new Uint8Array(Buffer.from(hex.slice(2), "hex"));
};

export const getProtocolString = (protocol: number) => {
  if (protocol === 0) {
    return "ETHEREUM";
  }
  if (protocol === 1) {
    return "SOLANA";
  }
  throw new Error(`Unknown protocol: ${protocol}`);
};

export const getUsernameTypeString = (type: number) => {
  if (type === 1) {
    return "FNAME";
  }
  if (type === 2) {
    return "ENS";
  }
  throw new Error(`Unknown username type: ${type}`);
};

export const getMentions = (data: FarcasterCast) => {
  const mentions = [];
  if (
    data.rawMentions &&
    (data.rawMentions as unknown) !== Prisma.DbNull &&
    Array.isArray(data.rawMentions)
  ) {
    for (const mention of data.rawMentions as unknown as FarcasterCastMention[]) {
      mentions.push({
        fid: mention.mention.toString(),
        position: mention.mentionPosition.toString(),
      });
    }
  }
  return mentions;
};

export const getEmbedUrls = (data: FarcasterCast) => {
  const embeds: string[] = [];
  if (
    data.rawUrlEmbeds &&
    (data.rawUrlEmbeds as unknown) !== Prisma.DbNull &&
    Array.isArray(data.rawUrlEmbeds)
  ) {
    for (const url of data.rawUrlEmbeds as string[]) {
      embeds.push(url);
    }
  }
  return embeds;
};

export const getCastEmbeds = (data: FarcasterCast) => {
  const embeds = [];
  if (
    data.rawCastEmbeds &&
    (data.rawCastEmbeds as unknown) !== Prisma.DbNull &&
    Array.isArray(data.rawCastEmbeds)
  ) {
    for (const embed of data.rawCastEmbeds as unknown as FarcasterCastEmbedCast[]) {
      embeds.push({ fid: embed.embedFid, hash: embed.embedHash });
    }
  }
  return embeds;
};
