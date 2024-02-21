import { FARCASTER_EPOCH } from "@farcaster/hub-nodejs";
import { HubRpcClient, Message } from "@farcaster/hub-nodejs";
import { FidHash } from "@nook/common/types";

export type MessageHandlerArgs = {
  client: HubRpcClient;
  message: Message;
};

export type FidHandlerArgs = {
  client: HubRpcClient;
  fid: number;
};

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

export const toFarcasterURI = ({ fid, hash }: FidHash) => {
  return `farcaster://cast/${fid}/${hash}`;
};

export const fromFarcasterURI = (uri: string) => {
  const parts = uri.split("/");
  if (parts[0] !== "farcaster:" || parts[1] !== "" || parts[2] !== "cast") {
    throw new Error("Invalid Farcaster URI format");
  }
  const fid = parts[3];
  const hash = parts[4];
  return { fid, hash } as FidHash;
};
