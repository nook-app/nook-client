import { FARCASTER_EPOCH } from "@farcaster/hub-nodejs";
import { FidHash } from "@nook/common/types";
export * from "./events";

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
