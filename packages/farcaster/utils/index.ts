import { FARCASTER_EPOCH } from "@farcaster/hub-nodejs";

export const timestampToDate = (timestamp: number) =>
  new Date(timestamp * 1000 + FARCASTER_EPOCH);

export const bufferToHex = (buffer: Uint8Array) => {
  return `0x${Buffer.from(buffer).toString("hex").toLowerCase()}`;
};

export const hexToBuffer = (hex: string) => {
  return new Uint8Array(Buffer.from(hex.slice(2), "hex"));
};
